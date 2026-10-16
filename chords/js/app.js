// Chord Finder — UI.
import {
  ANALYSIS_RATE, NOTE_NAMES, QUALITIES, SIMPLIFY, SIMPLE_QUALITIES,
  chordName, beatSync, decodeChords, refineQualities, rescaleBeats, trackBeats,
} from "./analysis.js";
import { voicing, suggestCapo, diagramSVG } from "./guitar.js";

const $ = (id) => document.getElementById(id);
const mod12 = (n) => ((n % 12) + 12) % 12;
const fmtTime = (s) => { s = Math.max(0, s | 0); return `${(s / 60) | 0}:${String(s % 60).padStart(2, "0")}`; };
// Circle-of-fifths hue so related chords get neighbouring colours.
const rootHue = (r) => ((r * 7) % 12) * 30 + 20;
const chordColor = (r, q) => (r < 0 ? "var(--surface-3)" : `oklch(${q === "maj" || q === "7" || q === "maj7" || q.startsWith("sus") ? 0.74 : 0.62} 0.11 ${rootHue(r)})`);

const state = {
  name: "", fileKey: "", url: null,
  feat: null, rawBeats: [], bpmRaw: 0, tempoFactor: 1,
  beats: [], segs: [], simple: [], full: [], key: null,
  mode: "simple", transpose: 0, capo: 0, capoAuto: true, bpb: 4,
  edits: {}, // beatIndex → {root, quality}
  bars: [], loop: null, selectStart: null,
  following: true, lastBeat: -1,
};

/* ------------------------------------------------------------------ */
/* Loading                                                              */
/* ------------------------------------------------------------------ */

const drop = $("drop"), fileInput = $("file");
drop.addEventListener("click", (e) => { if (e.target !== fileInput) { e.preventDefault(); fileInput.click(); } });
drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
fileInput.addEventListener("change", () => fileInput.files[0] && load(fileInput.files[0]));
["dragenter", "dragover"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => document.addEventListener(ev, (e) => { e.preventDefault(); if (ev === "drop" || e.target === document.documentElement) drop.classList.remove("over"); }));
document.addEventListener("drop", (e) => { const f = e.dataTransfer?.files?.[0]; if (f) load(f); });
$("new-song").addEventListener("click", () => { audio.pause(); showStart(); fileInput.value = ""; fileInput.click(); });

function showStart() {
  $("start").hidden = false; $("result").hidden = true; $("transport").hidden = true; $("new-song").hidden = true;
  $("progress").hidden = true; $("drop").hidden = false; $("error").hidden = true;
}

function setStage(stage, p) {
  $("progress-bar").style.width = `${Math.round(p * 100)}%`;
  const order = ["decode", "rhythm", "harmony", "beats", "chart"];
  const idx = order.indexOf(stage);
  $("stages").querySelectorAll("li").forEach((li, i) => {
    li.classList.toggle("done", i < idx);
    li.classList.toggle("active", i === idx);
  });
}

async function load(file) {
  $("error").hidden = true;
  $("start").hidden = false; $("result").hidden = true; $("transport").hidden = true;
  $("drop").hidden = true; $("progress").hidden = false;
  $("progress-name").textContent = file.name;
  setStage("decode", 0.02);
  try {
    const buf = await file.arrayBuffer();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const decoded = await new Promise((res, rej) => ctx.decodeAudioData(buf.slice(0), res, rej));
    ctx.close?.();
    if (decoded.duration < 5) throw new Error("That clip is too short. Use at least a few seconds of music.");
    if (decoded.duration > 20 * 60) throw new Error("That file is over 20 minutes. Try a single song.");
    setStage("decode", 0.08);
    const { samples, rate } = await toMono(decoded);

    const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    const result = await new Promise((res, rej) => {
      worker.onmessage = (e) => {
        const m = e.data;
        if (m.type === "progress") setStage(m.stage, 0.1 + 0.88 * m.p);
        else if (m.type === "done") res(m);
        else if (m.type === "error") rej(new Error(m.message));
      };
      worker.onerror = (e) => rej(new Error(e.message || "Analysis failed"));
      worker.postMessage({ samples, sampleRate: rate }, [samples.buffer]);
    });
    worker.terminate();

    if (state.url) URL.revokeObjectURL(state.url);
    state.url = URL.createObjectURL(file);
    state.name = file.name.replace(/\.[^.]+$/, "");
    state.fileKey = `chords:${file.name}:${file.size}`;
    state.feat = result.feat;
    state.rawBeats = result.beats;
    state.bpmRaw = result.bpm;
    Object.assign(state, { tempoFactor: 1, mode: "simple", transpose: 0, capoAuto: true, bpb: 4, edits: {}, loop: null, selectStart: null, lastBeat: -1 });
    restoreSaved();
    setStage("chart", 1);
    analyseBeats();
    showResult();
  } catch (err) {
    console.error(err);
    $("progress").hidden = true; $("drop").hidden = false;
    const msg = /decode|EncodingError|Unable/i.test(String(err && (err.name + err.message)))
      ? "This browser couldn't decode that file. Try an MP3, M4A or WAV."
      : (err && err.message) || "Something went wrong.";
    $("error").textContent = msg; $("error").hidden = false;
  }
}

