// Runs the heavy analysis off the main thread.
import { ANALYSIS_RATE, resample, extractFeatures, trackBeats } from "./analysis.js";

self.onmessage = (e) => {
  const { samples, sampleRate } = e.data;
  try {
    const progress = (p, stage) => self.postMessage({ type: "progress", p, stage });
    progress(0, "rhythm");
    const x = sampleRate === ANALYSIS_RATE ? samples : resample(samples, sampleRate, ANALYSIS_RATE);
    const feat = extractFeatures(x, progress);
    progress(0.8, "beats");
    const { bpm, beats } = trackBeats(feat);
    progress(0.95, "chart");
    self.postMessage({
      type: "done",
      feat: {
        duration: feat.duration, tuning: feat.tuning, chromaHop: feat.chromaHop, chromaWin: feat.chromaWin,
        treble: feat.treble.map((a) => Array.from(a)), bass: feat.bass.map((a) => Array.from(a)),
        loudness: Array.from(feat.loudness), onset: Array.from(feat.onset), onsetHop: feat.onsetHop,
      },
      bpm, beats,
    });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err && err.message || err) });
  }
};
