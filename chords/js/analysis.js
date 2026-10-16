// Chord Finder — audio analysis core.
// Pure functions, no DOM: runs in a Web Worker in the browser and in Node for tests.
//
// Pipeline
//   1. extractFeatures(): mono samples → tuning estimate, onset envelope,
//      per-frame treble + bass chroma (semitone spectrum folded to 12 pitch classes).
//   2. trackBeats():      onset envelope → tempo + beat times (Ellis-style DP).
//   3. decodeChords():    beat-synchronous chroma → chord per beat via an HMM
//      (harmonic-aware templates, key prior, Viterbi smoothing).

export const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// Chord qualities: intervals above the root, display suffix, and a prior
// (log-weight) so plain triads win unless the extension is clearly there.
export const QUALITIES = {
  maj:  { iv: [0, 4, 7],      suffix: "",     prior: 0.0 },
  min:  { iv: [0, 3, 7],      suffix: "m",    prior: 0.0 },
  "7":  { iv: [0, 4, 7, 10],  suffix: "7",    prior: -0.35 },
  m7:   { iv: [0, 3, 7, 10],  suffix: "m7",   prior: -0.35 },
  maj7: { iv: [0, 4, 7, 11],  suffix: "maj7", prior: -0.4 },
  sus4: { iv: [0, 5, 7],      suffix: "sus4", prior: -0.45 },
  sus2: { iv: [0, 2, 7],      suffix: "sus2", prior: -0.5 },
  dim:  { iv: [0, 3, 6],      suffix: "dim",  prior: -0.6 },
};
export const SIMPLE_QUALITIES = ["maj", "min"];
export const FULL_QUALITIES = Object.keys(QUALITIES);

// Reduce any quality to its triad family (used for "simple" display).
export const SIMPLIFY = { maj: "maj", min: "min", "7": "maj", m7: "min", maj7: "maj", sus4: "maj", sus2: "maj", dim: "min" };

export function chordName(root, quality) {
  if (root < 0) return "N";
  return NOTE_NAMES[((root % 12) + 12) % 12] + QUALITIES[quality].suffix;
}

/* ------------------------------------------------------------------ */
/* FFT                                                                  */
/* ------------------------------------------------------------------ */

function makeFFT(n) {
  const levels = Math.log2(n) | 0;
  if (1 << levels !== n) throw new Error("FFT size must be a power of 2");
  const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos((2 * Math.PI * i) / n); sin[i] = Math.sin((2 * Math.PI * i) / n); }
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let x = i, r = 0;
    for (let j = 0; j < levels; j++) { r = (r << 1) | (x & 1); x >>>= 1; }
    rev[i] = r;
  }
  // In-place complex FFT on (re, im).
  return function fft(re, im) {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >>> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tre = re[l] * cos[k] + im[l] * sin[k];
          const tim = -re[l] * sin[k] + im[l] * cos[k];
          re[l] = re[j] - tre; im[l] = im[j] - tim;
          re[j] += tre; im[j] += tim;
        }
      }
    }
  };
}

function hann(n) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n);
  return w;
}

/* ------------------------------------------------------------------ */
/* Resampling                                                           */
/* ------------------------------------------------------------------ */