// Mix to mono at the analysis rate. Uses the browser's resampler when it can.
async function toMono(decoded) {
  try {
    const len = Math.ceil(decoded.duration * ANALYSIS_RATE);
    const off = new OfflineAudioContext(1, len, ANALYSIS_RATE);
    const src = off.createBufferSource();
    src.buffer = decoded; src.connect(off.destination); src.start();
    const out = await off.startRendering();
    return { samples: out.getChannelData(0).slice(), rate: ANALYSIS_RATE };
  } catch {
    const n = decoded.length, ch = decoded.numberOfChannels;
    const mono = new Float32Array(n);
    for (let c = 0; c < ch; c++) { const d = decoded.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / ch; }
    return { samples: mono, rate: decoded.sampleRate };
  }
}

/* ------------------------------------------------------------------ */
/* Analysis → chart model                                               */
/* ------------------------------------------------------------------ */

function analyseBeats() {
  const f = state.tempoFactor;
  if (f === 1) state.beats = state.rawBeats;
  else if (f === 0.5 || f === 2) state.beats = rescaleBeats(state.rawBeats, f, state.feat.duration);
  else state.beats = trackBeats(state.feat, state.bpmRaw * f).beats;
  state.segs = beatSync(state.feat, state.beats);
  const simple = decodeChords(state.segs, { qualities: SIMPLE_QUALITIES });
  state.simple = simple.labels;
  state.full = refineQualities(state.segs, simple.labels);
  state.key = simple.key;
  if (state.capoAuto) state.capo = suggestCapo(usage());
}

const bpm = () => state.bpmRaw * state.tempoFactor;

// Sounding chord at beat i (before capo), with edits and transpose applied.
function chordAt(i) {
  const base = state.edits[i] || (state.mode === "full" ? state.full[i] : state.simple[i]);
  if (!base) return { root: -1, quality: "maj" };
  let q = base.quality;
  if (state.mode === "simple" && !state.edits[i]) q = SIMPLIFY[q];
  return { root: base.root < 0 ? -1 : mod12(base.root + state.transpose), quality: q };
}
const label = (c) => (c.root < 0 ? "N.C." : chordName(c.root, c.quality));
// What the player fingers with the capo on.
const shapeOf = (c) => (c.root < 0 ? c : { root: mod12(c.root - state.capo), quality: c.quality });

function usage() {
  const m = new Map();
  for (let i = 0; i < state.beats.length; i++) {
    const c = chordAt(i);
    if (c.root < 0) continue;
    const k = c.root + ":" + c.quality;
    m.set(k, (m.get(k) || { ...c, beats: 0 }));
    m.get(k).beats++;
  }
  return [...m.values()];
}

