/* ============================================================
   scroll.js — the ONE scroll listener on the site.

   Every consumer (header state, scrollspy, the WebGL hero)
   subscribes here instead of adding its own rAF-throttled
   listener. One read of scrollY per frame, no layout thrash
   from competing handlers.

   Loaded before site.js; exposes window.__scroll.
   ============================================================ */
(function () {
  "use strict";

  var subs = [];
  var ticking = false;

  var state = { y: 0, vh: 0 };

  function update() {
    ticking = false;
    state.y = window.scrollY || window.pageYOffset || 0;
    state.vh = window.innerHeight;
    for (var i = 0; i < subs.length; i++) subs[i](state);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  window.__scroll = {
    /** fn(state) is called immediately, then once per scroll frame. */
    subscribe: function (fn) {
      subs.push(fn);
      fn(state);
      return function () {
        var i = subs.indexOf(fn);
        if (i > -1) subs.splice(i, 1);
      };
    },

    /**
     * 0..1 progress of a tall element scrolling through its own
     * overhang — the sticky-pin driver. Returns 0 when the element
     * is no taller than the viewport (mobile, pin disabled).
     */
    progress: function (el) {
      if (!el) return 0;
      var rect = el.getBoundingClientRect();
      var travel = rect.height - window.innerHeight;
      if (travel <= 1) return 0;
      return clamp01(-rect.top / travel);
    },

    /** 0..1 as an element crosses the viewport, entry to exit. */
    through: function (el) {
      if (!el) return 0;
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight;
      return clamp01((vh - rect.top) / (vh + rect.height));
    },

    refresh: onScroll,
  };

  update();
})();
