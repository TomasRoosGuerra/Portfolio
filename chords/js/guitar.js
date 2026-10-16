// Chord Finder — guitar layer: voicings, difficulty, capo choice, diagrams.

import { NOTE_NAMES, QUALITIES } from "./analysis.js";

const X = -1; // muted string
// Strings low E → high e. Open shapes players actually reach for.
const OPEN = {
  "C:maj": [X, 3, 2, 0, 1, 0], "C:7": [X, 3, 2, 3, 1, 0], "C:maj7": [X, 3, 2, 0, 0, 0],
  "C:sus2": [X, 3, 0, 0, 1, 3], "C:sus4": [X, 3, 3, 0, 1, 1],
  "D:maj": [X, X, 0, 2, 3, 2], "D:min": [X, X, 0, 2, 3, 1], "D:7": [X, X, 0, 2, 1, 2],
  "D:m7": [X, X, 0, 2, 1, 1], "D:maj7": [X, X, 0, 2, 2, 2], "D:sus2": [X, X, 0, 2, 3, 0],
  "D:sus4": [X, X, 0, 2, 3, 3], "D:dim": [X, X, 0, 1, 3, 1],
  "G:maj": [3, 2, 0, 0, 0, 3], "G:7": [3, 2, 0, 0, 0, 1], "G:maj7": [3, 2, 0, 0, 0, 2],
  "G:sus2": [3, 0, 0, 0, 3, 3], "G:sus4": [3, 3, 0, 0, 1, 3],
  "E:maj": [0, 2, 2, 1, 0, 0], "E:min": [0, 2, 2, 0, 0, 0], "E:7": [0, 2, 0, 1, 0, 0],
  "E:m7": [0, 2, 0, 0, 0, 0], "E:maj7": [0, 2, 1, 1, 0, 0], "E:sus4": [0, 2, 2, 2, 0, 0],
  "E:sus2": [0, 2, 4, 4, 0, 0],
  "A:maj": [X, 0, 2, 2, 2, 0], "A:min": [X, 0, 2, 2, 1, 0], "A:7": [X, 0, 2, 0, 2, 0],
  "A:m7": [X, 0, 2, 0, 1, 0], "A:maj7": [X, 0, 2, 1, 2, 0], "A:sus2": [X, 0, 2, 2, 0, 0],
  "A:sus4": [X, 0, 2, 2, 3, 0],
  "F:maj7": [X, X, 3, 2, 1, 0], "B:7": [X, 2, 1, 2, 0, 2],
};

// Movable barre shapes, frets relative to the root fret r.
const E_SHAPE = {
  maj: [0, 2, 2, 1, 0, 0], min: [0, 2, 2, 0, 0, 0], "7": [0, 2, 0, 1, 0, 0], m7: [0, 2, 0, 0, 0, 0],
  maj7: [0, X, 1, 1, 0, X], sus4: [0, 2, 2, 2, 0, 0], dim: [0, 1, 2, 0, X, X],
};
const A_SHAPE = {
  maj: [X, 0, 2, 2, 2, 0], min: [X, 0, 2, 2, 1, 0], "7": [X, 0, 2, 0, 2, 0], m7: [X, 0, 2, 0, 1, 0],
  maj7: [X, 0, 2, 1, 2, 0], sus4: [X, 0, 2, 2, 3, 0], sus2: [X, 0, 2, 2, 0, 0], dim: [X, 0, 1, 2, 1, X],
};

const shift = (shape, r) => shape.map((f) => (f === X ? X : f + r));

/** Best voicing for a chord: open shape if one exists, else the lowest barre. */
export function voicing(root, quality) {
  root = ((root % 12) + 12) % 12;
  const key = NOTE_NAMES[root] + ":" + quality;
  if (OPEN[key]) return { frets: OPEN[key], difficulty: openDifficulty(quality), barre: false };
  const opts = [];
  const rE = (root - 4 + 12) % 12, rA = (root - 9 + 12) % 12;
  if (E_SHAPE[quality]) opts.push({ frets: shift(E_SHAPE[quality], rE), r: rE });
  if (A_SHAPE[quality]) opts.push({ frets: shift(A_SHAPE[quality], rA), r: rA });
  opts.sort((a, b) => a.r - b.r);
  const best = opts[0];
  if (!best) return { frets: [X, X, X, X, X, X], difficulty: 3, barre: false };
  const open = best.r === 0;
  return { frets: best.frets, difficulty: open ? openDifficulty(quality) : 1 + best.r * 0.03, barre: !open };
}