// Group beats into bars; choose the bar phase where chord changes land most often.
function buildBars() {
  const n = state.beats.length, bpb = state.bpb;
  const changes = new Array(bpb).fill(0);
  for (let i = 1; i < n; i++) {
    const a = chordAt(i - 1), b = chordAt(i);
    if (a.root !== b.root || a.quality !== b.quality) changes[i % bpb] += 1;
  }
  let phase = 0;
  for (let p = 1; p < bpb; p++) if (changes[p] > changes[phase]) phase = p;
  const bars = [];
  if (phase > 0) bars.push({ start: 0, end: phase, pickup: true });
  for (let s = phase; s < n; s += bpb) bars.push({ start: s, end: Math.min(n, s + bpb) });
  // Trim leading/trailing bars that are silent.
  const silent = (b) => { for (let i = b.start; i < b.end; i++) if (chordAt(i).root >= 0) return false; return true; };
  while (bars.length > 1 && silent(bars[0])) bars.shift();
  while (bars.length > 1 && silent(bars[bars.length - 1])) bars.pop();
  state.bars = bars;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                            */
/* ------------------------------------------------------------------ */

function showResult() {
  $("start").hidden = true; $("result").hidden = false; $("transport").hidden = false; $("new-song").hidden = false;
  audio.src = state.url;
  audio.playbackRate = Number($("speed").value);
  $("song-title").textContent = state.name;
  renderAll();
  window.scrollTo({ top: 0 });
}

function renderAll() {
  buildBars();
  renderFacts();
  renderControls();
  renderShapes();
  renderChart();
  renderTimeline();
  state.lastBeat = -1;
  tick(true);
  save();
}

function renderFacts() {
  const k = state.key;
  const keyName = k ? NOTE_NAMES[mod12(k.tonic + state.transpose)] + (k.mode === "minor" ? " minor" : " major") : "–";
  const parts = [`Key <b>${keyName}</b>`, `<b>${Math.round(bpm())}</b> BPM`];
  if (state.capo) parts.push(`Capo <b>${state.capo}</b>`);
  const t = state.feat.tuning * 100;
  if (Math.abs(t) >= 15) parts.push(`Tuned ${t > 0 ? "+" : ""}${Math.round(t)} cents vs A440`);
  $("facts").innerHTML = parts.join(" · ");
}

function renderControls() {
  document.querySelectorAll("#mode button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === state.mode)));
  document.querySelectorAll("#bpb button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.v) === state.bpb)));
  $("capo-val").textContent = state.capo;
  $("capo-best").hidden = state.capoAuto;
  $("tr-val").textContent = state.transpose > 0 ? `+${state.transpose}` : state.transpose;
  $("tempo-label").textContent = `Tempo ${Math.round(bpm())}`;
}

function renderShapes() {
  const used = usage();
  // Order by first appearance.
  const first = new Map();
  for (let i = 0; i < state.beats.length; i++) { const c = chordAt(i); const k = c.root + ":" + c.quality; if (c.root >= 0 && !first.has(k)) first.set(k, i); }
  used.sort((a, b) => first.get(a.root + ":" + a.quality) - first.get(b.root + ":" + b.quality));
  $("shapes").innerHTML = used.map((c) => {
    const s = shapeOf(c), v = voicing(s.root, s.quality);
    const sounding = state.capo ? `<small>sounds ${label(c)}</small>` : "";
    return `<figure class="shape" style="--c:${chordColor(c.root, c.quality)}"><figcaption>${label(s)}${sounding}</figcaption>${diagramSVG(v.frets)}</figure>`;
  }).join("");
}

function renderChart() {
  const chart = $("chart");
  const bpb = state.bpb;
  let html = "";
  let prevLabel = null;
  state.bars.forEach((bar, bi) => {
    const len = bar.end - bar.start;
    // Merge beats into runs of the same chord inside the bar.
    const runs = [];
    for (let i = bar.start; i < bar.end; i++) {
      const c = chordAt(i), l = label(shapeOf(c));
      const last = runs[runs.length - 1];
      if (last && last.l === l) last.n++;
      else runs.push({ l, c, i, n: 1 });
    }
    const cells = runs.map((r) => {
      const cont = r.l === prevLabel;
      prevLabel = r.l;
      const beatsHtml = Array.from({ length: r.n }, (_, k) => `<i data-b="${r.i + k}"></i>`).join("");
      return `<div class="run${cont ? " cont" : ""}" style="flex:${r.n};--c:${chordColor(r.c.root, r.c.quality)}">` +
        `<button class="cname" data-b="${r.i}" aria-label="Change chord ${r.l}">${r.l}</button>` +
        `<span class="beats">${beatsHtml}</span></div>`;
    }).join("");
    const pad = bar.pickup ? "" : `<div class="run pad" style="flex:${bpb - len}"></div>`;
    html += `<div class="bar${bar.pickup ? " pickup" : ""}" data-bar="${bi}" style="--n:${bar.pickup ? len : bpb}">` +
      `<span class="bar-no">${bar.pickup ? "pickup" : bi + (state.bars[0].pickup ? 0 : 1)}</span>${cells}${len < bpb && !bar.pickup ? pad : ""}</div>`;
  });
  chart.innerHTML = html;
  markLoop();
}

function renderTimeline() {
  const d = state.feat.duration, el = $("tl-chords");
  let html = "", i = 0;
  const n = state.beats.length;
  while (i < n) {
    const c = chordAt(i);
    let j = i;
    while (j + 1 < n && label(chordAt(j + 1)) === label(c)) j++;
    const t0 = state.beats[i], t1 = j + 1 < n ? state.beats[j + 1] : d;
    if (c.root >= 0) html += `<i style="left:${(100 * t0) / d}%;width:${(100 * (t1 - t0)) / d}%;background:${chordColor(c.root, c.quality)}"></i>`;
    i = j + 1;
  }
  el.innerHTML = html;
  $("dur").textContent = fmtTime(d);
  $("timeline").setAttribute("aria-valuemax", String(Math.round(d)));
}

/* ------------------------------------------------------------------ */
/* Playback sync                                                        */
/* ------------------------------------------------------------------ */

const audio = $("audio");
const beatIndexAt = (t) => {
  const b = state.beats;
  let lo = 0, hi = b.length - 1;
  if (!b.length || t < b[0]) return -1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (b[mid] <= t) lo = mid; else hi = mid - 1; }
  return lo;
};
const barOfBeat = (i) => state.bars.findIndex((b) => i >= b.start && i < b.end);

function tick(force = false) {
  if (!state.feat) return;
  const t = audio.currentTime || 0;
  const d = state.feat.duration;
  $("tl-head").style.left = `${(100 * t) / d}%`;
  $("time").textContent = fmtTime(t);
  $("timeline").setAttribute("aria-valuenow", String(Math.round(t)));

  // Loop.
  if (state.loop && $("loop").getAttribute("aria-pressed") === "true" && !audio.paused) {
    const [a, b] = state.loop;
    const t0 = state.beats[state.bars[a].start];
    const endBeat = state.bars[b].end;
    const t1 = endBeat < state.beats.length ? state.beats[endBeat] : d;
    if (t >= t1 - 0.02 || t < t0 - 0.5) audio.currentTime = t0;
  }

  const bi = Math.max(0, beatIndexAt(t));
  if (bi === state.lastBeat && !force) return;
  state.lastBeat = bi;

  const chart = $("chart");
  chart.querySelector("i.on")?.classList.remove("on");
  chart.querySelector(".bar.on")?.classList.remove("on");
  chart.querySelector(`i[data-b="${bi}"]`)?.classList.add("on");
  const barIdx = barOfBeat(bi);
  const barEl = chart.querySelector(`.bar[data-bar="${barIdx}"]`);
  barEl?.classList.add("on");
  if (barEl && state.following && !audio.paused) {
    const r = barEl.getBoundingClientRect();
    const transportH = $("transport").offsetHeight;
    const nowH = $("now").getBoundingClientRect().bottom;
    if (r.top < Math.max(0, nowH) + 8 || r.bottom > innerHeight - transportH - 24) {
      barEl.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  // Now / next.
  const cur = chordAt(bi), curShape = shapeOf(cur);
  $("now-name").textContent = label(curShape);
  $("now-name").style.setProperty("--c", chordColor(cur.root, cur.quality));
  $("now-sound").textContent = state.capo && cur.root >= 0 ? `sounds ${label(cur)}` : "";
  $("now-dia").innerHTML = cur.root >= 0 ? diagramSVG(voicing(curShape.root, curShape.quality).frets, { size: 1.25 }) : "";
  let j = bi + 1;
  while (j < state.beats.length && label(chordAt(j)) === label(cur)) j++;
  if (j < state.beats.length) {
    const nx = chordAt(j), nxShape = shapeOf(nx);
    $("next-name").textContent = label(nxShape);
    const n = j - bi;
    $("next-in").textContent = `in ${n} beat${n === 1 ? "" : "s"}`;
    $("next-dia").innerHTML = nx.root >= 0 ? diagramSVG(voicing(nxShape.root, nxShape.quality).frets, { size: 0.9 }) : "";
  } else { $("next-name").textContent = "End"; $("next-in").textContent = ""; $("next-dia").innerHTML = ""; }
  // Beat counter within the bar.
  const bar = state.bars[barIdx];
  if (bar) {
    const n = bar.end - bar.start, pos = bi - bar.start;
    $("now-beats").innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k === pos ? "on" : k < pos ? "past" : ""}"></i>`).join("");
  }
}

function loop() { tick(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);

const playBtn = $("play");
playBtn.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
audio.addEventListener("play", () => { playBtn.classList.add("playing"); playBtn.setAttribute("aria-label", "Pause"); });
audio.addEventListener("pause", () => { playBtn.classList.remove("playing"); playBtn.setAttribute("aria-label", "Play"); });
$("speed").addEventListener("change", (e) => {
  audio.playbackRate = Number(e.target.value);
  if ("preservesPitch" in audio) audio.preservesPitch = true;
});

// Seek by timeline.
const tl = $("timeline");
function seekFromEvent(e) {
  const r = tl.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  audio.currentTime = x * state.feat.duration;
  state.lastBeat = -1;
}
tl.addEventListener("pointerdown", (e) => {
  seekFromEvent(e);
  tl.setPointerCapture(e.pointerId);
  const move = (ev) => seekFromEvent(ev);
  tl.addEventListener("pointermove", move);
  tl.addEventListener("pointerup", () => tl.removeEventListener("pointermove", move), { once: true });
});
tl.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") audio.currentTime += 5;
  if (e.key === "ArrowLeft") audio.currentTime -= 5;
});

// Keyboard shortcuts.
document.addEventListener("keydown", (e) => {
  if ($("result").hidden || $("editor").open) return;
  if (e.target.closest("input, select, textarea")) return;
  if (e.code === "Space" && !e.target.closest("button")) { e.preventDefault(); audio.paused ? audio.play() : audio.pause(); }
  if (e.target === tl) return;
  if (e.key === "ArrowRight") { audio.currentTime = Math.min(state.feat.duration, audio.currentTime + 5); }
  if (e.key === "ArrowLeft") { audio.currentTime = Math.max(0, audio.currentTime - 5); }
});

// Pause auto-follow while the user scrolls by hand; resume after a moment.
let followTimer;
["wheel", "touchmove"].forEach((ev) => addEventListener(ev, () => {
  state.following = false;
  clearTimeout(followTimer);
  followTimer = setTimeout(() => (state.following = true), 4000);
}, { passive: true }));

/* ------------------------------------------------------------------ */
/* Chart interaction: seek, loop, edit                                  */
/* ------------------------------------------------------------------ */

$("chart").addEventListener("click", (e) => {
  const name = e.target.closest(".cname");
  if (name) { openEditor(Number(name.dataset.b)); return; }
  const barEl = e.target.closest(".bar");
  if (!barEl) return;
  const bi = Number(barEl.dataset.bar);
  if (e.shiftKey && state.selectStart != null) {
    const a = Math.min(state.selectStart, bi), b = Math.max(state.selectStart, bi);
    state.loop = [a, b];
    $("loop").setAttribute("aria-pressed", "true");
    toast(`Looping bars ${barLabel(a)}–${barLabel(b)}`);
  } else {
    state.selectStart = bi;
    if (state.loop && $("loop").getAttribute("aria-pressed") === "true" && (bi < state.loop[0] || bi > state.loop[1])) {
      state.loop = [bi, bi];
    }
  }
  audio.currentTime = state.beats[state.bars[bi].start] + 0.01;
  state.lastBeat = -1;
  markLoop();
  if (audio.paused) audio.play().catch(() => {});
});
const barLabel = (i) => (state.bars[0]?.pickup ? i : i + 1);

$("loop").addEventListener("click", () => {
  const on = $("loop").getAttribute("aria-pressed") !== "true";
  if (on && !state.loop) {
    // Default: loop the current bar plus the next three.
    const cur = Math.max(0, barOfBeat(Math.max(0, beatIndexAt(audio.currentTime))));
    state.loop = [cur, Math.min(state.bars.length - 1, cur + 3)];
  }
  $("loop").setAttribute("aria-pressed", String(on));
  if (on) toast(`Looping bars ${barLabel(state.loop[0])}–${barLabel(state.loop[1])}. Shift-tap bars to change`);
  markLoop();
});

function markLoop() {
  const on = state.loop && $("loop").getAttribute("aria-pressed") === "true";
  document.querySelectorAll(".bar.looped").forEach((el) => el.classList.remove("looped"));
  const box = $("tl-loop");
  if (!on) { box.hidden = true; return; }
  const [a, b] = state.loop;
  for (let i = a; i <= b; i++) document.querySelector(`.bar[data-bar="${i}"]`)?.classList.add("looped");
  const d = state.feat.duration;
  const t0 = state.beats[state.bars[a].start];
  const endBeat = state.bars[b].end;
  const t1 = endBeat < state.beats.length ? state.beats[endBeat] : d;
  box.hidden = false;
  box.style.left = `${(100 * t0) / d}%`; box.style.width = `${(100 * (t1 - t0)) / d}%`;
}

// Editor.
const editor = $("editor");
let edBeat = 0, edRoot = 0, edQual = "maj";
const QUAL_ORDER = ["maj", "min", "7", "m7", "maj7", "sus2", "sus4", "dim"];
function openEditor(beat) {
  edBeat = beat;
  const c = shapeOf(chordAt(beat));
  edRoot = c.root < 0 ? 0 : c.root; edQual = c.quality;
  $("ed-orig").textContent = label(c);
  $("ed-sub").textContent = state.capo ? `Shapes with capo ${state.capo}` : "Pick what you hear";
  $("ed-all").checked = false;
  $("ed-reset").hidden = !state.edits[beat];
  renderEditor();
  editor.showModal();
}
function renderEditor() {
  $("ed-roots").innerHTML = NOTE_NAMES.map((n, r) => `<button type="button" data-r="${r}" aria-pressed="${r === edRoot}">${n}</button>`).join("") +
    `<button type="button" data-r="-1" aria-pressed="${edRoot === -1}">N.C.</button>`;
  $("ed-quals").innerHTML = QUAL_ORDER.map((q) => `<button type="button" data-q="${q}" aria-pressed="${q === edQual}" ${edRoot < 0 ? "disabled" : ""}>${q === "maj" ? "major" : q === "min" ? "minor" : QUALITIES[q].suffix}</button>`).join("");
  $("ed-name").textContent = edRoot < 0 ? "N.C." : chordName(edRoot, edQual);
  $("ed-dia").innerHTML = edRoot < 0 ? "" : diagramSVG(voicing(edRoot, edQual).frets, { size: 1.1 });
}
$("ed-roots").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { edRoot = Number(b.dataset.r); renderEditor(); } });
$("ed-quals").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { edQual = b.dataset.q; renderEditor(); } });
editor.addEventListener("close", () => {
  const v = editor.returnValue;
  if (v !== "ok" && v !== "reset") return;
  // Which beats does this cover? The contiguous run around edBeat, or every match.
  const orig = label(chordAt(edBeat));
  const targets = [];
  if ($("ed-all").checked) { for (let i = 0; i < state.beats.length; i++) if (label(chordAt(i)) === orig) targets.push(i); }
  else {
    let a = edBeat, b = edBeat;
    while (a > 0 && label(chordAt(a - 1)) === orig) a--;
    while (b + 1 < state.beats.length && label(chordAt(b + 1)) === orig) b++;
    for (let i = a; i <= b; i++) targets.push(i);
  }
  for (const i of targets) {
    if (v === "reset") delete state.edits[i];
    // Store edits in sounding pitch, before transpose, so transpose/capo still apply.
    else state.edits[i] = edRoot < 0 ? { root: -1, quality: "maj" } : { root: mod12(edRoot + state.capo - state.transpose), quality: edQual };
  }
  renderAll();
});

