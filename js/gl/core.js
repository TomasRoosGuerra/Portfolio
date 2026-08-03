/* ============================================================
   gl/core.js — the ONE WebGL context on the site.

   Owns: renderer, canvas, RAF loop, resize, DPR/quality tier,
   smoothed pointer, smoothed scroll progress, visibility and
   offscreen pausing.

   Layers own NONE of that. A layer is a plain object:

     { scene, camera, update?(state), resize?(state), dispose?() }

   and is drawn in the order it was added, over the previous one.
   Adding a new effect = one file, zero plumbing.
   ============================================================ */
import * as THREE from "three";

/* ---- Capability + tier ------------------------------------- */
export const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* dpr  — hard cap on device pixel ratio (fill rate is the cost driver)
   q    — quality scalar layers multiply their own detail by (0..1) */
const TIERS = {
  low: { dpr: 1.0, q: 0.45 },
  mid: { dpr: 1.25, q: 0.7 },
  high: { dpr: 1.5, q: 1.0 },
};

export function detectTier() {
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var narrow = window.innerWidth < 900;
  var mem = navigator.deviceMemory || 4;
  var cores = navigator.hardwareConcurrency || 4;

  if (coarse || narrow) return mem <= 2 || cores <= 4 ? "low" : "mid";
  return cores <= 4 || mem <= 4 ? "mid" : "high";
}

export function hasWebGL() {
  try {
    var c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch (e) {
    return false;
  }
}

/* ---- Core --------------------------------------------------- */
/**
 * @param {Object}  opts
 * @param {Element} [opts.watch]  element whose visibility gates the RAF loop
 * @param {number}  [opts.ease]   pointer/progress smoothing factor per frame
 */
export function createGL(opts) {
  opts = opts || {};
  if (!hasWebGL()) return null;

  var tierName = detectTier();
  var tier = TIERS[tierName];

  var canvas = document.createElement("canvas");
  canvas.id = "gl-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;" +
    "z-index:-1;pointer-events:none;display:block;";

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      depth: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
  } catch (e) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.dpr));
  renderer.autoClear = false;
  document.body.insertBefore(canvas, document.body.firstChild);

  var layers = [];
  var ease = opts.ease != null ? opts.ease : 0.055;

  var state = {
    time: 0,
    dt: 0,
    /* smoothed, -1..1, origin at viewport centre, y up */
    pointer: new THREE.Vector2(0, 0),
    /* smoothed 0..1 scroll progress through the driving element */
    progress: 0,
    size: new THREE.Vector2(1, 1),
    dpr: renderer.getPixelRatio(),
    tier: tierName,
    quality: tier.q,
    reduced: REDUCED_MOTION,
  };

  var pTarget = new THREE.Vector2(0, 0);
  var progressTarget = 0;

  /* ---- Resize ---------------------------------------------- */
  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w === state.size.x && h === state.size.y) return;
    state.size.set(w, h);
    renderer.setSize(w, h, false);
    state.dpr = renderer.getPixelRatio();
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].resize) layers[i].resize(state);
    }
    /* Under reduced motion there is no loop to pick this up, so the
       single frame has to be redrawn here or the canvas goes stale. */
    if (REDUCED_MOTION && layers.length) draw();
  }

  /* ---- Pointer --------------------------------------------- */
  function setPointer(cx, cy) {
    pTarget.set(
      (cx / window.innerWidth) * 2 - 1,
      -(cy / window.innerHeight) * 2 + 1
    );
  }

  window.addEventListener(
    "mousemove",
    function (e) {
      setPointer(e.clientX, e.clientY);
    },
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    function (e) {
      var t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    },
    { passive: true }
  );
  window.addEventListener("resize", resize, { passive: true });

  /* ---- Loop ------------------------------------------------- */
  var raf = 0;
  var last = 0;
  var running = false;
  var visible = true;
  var onscreen = true;

  function draw() {
    renderer.clear(true, true, false);
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      if (l.update) l.update(state);
      if (i > 0) renderer.clearDepth();
      renderer.render(l.scene, l.camera);
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min((now - last) * 0.001, 0.05) : 0.016;
    last = now;
    state.dt = dt;
    state.time += dt;

    /* frame-rate independent exponential smoothing */
    var k = 1 - Math.pow(1 - ease, dt * 60);
    state.pointer.x += (pTarget.x - state.pointer.x) * k;
    state.pointer.y += (pTarget.y - state.pointer.y) * k;
    state.progress += (progressTarget - state.progress) * k;

    draw();
  }

  function sync() {
    var should = visible && onscreen && !REDUCED_MOTION;
    if (should === running) return;
    running = should;
    if (running) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
    }
  }

  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    sync();
  });

  /* Pause when the driving element scrolls out of view entirely. */
  if (opts.watch && "IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        onscreen = entries[0].isIntersecting;
        sync();
      },
      { rootMargin: "20% 0px" }
    ).observe(opts.watch);
  }

  /* ---- Public ---------------------------------------------- */
  var gl = {
    renderer: renderer,
    canvas: canvas,
    state: state,

    add: function (layer) {
      layers.push(layer);
      if (layer.resize) layer.resize(state);
      return layer;
    },

    /** raw 0..1; core smooths it into state.progress */
    setProgress: function (v) {
      progressTarget = v < 0 ? 0 : v > 1 ? 1 : v;
    },

    start: function () {
      resize();
      if (REDUCED_MOTION) {
        /* one composed frame, then nothing moves again */
        state.progress = progressTarget;
        draw();
        return gl;
      }
      sync();
      return gl;
    },

    dispose: function () {
      cancelAnimationFrame(raf);
      layers.forEach(function (l) {
        if (l.dispose) l.dispose();
      });
      layers.length = 0;
      renderer.dispose();
      canvas.remove();
    },
  };

  resize();
  return gl;
}