function openDifficulty(q) {
  return q === "maj" || q === "min" ? 0 : 0.25;
}

/**
 * Pick the capo position whose shapes are easiest to play over the song.
 * @param {{root:number, quality:string, beats:number}[]} usage chords with how long they sound
 */
export function suggestCapo(usage) {
  const results = [];
  for (let capo = 0; capo <= 7; capo++) {
    let cost = 0, total = 0;
    for (const u of usage) {
      if (u.root < 0) continue;
      const v = voicing(u.root - capo, u.quality);
      // Each distinct chord costs a bit (it must be learned), time spent costs more.
      cost += v.difficulty * (1 + Math.sqrt(u.beats));
      total += 1 + Math.sqrt(u.beats);
    }
    results.push({ capo, cost: total ? cost / total + capo * 0.015 : 0 });
  }
  results.sort((a, b) => a.cost - b.cost);
  return results[0].capo;
}

/** SVG chord diagram. */
export function diagramSVG(frets, { size = 1 } = {}) {
  const w = 76 * size, h = 92 * size;
  const left = 14 * size, top = 20 * size, gap = 10 * size, fretGap = 14 * size, nFrets = 5;
  const played = frets.filter((f) => f > 0);
  const minF = played.length ? Math.min(...played) : 1;
  const maxF = played.length ? Math.max(...played) : 1;
  const base = maxF <= 5 ? 1 : minF; // show from the nut when it fits
  const rel = (f) => f - base + 1;
  let s = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Chord diagram, frets ${frets.map((f) => (f < 0 ? "x" : f)).join(" ")}">`;
  // nut or fret number
  if (base === 1) s += `<rect x="${left}" y="${top - 2.5 * size}" width="${gap * 5}" height="${3 * size}" fill="currentColor"/>`;
  else s += `<text x="${left - 4 * size}" y="${top + fretGap * 0.7}" text-anchor="end" font-size="${9 * size}" fill="currentColor" opacity=".75">${base}</text>`;
  for (let i = 0; i <= nFrets; i++) s += `<line x1="${left}" x2="${left + gap * 5}" y1="${top + i * fretGap}" y2="${top + i * fretGap}" stroke="currentColor" stroke-opacity=".35" stroke-width="${size}"/>`;
  for (let i = 0; i < 6; i++) s += `<line y1="${top}" y2="${top + nFrets * fretGap}" x1="${left + i * gap}" x2="${left + i * gap}" stroke="currentColor" stroke-opacity=".55" stroke-width="${size}"/>`;
  // barre: lowest fretted position shared by a run of strings up to the top string
  if (played.length >= 4 && minF > 0) {
    const firstIdx = frets.findIndex((f) => f === minF);
    const run = frets.slice(firstIdx);
    if (frets[5] === minF && run.every((f) => f >= minF || f === X) && frets.filter((f) => f === minF).length >= 2) {
      const y = top + (rel(minF) - 0.5) * fretGap;
      s += `<rect x="${left + firstIdx * gap - 4 * size}" y="${y - 4 * size}" width="${(5 - firstIdx) * gap + 8 * size}" height="${8 * size}" rx="${4 * size}" fill="var(--accent, #E0A458)"/>`;
    }
  }
  frets.forEach((f, i) => {
    const x = left + i * gap;
    if (f === X) s += `<text x="${x}" y="${top - 6 * size}" text-anchor="middle" font-size="${8 * size}" fill="currentColor" opacity=".6">×</text>`;
    else if (f === 0) s += `<circle cx="${x}" cy="${top - 8 * size}" r="${2.8 * size}" fill="none" stroke="currentColor" stroke-width="${size}"/>`;
    else s += `<circle cx="${x}" cy="${top + (rel(f) - 0.5) * fretGap}" r="${4 * size}" fill="var(--accent, #E0A458)"/>`;
  });
  return s + "</svg>";
}

export { QUALITIES };