/* ------------------------------------------------------------------ */
/* Controls                                                             */
/* ------------------------------------------------------------------ */

$("mode").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state.mode = b.dataset.v; if (state.capoAuto) state.capo = suggestCapo(usage()); renderAll(); });
$("bpb").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; state.bpb = Number(b.dataset.v); state.loop = null; renderAll(); });
$("capo-up").addEventListener("click", () => { state.capo = Math.min(9, state.capo + 1); state.capoAuto = false; renderAll(); });
$("capo-dn").addEventListener("click", () => { state.capo = Math.max(0, state.capo - 1); state.capoAuto = false; renderAll(); });
$("capo-best").addEventListener("click", () => { state.capoAuto = true; state.capo = suggestCapo(usage()); renderAll(); });
$("tr-up").addEventListener("click", () => { state.transpose = Math.min(11, state.transpose + 1); if (state.capoAuto) state.capo = suggestCapo(usage()); renderAll(); });
$("tr-dn").addEventListener("click", () => { state.transpose = Math.max(-11, state.transpose - 1); if (state.capoAuto) state.capo = suggestCapo(usage()); renderAll(); });
$("tempo").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const f = state.tempoFactor * Number(b.dataset.v);
  if (f < 0.25 || f > 4) return;
  state.tempoFactor = f;
  // Edits are tied to beat positions, which just changed.
  state.edits = {}; state.loop = null;
  analyseBeats();
  renderAll();
  toast(`Tempo now ${Math.round(bpm())} BPM`);
});

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