// Windowed-sinc low-pass + linear-interp resample. Good enough for analysis.
export function resample(samples, fromRate, toRate) {
  if (fromRate === toRate) return Float32Array.from(samples);
  const ratio = fromRate / toRate;
  let src = samples;
  if (ratio > 1) {
    const cutoff = 0.45 / ratio; // normalised to fromRate
    const taps = 64;
    const kernel = new Float32Array(taps * 2 + 1);
    let sum = 0;
    for (let i = -taps; i <= taps; i++) {
      const x = i === 0 ? 2 * cutoff : Math.sin(2 * Math.PI * cutoff * i) / (Math.PI * i);
      const w = 0.42 + 0.5 * Math.cos((Math.PI * i) / taps) + 0.08 * Math.cos((2 * Math.PI * i) / taps);
      kernel[i + taps] = x * w; sum += x * w;
    }
    for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
    const outLen = Math.floor(samples.length / ratio);
    const out = new Float32Array(outLen);
    for (let o = 0; o < outLen; o++) {
      const c = Math.round(o * ratio);
      let acc = 0;
      const lo = Math.max(0, c - taps), hi = Math.min(samples.length - 1, c + taps);
      for (let i = lo; i <= hi; i++) acc += samples[i] * kernel[i - c + taps];
      out[o] = acc;
    }
    return out;
  }
  const outLen = Math.floor(src.length / ratio);
  const out = new Float32Array(outLen);
  for (let o = 0; o < outLen; o++) {
    const p = o * ratio, i = Math.floor(p), f = p - i;
    out[o] = src[i] * (1 - f) + (src[Math.min(i + 1, src.length - 1)] || 0) * f;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Feature extraction                                                   */
/* ------------------------------------------------------------------ */

export const ANALYSIS_RATE = 11025;
const CHROMA_N = 8192;   // ~0.74 s window, 1.35 Hz bins: resolves bass semitones
const CHROMA_HOP = 1024; // ~93 ms
const ONSET_N = 1024;
const ONSET_HOP = 256;   // ~23 ms
const MIDI_LO = 28, MIDI_HI = 96; // E1 .. C7
const BASS_HI = 52;      // bass chroma: E1..E3
const TREBLE_LO = 45;    // treble chroma: A2..C7

const midiToHz = (m, tuning = 0) => 440 * Math.pow(2, (m - 69 + tuning) / 12);

/**
 * @param {Float32Array} samples mono audio at ANALYSIS_RATE
 * @param {(p:number, stage:string)=>void} [onProgress]
 */
export function extractFeatures(samples, onProgress = () => {}) {
  const sr = ANALYSIS_RATE;
  const duration = samples.length / sr;

  // --- Onset envelope (log-magnitude spectral flux) -----------------
  const onset = onsetEnvelope(samples, onProgress);

  // --- Long-window spectrogram for chroma ---------------------------
  const n = CHROMA_N, hop = CHROMA_HOP, half = n / 2;
  const fft = makeFFT(n), win = hann(n);
  const re = new Float64Array(n), im = new Float64Array(n);
  const nFrames = Math.max(1, Math.floor((samples.length - n) / hop) + 1);
  const binHz = sr / n;
  const loBin = Math.floor(midiToHz(MIDI_LO - 1) / binHz), hiBin = Math.ceil(midiToHz(MIDI_HI + 1) / binHz);
  const width = hiBin - loBin + 1;
  const mags = new Array(nFrames);
  const frameEnergy = new Float32Array(nFrames);

  for (let f = 0; f < nFrames; f++) {
    const off = f * hop;
    for (let i = 0; i < n; i++) { re[i] = (samples[off + i] || 0) * win[i]; im[i] = 0; }
    fft(re, im);
    const m = new Float32Array(width);
    let e = 0;
    for (let b = 0; b < width; b++) {
      const k = loBin + b;
      const v = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      m[b] = v; e += v * v;
    }
    mags[f] = m;
    frameEnergy[f] = e;
    if ((f & 31) === 0) onProgress(0.25 + 0.45 * (f / nFrames), "harmony");
  }

  // --- Tuning: where do spectral peaks sit relative to A440? --------
  const tuning = estimateTuning(mags, loBin, binHz);

  // --- Semitone spectrogram with tuning applied ---------------------
  const nPitch = MIDI_HI - MIDI_LO + 1;
  // Precompute bin → (pitch, weight) triangular mapping.
  const binMap = [];
  for (let b = 0; b < width; b++) {
    const hz = (loBin + b) * binHz;
    if (hz <= 0) { binMap.push(null); continue; }
    const midi = 69 + 12 * Math.log2(hz / 440) - tuning;
    const p0 = Math.floor(midi), frac = midi - p0;
    // Weight toward nearest semitone; energy far from any semitone centre counts less.
    const entries = [];
    for (const [p, d] of [[p0, frac], [p0 + 1, 1 - frac]]) {
      if (p < MIDI_LO || p > MIDI_HI) continue;
      const w = Math.cos(Math.min(d, 0.5) * Math.PI) ** 2; // 1 at centre, 0 at ±0.5
      if (w > 0.01) entries.push([p - MIDI_LO, w]);
    }
    binMap.push(entries);
  }

  const pitchSpec = new Array(nFrames);
  for (let f = 0; f < nFrames; f++) {
    const ps = new Float32Array(nPitch);
    const m = mags[f];
    for (let b = 0; b < width; b++) {
      const e = binMap[b];
      if (!e) continue;
      const v = m[b] * m[b];
      for (let j = 0; j < e.length; j++) ps[e[j][0]] += v * e[j][1];
    }
    pitchSpec[f] = ps;
  }

  // --- Percussion suppression: median over time per semitone --------
  const smoothed = medianOverTime(pitchSpec, 7);

  // --- Log-compress + fold to chroma --------------------------------
  // Global loudness reference so quiet passages don't get blown up.
  let ref = 0;
  for (let f = 0; f < nFrames; f++) for (let p = 0; p < nPitch; p++) ref = Math.max(ref, smoothed[f][p]);
  ref = ref || 1;
  const treble = new Array(nFrames), bass = new Array(nFrames);
  const loudness = new Float32Array(nFrames);
  for (let f = 0; f < nFrames; f++) {
    const t = new Float32Array(12), b = new Float32Array(12);
    const ps = smoothed[f];
    let loud = 0;
    for (let p = 0; p < nPitch; p++) {
      const midi = p + MIDI_LO;
      const v = Math.log1p((1000 * ps[p]) / ref);
      loud += ps[p];
      const pc = midi % 12;
      if (midi >= TREBLE_LO) t[pc] += v * trebleWeight(midi);
      if (midi <= BASS_HI) b[pc] += v * bassWeight(midi);
    }
    treble[f] = t; bass[f] = b; loudness[f] = loud / ref;
  }
  onProgress(0.72, "harmony");

  return {
    duration,
    tuning,
    chromaHop: hop / sr,
    chromaWin: n / sr,
    treble, bass, loudness,
    onset: onset.env, onsetHop: ONSET_HOP / sr,
  };
}

// Gentle bell over the guitar/piano register; fade the extreme highs.
function trebleWeight(midi) {
  const centre = 64, spread = 18;
  return Math.exp(-0.5 * ((midi - centre) / spread) ** 2);
}
function bassWeight(midi) {
  const centre = 40, spread = 7;
  return Math.exp(-0.5 * ((midi - centre) / spread) ** 2);
}

function onsetEnvelope(samples, onProgress) {
  const n = ONSET_N, hop = ONSET_HOP;
  const fft = makeFFT(n), win = hann(n);
  const re = new Float64Array(n), im = new Float64Array(n);
  const nFrames = Math.max(1, Math.floor((samples.length - n) / hop) + 1);
  const half = n / 2;
  let prev = new Float32Array(half);
  const env = new Float32Array(nFrames);
  for (let f = 0; f < nFrames; f++) {
    const off = f * hop;
    for (let i = 0; i < n; i++) { re[i] = (samples[off + i] || 0) * win[i]; im[i] = 0; }
    fft(re, im);
    const cur = new Float32Array(half);
    let flux = 0;
    for (let k = 1; k < half; k++) {
      const v = Math.log1p(100 * Math.sqrt(re[k] * re[k] + im[k] * im[k]));
      cur[k] = v;
      const d = v - prev[k];
      if (d > 0) flux += d;
    }
    env[f] = flux;
    prev = cur;
    if ((f & 255) === 0) onProgress(0.25 * (f / nFrames), "rhythm");
  }
  // Remove slow trend (local mean) and half-wave rectify.
  const w = 16;
  const out = new Float32Array(nFrames);
  let acc = 0;
  const cs = new Float64Array(nFrames + 1);
  for (let i = 0; i < nFrames; i++) { acc += env[i]; cs[i + 1] = acc; }
  let max = 0;
  for (let i = 0; i < nFrames; i++) {
    const lo = Math.max(0, i - w), hi = Math.min(nFrames, i + w + 1);
    const mean = (cs[hi] - cs[lo]) / (hi - lo);
    out[i] = Math.max(0, env[i] - mean);
    if (out[i] > max) max = out[i];
  }
  if (max > 0) for (let i = 0; i < nFrames; i++) out[i] /= max;
  return { env: out };
}

function estimateTuning(mags, loBin, binHz) {
  // Circular mean of peak deviations (in semitones) weighted by magnitude.
  let sx = 0, sy = 0;
  const step = Math.max(1, Math.floor(mags.length / 400));
  const minHz = 100, maxHz = 2000;
  for (let f = 0; f < mags.length; f += step) {
    const m = mags[f];
    let mx = 0;
    for (let b = 0; b < m.length; b++) if (m[b] > mx) mx = m[b];
    const thr = mx * 0.1;
    for (let b = 1; b < m.length - 1; b++) {
      const v = m[b];
      if (v < thr || v < m[b - 1] || v < m[b + 1]) continue;
      // Parabolic interpolation on log magnitude for sub-bin accuracy.
      const a = Math.log(m[b - 1] + 1e-9), c = Math.log(v + 1e-9), d = Math.log(m[b + 1] + 1e-9);
      const denom = a - 2 * c + d;
      const delta = denom !== 0 ? (0.5 * (a - d)) / denom : 0;
      const hz = (loBin + b + delta) * binHz;
      if (hz < minHz || hz > maxHz) continue;
      const midi = 69 + 12 * Math.log2(hz / 440);
      const dev = midi - Math.round(midi); // -0.5..0.5
      const ang = dev * 2 * Math.PI;
      sx += v * Math.cos(ang); sy += v * Math.sin(ang);
    }
  }
  if (sx === 0 && sy === 0) return 0;
  return Math.atan2(sy, sx) / (2 * Math.PI);
}

function medianOverTime(frames, k) {
  const n = frames.length, d = frames[0].length, h = k >> 1;
  const out = new Array(n);
  const buf = new Float32Array(k);
  for (let f = 0; f < n; f++) out[f] = new Float32Array(d);
  for (let p = 0; p < d; p++) {
    for (let f = 0; f < n; f++) {
      let c = 0;
      for (let j = f - h; j <= f + h; j++) buf[c++] = frames[Math.min(n - 1, Math.max(0, j))][p];
      const s = Array.from(buf).sort((a, b) => a - b);
      out[f][p] = s[h];
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Beat tracking                                                        */
/* ------------------------------------------------------------------ */

/**
 * Tempo by autocorrelation of the onset envelope, then dynamic-programming
 * beat tracking (Ellis 2007). Returns beat times in seconds.
 * @param {{onset: Float32Array, onsetHop: number, duration: number}} feat
 * @param {number} [bpmHint] force a tempo (used for ½× / 2× corrections)
 */
export function trackBeats(feat, bpmHint) {
  const env = feat.onset, hop = feat.onsetHop, n = env.length;
  let period; // in onset frames
  let bpm;
  if (bpmHint) {
    bpm = bpmHint;
    period = 60 / bpm / hop;
  } else {
    const minLag = Math.floor(60 / 200 / hop), maxLag = Math.ceil(60 / 50 / hop);
    const ac = new Float64Array(maxLag + 1);
    for (let lag = minLag; lag <= maxLag; lag++) {
      let s = 0;
      for (let i = lag; i < n; i++) s += env[i] * env[i - lag];
      ac[lag] = s / (n - lag);
    }
    // Perceptual weighting: log-Gaussian around 115 BPM.
    let best = -1, bestLag = minLag;
    const scored = new Float64Array(maxLag + 1);
    for (let lag = minLag; lag <= maxLag; lag++) {
      const b = 60 / (lag * hop);
      const w = Math.exp(-0.5 * (Math.log2(b / 115) / 0.9) ** 2);
      // Reward lags whose double also correlates (helps the true beat level).
      const dbl = 2 * lag <= maxLag ? ac[2 * lag] : 0;
      scored[lag] = w * (ac[lag] + 0.5 * dbl);
      if (scored[lag] > best) { best = scored[lag]; bestLag = lag; }
    }
    // Parabolic refinement.
    const l = bestLag;
    if (l > minLag && l < maxLag) {
      const a = scored[l - 1], b = scored[l], c = scored[l + 1];
      const den = a - 2 * b + c;
      period = l + (den !== 0 ? (0.5 * (a - c)) / den : 0);
    } else period = l;
    bpm = 60 / (period * hop);
  }

  // DP: score[i] = env[i] + max_j (score[j] - α·(log((i-j)/period))²)
  const alpha = 400;
  const score = new Float64Array(n), back = new Int32Array(n).fill(-1);
  const lo = Math.round(period / 2), hi = Math.round(period * 2);
  for (let i = 0; i < n; i++) {
    let best = 0, bj = -1;
    for (let j = i - hi; j <= i - lo; j++) {
      if (j < 0) continue;
      const r = Math.log((i - j) / period);
      const s = score[j] - alpha * r * r;
      if (s > best || bj < 0) { best = s; bj = j; }
    }
    score[i] = env[i] + (bj >= 0 ? Math.max(0, best) : 0);
    back[i] = bj >= 0 && best > 0 ? bj : -1;
  }
  // Start from the best-scoring frame in the last period.
  let end = n - 1, bs = -Infinity;
  for (let i = Math.max(0, n - Math.round(period)); i < n; i++) if (score[i] > bs) { bs = score[i]; end = i; }
  const frames = [];
  for (let i = end; i >= 0; i = back[i]) { frames.push(i); if (back[i] < 0) break; }
  frames.reverse();

  let beats = frames.map((f) => f * hop + (ONSET_N / 2) / ANALYSIS_RATE);
  // Fill the intro/outro with the steady grid so chords there still get beats.
  const pSec = period * hop;
  if (beats.length) {
    const head = [];
    for (let t = beats[0] - pSec; t > -pSec * 0.25; t -= pSec) head.unshift(Math.max(0, t));
    const tail = [];
    for (let t = beats[beats.length - 1] + pSec; t < feat.duration; t += pSec) tail.push(t);
    beats = head.concat(beats, tail);
  } else {
    for (let t = 0; t < feat.duration; t += pSec) beats.push(t);
  }
  return { bpm, beats };
}

/** Halve or double a beat grid without re-tracking. */
export function rescaleBeats(beats, factor, duration) {
  if (factor === 0.5) return beats.filter((_, i) => i % 2 === 0);
  if (factor === 2) {
    const out = [];
    for (let i = 0; i < beats.length; i++) {
      out.push(beats[i]);
      const next = i + 1 < beats.length ? beats[i + 1] : Math.min(duration, beats[i] + (beats[i] - (beats[i - 1] ?? 0)));
      const mid = (beats[i] + next) / 2;
      if (mid < duration) out.push(mid);
    }
    return out;
  }
  return beats;
}

/* ------------------------------------------------------------------ */
/* Chord decoding                                                       */
/* ------------------------------------------------------------------ */

// Template with harmonics: each chord tone contributes its first few partials.
function harmonicTemplate(root, iv) {
  const t = new Float64Array(12);
  for (const i of iv) {
    const pc = (root + i) % 12;
    // partials 1..6 with decay; semitone offsets 0,12,19,24,28,31
    const partials = [0, 12, 19, 24, 28, 31];
    partials.forEach((o, h) => { t[(pc + o) % 12] += Math.pow(0.6, h); });
  }
  // Root slightly emphasised (doubling is common on guitar).
  t[root % 12] += 0.4;
  return normalize(t);
}

function normalize(v) {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  s = Math.sqrt(s) || 1;
  const o = new Float64Array(v.length);
  for (let i = 0; i < v.length; i++) o[i] = v[i] / s;
  return o;
}

function buildChordSet(qualities) {
  const chords = [];
  for (const q of qualities) for (let r = 0; r < 12; r++) {
    chords.push({ root: r, quality: q, tpl: harmonicTemplate(r, QUALITIES[q].iv), prior: QUALITIES[q].prior });
  }
  return chords;
}

// Krumhansl-Kessler key profiles.
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function pearson(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
  return num / (Math.sqrt(da * db) || 1);
}

/** Estimate key from a 12-bin pitch-class profile. */
export function estimateKey(profile) {
  let best = { score: -Infinity };
  for (let t = 0; t < 12; t++) {
    const rot = (p) => p.map((_, i) => p[(i - t + 12) % 12]);
    const sMaj = pearson(profile, rot(MAJOR_PROFILE));
    const sMin = pearson(profile, rot(MINOR_PROFILE));
    if (sMaj > best.score) best = { tonic: t, mode: "major", score: sMaj };
    if (sMin > best.score) best = { tonic: t, mode: "minor", score: sMin };
  }
  best.name = NOTE_NAMES[best.tonic] + (best.mode === "minor" ? " minor" : " major");
  return best;
}

// Diatonic chord bonus given a key (major-mode scale degrees; minor via relative major).
function diatonicBonus(key) {
  const tonic = key.mode === "major" ? key.tonic : (key.tonic + 3) % 12;
  const bonus = new Map();
  const set = (r, q, v) => bonus.set(((r % 12) + 12) % 12 + ":" + q, v);
  // I ii iii IV V vi vii°
  [[0, "maj"], [2, "min"], [4, "min"], [5, "maj"], [7, "maj"], [9, "min"], [11, "dim"]].forEach(([d, q]) => set(tonic + d, q, 1));
  // Diatonic sevenths and sus chords on scale degrees.
  [[0, "maj7"], [2, "m7"], [4, "m7"], [5, "maj7"], [7, "7"], [9, "m7"]].forEach(([d, q]) => set(tonic + d, q, 1));
  [0, 2, 5, 7, 9].forEach((d) => { set(tonic + d, "sus2", 0.7); set(tonic + d, "sus4", 0.7); });
  // Very common borrowed chords: bVII, iv, V in minor, III (as in harmonic minor/major V/vi).
  [[10, "maj", 0.6], [5, "min", 0.4], [4, "maj", 0.5], [8, "maj", 0.5], [2, "maj", 0.4], [2, "7", 0.4], [4, "7", 0.5], [9, "maj", 0.3]].forEach(([d, q, v]) => set(tonic + d, q, v));
  return bonus;
}

/**
 * Average frame features between consecutive beats.
 */
export function beatSync(feat, beats) {
  const hop = feat.chromaHop, centre = feat.chromaWin / 2;
  const nF = feat.treble.length;
  const edges = beats.concat([feat.duration]);
  const segs = [];
  for (let i = 0; i < beats.length; i++) {
    const t0 = edges[i], t1 = edges[i + 1];
    // Frame f is centred at f*hop + centre.
    let f0 = Math.ceil((t0 - centre) / hop), f1 = Math.floor((t1 - centre) / hop);
    f0 = Math.max(0, Math.min(nF - 1, f0)); f1 = Math.max(f0, Math.min(nF - 1, f1));
    const tr = new Float64Array(12), bs = new Float64Array(12);
    let loud = 0, c = 0;
    for (let f = f0; f <= f1; f++) {
      for (let k = 0; k < 12; k++) { tr[k] += feat.treble[f][k]; bs[k] += feat.bass[f][k]; }
      loud += feat.loudness[f]; c++;
    }
    for (let k = 0; k < 12; k++) { tr[k] /= c; bs[k] /= c; }
    segs.push({ start: t0, end: t1, treble: tr, bass: bs, loudness: loud / c });
  }
  return segs;
}

/**
 * Decode one chord per beat.
 * @param {ReturnType<typeof beatSync>} segs
 * @param {{qualities?: string[], changePenalty?: number}} [opts]
 */
export function decodeChords(segs, opts = {}) {
  const qualities = opts.qualities || FULL_QUALITIES;
  const changePenalty = opts.changePenalty ?? 2.2;
  const chords = buildChordSet(qualities);
  const S = chords.length + 1; // + N (no chord)
  const T = segs.length;
  if (!T) return { labels: [], key: null };

  // Key from overall chroma, weighted by loudness.
  const profile = new Array(12).fill(0);
  for (const s of segs) for (let k = 0; k < 12; k++) profile[k] += s.treble[k] * Math.min(1, s.loudness * 50) + 0.5 * s.bass[k];
  const key = estimateKey(profile);
  const bonus = diatonicBonus(key);

  // Silence threshold relative to the loudest beats.
  const louds = segs.map((s) => s.loudness).sort((a, b) => a - b);
  const loudRef = louds[Math.floor(louds.length * 0.9)] || 1;

  const beta = 18;     // sharpness of template match
  const bassW = 0.9;   // how much the bass note steers the root
  const keyW = 0.5;
  const emit = new Array(T);
  for (let t = 0; t < T; t++) {
    const s = segs[t];
    const c = normalize(s.treble);
    // Contrast: remove the per-beat floor so noisy beats don't look like everything.
    let mn = Infinity;
    for (let k = 0; k < 12; k++) mn = Math.min(mn, c[k]);
    const cc = normalize(c.map((v) => v - mn * 0.8));
    const b = s.bass;
    let bMax = 0, bSum = 0;
    for (let k = 0; k < 12; k++) { bMax = Math.max(bMax, b[k]); bSum += b[k]; }
    const e = new Float64Array(S);
    const silent = s.loudness < loudRef * 0.02;
    for (let i = 0; i < chords.length; i++) {
      const ch = chords[i];
      let dot = 0;
      for (let k = 0; k < 12; k++) dot += cc[k] * ch.tpl[k];
      const bassRoot = bMax > 0 ? b[ch.root] / bMax : 0;
      const bassInChord = bMax > 0 ? Math.max(...QUALITIES[ch.quality].iv.map((iv) => b[(ch.root + iv) % 12])) / bMax : 0;
      e[i] = beta * dot + bassW * (bassRoot + 0.4 * bassInChord) + ch.prior + keyW * (bonus.get(ch.root + ":" + ch.quality) || 0);
      if (silent) e[i] -= 6;
    }
    // N: flat, wins only on silence or noise.
    e[S - 1] = silent ? beta * 0.9 + 3 : beta * 0.55;
    emit[t] = e;
  }

  // Viterbi with uniform switching cost.
  let prev = emit[0].slice();
  const back = new Array(T);
  for (let t = 1; t < T; t++) {
    let bestIdx = 0;
    for (let i = 1; i < S; i++) if (prev[i] > prev[bestIdx]) bestIdx = i;
    const bestSwitch = prev[bestIdx] - changePenalty;
    const cur = new Float64Array(S), bk = new Int16Array(S);
    for (let i = 0; i < S; i++) {
      if (prev[i] >= bestSwitch) { cur[i] = prev[i] + emit[t][i]; bk[i] = i; }
      else { cur[i] = bestSwitch + emit[t][i]; bk[i] = bestIdx; }
    }
    back[t] = bk;
    prev = cur;
  }
  let state = 0;
  for (let i = 1; i < S; i++) if (prev[i] > prev[state]) state = i;
  const path = new Array(T);
  for (let t = T - 1; t >= 0; t--) { path[t] = state; if (t > 0) state = back[t][state]; }

  const labels = path.map((i) => (i === S - 1 ? { root: -1, quality: "maj" } : { root: chords[i].root, quality: chords[i].quality }));
  // Confidence per beat: margin between chosen chord and runner-up.
  for (let t = 0; t < T; t++) {
    const e = emit[t], chosen = path[t];
    let second = -Infinity;
    for (let i = 0; i < S; i++) if (i !== chosen && e[i] > second) second = e[i];
    labels[t].confidence = Math.max(0, Math.min(1, (e[chosen] - second) / 3));
  }
  return { labels, key };
}

/**
 * Second stage: keep each beat's root + major/minor from the robust triad
 * decode, and add an extension (7, maj7, m7, sus2, sus4) only where the
 * chroma clearly supports it. Thresholds account for overtone leakage
 * (e.g. a triad's fifth puts energy on its major seventh).
 */
export function refineQualities(segs, labels, opts = {}) {
  const k = 9, changePenalty = opts.changePenalty ?? 1.6;
  const T = labels.length;
  const out = labels.map((l) => ({ ...l }));
  let i = 0;
  while (i < T) {
    let j = i;
    while (j + 1 < T && labels[j + 1].root === labels[i].root && labels[j + 1].quality === labels[i].quality) j++;
    const { root, quality } = labels[i];
    if (root >= 0) {
      const cands = quality === "maj" ? ["maj", "7", "maj7", "sus4", "sus2"] : ["min", "m7"];
      // Per-beat scores, then Viterbi inside the segment so extensions persist.
      const scores = [];
      for (let t = i; t <= j; t++) {
        const c = segs[t].treble;
        const r = root, third = quality === "maj" ? 4 : 3;
        const tones = (c[r] + c[(r + third) % 12] + c[(r + 7) % 12]) / 3 || 1e-9;
        const ratio = (iv) => c[(r + iv) % 12] / tones;
        const thirdE = c[(r + third) % 12] || 1e-9;
        const sc = {
          maj: 0, min: 0,
          "7": k * (ratio(10) - 0.42),
          maj7: k * (ratio(11) - 1.05),
          m7: k * (ratio(10) - 0.8),
          sus4: k * (c[(r + 5) % 12] / thirdE - 1.25),
          sus2: k * (c[(r + 2) % 12] / thirdE - 1.7),
        };
        scores.push(cands.map((q) => sc[q]));
      }
      const n = scores.length, m = cands.length;
      let prev = scores[0].slice();
      const back = [];
      for (let t = 1; t < n; t++) {
        const cur = new Array(m), bk = new Array(m);
        for (let a = 0; a < m; a++) {
          let best = -Infinity, bi = 0;
          for (let b = 0; b < m; b++) { const v = prev[b] - (a === b ? 0 : changePenalty); if (v > best) { best = v; bi = b; } }
          cur[a] = best + scores[t][a]; bk[a] = bi;
        }
        back.push(bk); prev = cur;
      }
      let st = 0;
      for (let a = 1; a < m; a++) if (prev[a] > prev[st]) st = a;
      for (let t = n - 1; t >= 0; t--) { out[i + t].quality = cands[st]; if (t > 0) st = back[t - 1][st]; }
    }
    i = j + 1;
  }
  return out;
}

/** Run the whole pipeline (convenience for tests). */
export function analyze(samples, sampleRate, opts = {}) {
  const x = resample(samples, sampleRate, ANALYSIS_RATE);
  const feat = extractFeatures(x, opts.onProgress);
  const { bpm, beats } = trackBeats(feat);
  const segs = beatSync(feat, beats);
  const simple = decodeChords(segs, { qualities: SIMPLE_QUALITIES });
  const full = { key: simple.key, labels: refineQualities(segs, simple.labels) };
  return { feat, bpm, beats, segs, full, simple };
}
