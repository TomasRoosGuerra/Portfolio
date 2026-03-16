(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* Year */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Page Loader */
  window.addEventListener("load", () => {
    const loader = $(".page-loader");
    if (loader) {
      setTimeout(() => loader.classList.add("loaded"), 150);
      setTimeout(() => loader.remove(), 800);
    }
  });

  /* Cursor Dot (desktop) */
  const dot = $(".cursor-dot");
  if (dot && window.matchMedia("(pointer: fine)").matches) {
    let mx = 0, my = 0, dx = 0, dy = 0;
    document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.classList.add("visible"); });
    document.addEventListener("mouseleave", () => dot.classList.remove("visible"));

    (function move() {
      dx = lerp(dx, mx, 0.15);
      dy = lerp(dy, my, 0.15);
      dot.style.left = dx + "px";
      dot.style.top = dy + "px";
      requestAnimationFrame(move);
    })();

    const targets = "a, button, .cs-card, .cs-stat, .btn";
    document.addEventListener("mouseover", (e) => { if (e.target.closest(targets)) dot.classList.add("hover"); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest(targets)) dot.classList.remove("hover"); });
  }

  /* Header scroll */
  const header = $(".site-header");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header?.classList.toggle("scrolled", window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  });

  /* Scroll reveals */
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal-up").forEach((el) => obs.observe(el));

  /* Keyboard a11y */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") document.body.classList.add("keyboard-navigation");
  });
  document.addEventListener("mousedown", () => document.body.classList.remove("keyboard-navigation"));
})();