function chartText() {
  const lines = [state.name];
  const k = state.key;
  const keyName = k ? NOTE_NAMES[mod12(k.tonic + state.transpose)] + (k.mode === "minor" ? " minor" : " major") : "";
  lines.push(`Key: ${keyName} · ${Math.round(bpm())} BPM · ${state.bpb}/4${state.capo ? ` · Capo ${state.capo}` : ""}`);
  lines.push("");
  let row = [], prev = null;
  const flush = () => { if (row.length) lines.push("| " + row.join(" | ") + " |"); row = []; };
  state.bars.forEach((bar) => {
    const cells = [];
    for (let i = bar.start; i < bar.end; i++) {
      const l = label(shapeOf(chordAt(i)));
      cells.push(l === prev && i !== bar.start ? "." : l);
      prev = l;
    }
    row.push(cells.map((c) => c.padEnd(5)).join(" ").trimEnd().padEnd(state.bpb * 6 - 1));
    if (row.length === 4) flush();
  });
  flush();
  const shapes = usage().map((c) => { const s = shapeOf(c); return `${label(s).padEnd(7)} ${voicing(s.root, s.quality).frets.map((f) => (f < 0 ? "x" : f)).join(" ")}`; });
  lines.push("", "Shapes (low E → high e):", ...shapes, "", "Made with Chord Finder · tomasroos");
  return lines.join("\n");
}
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(chartText()); toast("Chart copied"); }
  catch { toast("Couldn't copy. Try Download instead"); }
});
$("download").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([chartText()], { type: "text/plain" }));
  a.download = `${state.name} - chords.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$("print").addEventListener("click", () => print());

/* ------------------------------------------------------------------ */
/* Persistence (per file, this browser only)                            */
/* ------------------------------------------------------------------ */

function save() {
  try {
    localStorage.setItem(state.fileKey, JSON.stringify({
      mode: state.mode, transpose: state.transpose, capo: state.capo, capoAuto: state.capoAuto,
      bpb: state.bpb, tempoFactor: state.tempoFactor, edits: state.edits,
    }));
  } catch {}
}
function restoreSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(state.fileKey) || "null");
    if (s) Object.assign(state, s);
  } catch {}
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
