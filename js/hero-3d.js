/* ============================================================
   hero-3d.js — wires the hero.

   Creates the single GL context, stacks the background gradient
   and the hero form on it, and feeds it one number: how far the
   reader has scrolled through the hero stage.

   Everything else (loop, resize, tiering, pausing) lives in
   gl/core.js. Adding a layer here is one import and one .add().
   ============================================================ */
import { createGL } from "./gl/core.js";
import { createGradient } from "./gl/layers/gradient.js";
import { createBlob } from "./gl/layers/blob.js";

function boot() {
  var stage = document.getElementById("hero-stage");
  var hero = document.getElementById("about");
  if (!hero) return;

  var gl = createGL({ watch: stage || hero });
  if (!gl) return; // no WebGL — the site is unchanged without it

  gl.add(createGradient());
  gl.add(createBlob(gl.state));
  gl.start();

  window.__scroll.subscribe(function (s) {
    /* Desktop: the stage is taller than the viewport and pinned,
       so progress is travel through its own overhang.
       Mobile / reduced motion: no pin, so one viewport of scroll
       is the full arc. */
    var p = window.__scroll.progress(stage);
    if (p === 0 && s.vh) p = Math.min(s.y / s.vh, 1);
    gl.setProgress(p);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
