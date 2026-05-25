/* ============================================================
   site.js — shared interactions
   Header state · mobile nav · scroll-reveal · scrollspy ·
   keyboard-focus detection · footer year.
   ============================================================ */
(function () {
  "use strict";

  var doc = document;

  /* ---- Footer year ------------------------------------------ */
  function setYear() {
    var el = doc.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---- Keyboard-focus detection ----------------------------- */
  function focusMode() {
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Tab") doc.body.classList.add("keyboard-nav");
    });
    doc.addEventListener("mousedown", function () {
      doc.body.classList.remove("keyboard-nav");
    });
  }

  /* ---- Scroll-reveal ---------------------------------------- */
  var revealObserver = null;
  window.__observeReveal = function () {
    var nodes = doc.querySelectorAll(".reveal:not([data-revealed])");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.setAttribute("data-revealed", "");
        el.classList.add("in-view");
      });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
      );
    }
    nodes.forEach(function (el) {
      el.setAttribute("data-revealed", "");
      revealObserver.observe(el);
    });
  };

  /* ---- Mobile navigation ------------------------------------ */
  function mobileNav() {
    var toggle = doc.getElementById("nav-toggle");
    var links = doc.getElementById("nav-links");
    if (!toggle || !links) return;

    function setOpen(open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(!links.classList.contains("is-open"));
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    var mq = window.matchMedia("(min-width: 901px)");
    (mq.addEventListener
      ? mq.addEventListener.bind(mq, "change")
      : mq.addListener.bind(mq))(function () {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---- Header state + scrollspy ----------------------------- */
  function scrollEffects() {
    var header = doc.getElementById("site-header");
    var navLinks = Array.prototype.slice.call(
      doc.querySelectorAll('.nav__link[href^="#"]')
    );
    var sections = navLinks
      .map(function (l) {
        return doc.getElementById(l.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;

      if (header) header.classList.toggle("is-scrolled", y > 8);

      if (sections.length) {
        var marker = y + 130;
        var current = sections[0];
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].offsetTop <= marker) current = sections[i];
        }
        // bottom of page → last section
        if (
          window.innerHeight + y >=
          doc.body.offsetHeight - 4
        ) {
          current = sections[sections.length - 1];
        }
        navLinks.forEach(function (l) {
          var on = l.getAttribute("href") === "#" + current.id;
          l.classList.toggle("is-active", on);
          if (on) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---- Boot ------------------------------------------------- */
  function boot() {
    setYear();
    focusMode();
    mobileNav();
    scrollEffects();
    window.__observeReveal();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
