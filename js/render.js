/* ============================================================
   render.js — renders the work grid, gallery, writing list,
   case studies and blog posts from the data files.
   Includes a small, dependency-free Markdown parser.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Helpers ---------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escAttr(s) {
    return esc(s).replace(/"/g, "&quot;");
  }
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function formatDate(iso) {
    try {
      return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return iso;
    }
  }
  function qsParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  function setMeta(name, content) {
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }
  function rescan() {
    if (typeof window.__observeReveal === "function") window.__observeReveal();
  }

  var ARROW_UR =
    '<svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
  var ARROW_LEFT =
    '<svg class="arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';

  /* ============================================================
     Markdown → HTML  (paragraphs, headings, lists, quotes,
     code, rules, links, images, bold, italic, inline code)
     ============================================================ */
  function inlineMd(text) {
    // `text` is already HTML-escaped.
    text = text.replace(/`([^`]+)`/g, function (m, c) {
      return "<code>" + c + "</code>";
    });
    text = text.replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      function (m, alt, src) {
        return '<img src="' + src + '" alt="' + alt + '" loading="lazy" decoding="async">';
      }
    );
    text = text.replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      function (m, label, url) {
        var ext = /^https?:/i.test(url);
        return (
          '<a href="' +
          url +
          '"' +
          (ext ? ' target="_blank" rel="noopener noreferrer"' : "") +
          ">" +
          label +
          "</a>"
        );
      }
    );
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return text;
  }

  function mdToHtml(src) {
    var lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
    var out = [];
    var para = [];
    var i = 0;

    function flush() {
      if (para.length) {
        out.push("<p>" + inlineMd(esc(para.join(" "))) + "</p>");
        para = [];
      }
    }

    while (i < lines.length) {
      var t = lines[i].trim();

      if (t === "") {
        flush();
        i++;
        continue;
      }
      if (t.indexOf("```") === 0) {
        flush();
        i++;
        var code = [];
        while (i < lines.length && lines[i].trim().indexOf("```") !== 0) {
          code.push(lines[i]);
          i++;
        }
        i++;
        out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
        continue;
      }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
        flush();
        out.push("<hr>");
        i++;
        continue;
      }
      var h = t.match(/^(#{2,4})\s+(.*)$/);
      if (h) {
        flush();
        var lvl = h[1].length;
        out.push("<h" + lvl + ">" + inlineMd(esc(h[2])) + "</h" + lvl + ">");
        i++;
        continue;
      }
      if (t.charAt(0) === ">") {
        flush();
        var q = [];
        while (i < lines.length && lines[i].trim().charAt(0) === ">") {
          q.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        out.push("<blockquote>" + inlineMd(esc(q.join(" "))) + "</blockquote>");
        continue;
      }
      if (/^[-*]\s+/.test(t)) {
        flush();
        var ul = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          ul.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        out.push(
          "<ul>" +
            ul
              .map(function (it) {
                return "<li>" + inlineMd(esc(it)) + "</li>";
              })
              .join("") +
            "</ul>"
        );
        continue;
      }
      if (/^\d+\.\s+/.test(t)) {
        flush();
        var ol = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          ol.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        out.push(
          "<ol>" +
            ol
              .map(function (it) {
                return "<li>" + inlineMd(esc(it)) + "</li>";
              })
              .join("") +
            "</ol>"
        );
        continue;
      }
      var imgOnly = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
      if (imgOnly) {
        flush();
        out.push(
          '<figure><img src="' +
            escAttr(imgOnly[2]) +
            '" alt="' +
            escAttr(imgOnly[1]) +
            '" loading="lazy" decoding="async"></figure>'
        );
        i++;
        continue;
      }
      para.push(t);
      i++;
    }
    flush();
    return out.join("\n");
  }

  /* ============================================================
     Homepage
     ============================================================ */
  function renderHomeWork() {
    var grid = document.getElementById("work-grid");
    if (!grid || !Array.isArray(window.PROJECTS)) return;
    var html = window.PROJECTS.map(function (p, idx) {
      var tags = (p.tags || [])
        .map(function (t) {
          return '<li class="tag">' + esc(t) + "</li>";
        })
        .join("");

      var mediaImages = (Array.isArray(p.images) && p.images.length
        ? p.images
        : [{ src: p.cover, alt: p.coverAlt || p.title }]
      );
      var mediaSlides = mediaImages
        .map(function (im) {
          return (
            '<span class="work-card__slide">' +
            '<img src="' +
            escAttr(im.src) +
            '" alt="' +
            escAttr(im.alt || p.title) +
            '" loading="lazy" decoding="async" draggable="false">' +
            "</span>"
          );
        })
        .join("");
      var mediaDots =
        mediaImages.length > 1
          ? '<span class="work-card__dots" aria-hidden="true">' +
            mediaImages
              .map(function (_, i) {
                return (
                  '<span class="work-card__dot' +
                  (i === 0 ? " is-active" : "") +
                  '"></span>'
                );
              })
              .join("") +
            "</span>"
          : "";

      return (
        '<a class="work-card reveal" style="--i:' +
        (idx % 2) +
        '" href="case.html?p=' +
        encodeURIComponent(p.slug) +
        '" aria-label="' +
        escAttr("View the " + p.title + " case study") +
        '">' +
        '<span class="work-card__media' +
        (mediaImages.length > 1 ? " work-card__media--scroll" : "") +
        '">' +
        '<span class="work-card__num" aria-hidden="true">' +
        pad2(idx + 1) +
        "</span>" +
        '<span class="work-card__track">' +
        mediaSlides +
        "</span>" +
        mediaDots +
        "</span>" +
        '<span class="work-card__body">' +
        '<span class="work-card__top">' +
        '<span class="work-card__title">' +
        esc(p.title) +
        "</span>" +
        '<span class="work-card__year">' +
        esc(p.year) +
        "</span>" +
        "</span>" +
        '<span class="work-card__desc">' +
        esc(p.cardDesc) +
        "</span>" +
        '<ul class="tags">' +
        tags +
        "</ul>" +
        '<span class="work-card__foot">' +
        '<span class="work-card__role">' +
        esc(p.role) +
        "</span>" +
        '<span class="work-card__link">View case ' +
        ARROW_UR +
        "</span>" +
        "</span>" +
        "</span>" +
        "</a>"
      );
    }).join("");
    grid.innerHTML = html;

    // Wire dot sync + prevent navigation when user is actively scrolling media
    grid.querySelectorAll(".work-card__media--scroll").forEach(function (m) {
      var track = m.querySelector(".work-card__track");
      var dots = m.querySelectorAll(".work-card__dot");
      if (!track || !dots.length) return;

      var scrollTimer;
      var lastScrollAt = 0;
      track.addEventListener("scroll", function () {
        lastScrollAt = Date.now();
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          var slides = track.querySelectorAll(".work-card__slide");
          var center = track.scrollLeft + track.clientWidth / 2;
          var nearest = 0;
          var nearestDist = Infinity;
          slides.forEach(function (s, i) {
            var c = s.offsetLeft + s.offsetWidth / 2;
            var d = Math.abs(c - center);
            if (d < nearestDist) { nearestDist = d; nearest = i; }
          });
          dots.forEach(function (d, i) {
            d.classList.toggle("is-active", i === nearest);
          });
        }, 50);
      }, { passive: true });

      // Block link navigation if user just scrolled the media
      var card = m.closest(".work-card");
      if (card) {
        card.addEventListener("click", function (e) {
          if (Date.now() - lastScrollAt < 250) {
            e.preventDefault();
          }
        });
      }
    });
  }

  function renderHomeGallery() {
    var grid = document.getElementById("gallery");
    if (!grid || !Array.isArray(window.VISUAL_WORK)) return;
    grid.innerHTML = window.VISUAL_WORK.map(function (v, idx) {
      return (
        '<figure class="gallery__item reveal" style="--i:' +
        (idx % 3) +
        '">' +
        '<img src="' +
        escAttr(v.img) +
        '" alt="' +
        escAttr(v.title) +
        '" loading="lazy" decoding="async">' +
        '<figcaption class="gallery__cap">' +
        "<h3>" +
        esc(v.title) +
        "</h3><p>" +
        esc(v.desc) +
        "</p></figcaption>" +
        "</figure>"
      );
    }).join("");
  }

  /* ============================================================
     Lightbox — slideshow over the case study cover image
     ============================================================ */
  function buildLightbox() {
    if (document.getElementById("lightbox")) return document.getElementById("lightbox");
    var el = document.createElement("div");
    el.id = "lightbox";
    el.className = "lightbox";
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Image viewer");
    el.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">&#8250;</button>' +
      '<div class="lightbox__track" tabindex="-1"></div>' +
      '<div class="lightbox__dots" aria-hidden="true"></div>';
    document.body.appendChild(el);
    return el;
  }

  function openLightbox(images, startIdx) {
    var el = buildLightbox();
    var track = el.querySelector(".lightbox__track");
    var dots = el.querySelector(".lightbox__dots");
    var idx = startIdx || 0;

    track.innerHTML = images
      .map(function (im) {
        return (
          '<figure class="lightbox__slide"><img src="' +
          escAttr(im.src) +
          '" alt="' +
          escAttr(im.alt || "") +
          '"></figure>'
        );
      })
      .join("");
    dots.innerHTML = images
      .map(function (_, i) {
        return '<span class="lightbox__dot' + (i === idx ? " is-active" : "") + '"></span>';
      })
      .join("");

    function go(n) {
      idx = (n + images.length) % images.length;
      var slides = track.querySelectorAll(".lightbox__slide");
      if (slides[idx]) slides[idx].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      dots.querySelectorAll(".lightbox__dot").forEach(function (d, i) {
        d.classList.toggle("is-active", i === idx);
      });
    }

    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    // jump after layout
    requestAnimationFrame(function () {
      var slides = track.querySelectorAll(".lightbox__slide");
      if (slides[idx]) slides[idx].scrollIntoView({ inline: "center", block: "nearest" });
    });

    function close() {
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
    }
    document.addEventListener("keydown", onKey);

    el.querySelector(".lightbox__close").onclick = close;
    el.querySelector(".lightbox__nav--prev").onclick = function () { go(idx - 1); };
    el.querySelector(".lightbox__nav--next").onclick = function () { go(idx + 1); };
    el.onclick = function (e) { if (e.target === el) close(); };

    // sync dots while user scrolls the track
    var scrollTimer;
    track.onscroll = function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var slides = track.querySelectorAll(".lightbox__slide");
        var center = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0;
        var nearestDist = Infinity;
        slides.forEach(function (s, i) {
          var c = s.offsetLeft + s.offsetWidth / 2;
          var d = Math.abs(c - center);
          if (d < nearestDist) { nearestDist = d; nearest = i; }
        });
        idx = nearest;
        dots.querySelectorAll(".lightbox__dot").forEach(function (d, i) {
          d.classList.toggle("is-active", i === idx);
        });
      }, 60);
    };
  }
  window.openLightbox = openLightbox;

  function renderHomeWriting() {
    var list = document.getElementById("writing-list");
    if (!list) return;
    var posts = Array.isArray(window.POSTS) ? window.POSTS : [];
    if (!posts.length) {
      list.innerHTML =
        '<p class="muted" style="padding:var(--sp-3) 0">No posts yet. Check back soon.</p>';
      return;
    }
    list.innerHTML = posts
      .map(function (post, idx) {
        return (
          '<a class="writing-item reveal" style="--i:' +
          idx +
          '" href="post.html?p=' +
          encodeURIComponent(post.slug) +
          '" aria-label="' +
          escAttr("Read: " + post.title) +
          '">' +
          '<span class="writing-item__main">' +
          '<span class="writing-item__date">' +
          esc(formatDate(post.date)) +
          "</span>" +
          '<span class="writing-item__title">' +
          esc(post.title) +
          "</span>" +
          '<span class="writing-item__excerpt">' +
          esc(post.excerpt) +
          "</span>" +
          "</span>" +
          '<span class="writing-item__arrow" aria-hidden="true">' +
          ARROW_UR +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  /* ============================================================
     Case study page
     ============================================================ */
  function emptyState(root, heading, msg, href, label) {
    root.innerHTML =
      '<div class="wrap state"><h2>' +
      esc(heading) +
      "</h2><p>" +
      esc(msg) +
      '</p><p style="margin-top:var(--sp-3)"><a class="btn btn--ghost" href="' +
      href +
      '">' +
      esc(label) +
      "</a></p></div>";
  }

  function renderCase() {
    var root = document.getElementById("case-root");
    if (!root || !Array.isArray(window.PROJECTS)) return;
    var slug = qsParam("p");
    var list = window.PROJECTS;
    var idx = -1;
    for (var k = 0; k < list.length; k++) {
      if (list[k].slug === slug) idx = k;
    }
    if (idx === -1) {
      document.title = "Project not found | Tomas Roos";
      emptyState(
        root,
        "Project not found",
        "That case study doesn't exist or may have moved.",
        "index.html#work",
        "Back to all work"
      );
      return;
    }

    var p = list[idx];
    var prev = list[(idx - 1 + list.length) % list.length];
    var next = list[(idx + 1) % list.length];

    document.title = p.title + " | Tomas Roos";
    setMeta("description", p.summary);

    function cards(arr) {
      return arr
        .map(function (c) {
          if (c.img) {
            return (
              '<div class="cs-card cs-card--media">' +
              '<figure class="cs-card__media"><img src="' +
              escAttr(c.img) +
              '" alt="' +
              escAttr(c.imgAlt || c.h || "") +
              '" loading="lazy" decoding="async"></figure>' +
              "</div>"
            );
          }
          return (
            '<div class="cs-card"><h3>' +
            esc(c.h) +
            "</h3>" +
            (c.p ? "<p>" + esc(c.p) + "</p>" : "") +
            "</div>"
          );
        })
        .join("");
    }
    function meta(label, value) {
      return "<div><dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
    }

    var timeline = p.ux
      .map(function (u) {
        return (
          '<div class="cs-timeline__item reveal"><h3>' +
          esc(u.h) +
          "</h3><p>" +
          esc(u.p) +
          "</p></div>"
        );
      })
      .join("");

    var mockup = p.mockup
      ? '<figure class="cs-mockup reveal"><img src="' +
        escAttr(p.mockup) +
        '" alt="' +
        escAttr(p.mockupAlt || p.title + " interface") +
        '" loading="lazy" decoding="async"></figure>'
      : "";

    root.innerHTML =
      '<div class="wrap"><a class="back-link" href="index.html#work">' +
      ARROW_LEFT +
      " All work</a></div>" +
      '<header class="cs-header wrap">' +
      '<p class="eyebrow reveal">Case study ' +
      pad2(idx + 1) +
      "</p>" +
      '<h1 class="cs-title reveal" style="--i:1">' +
      (p.logo
        ? '<img class="cs-title__logo" src="' +
          escAttr(p.logo) +
          '" alt="' +
          escAttr(p.logoAlt || p.title) +
          '" decoding="async">'
        : esc(p.title)) +
      "</h1>" +
      '<p class="cs-summary reveal" style="--i:2">' +
      esc(p.summary) +
      "</p>" +
      '<dl class="cs-meta reveal" style="--i:3">' +
      meta("Role", p.role) +
      meta("Year", p.year) +
      meta("Platform", p.platform) +
      meta("Impact", p.impact) +
      "</dl>" +
      "</header>" +
      '<div class="wrap"><figure class="cs-cover reveal"><img src="' +
      escAttr(p.cover) +
      '" alt="' +
      escAttr(p.coverAlt || p.title) +
      '" loading="lazy" decoding="async"></figure></div>' +
      // Devices showcase (optional)
      (p.devices && Array.isArray(p.devices.images) && p.devices.images.length
        ? '<section class="cs-block"><div class="wrap">' +
          '<p class="eyebrow reveal">' +
          esc(p.devices.eyebrow || "Devices") +
          "</p>" +
          '<h2 class="cs-block__title reveal" style="--i:1">' +
          esc(p.devices.title || "Across devices") +
          "</h2>" +
          (p.devices.body
            ? '<p class="cs-block__lead reveal" style="--i:2">' +
              esc(p.devices.body) +
              "</p>"
            : "") +
          '<div class="cs-devices reveal" style="--i:3">' +
          p.devices.images
            .map(function (im) {
              return (
                '<figure class="cs-devices__item"><img src="' +
                escAttr(im.src) +
                '" alt="' +
                escAttr(im.alt || "") +
                '" loading="lazy" decoding="async">' +
                (im.caption
                  ? '<figcaption>' + esc(im.caption) + "</figcaption>"
                  : "") +
                "</figure>"
              );
            })
            .join("") +
          "</div>" +
          "</div></section>"
        : "") +
      // Overview
      '<section class="cs-block"><div class="wrap">' +
      '<p class="eyebrow reveal">Overview</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">The problem &amp; the approach</h2>' +
      '<p class="cs-block__lead reveal" style="--i:2">' +
      esc(p.overview.lead) +
      "</p>" +
      '<div class="cs-cards reveal" style="--i:3">' +
      cards(p.overview.cards) +
      "</div>" +
      (p.overview.research
        ? '<div class="cs-research reveal" style="--i:4">' +
          '<h3 class="cs-research__title">' +
          esc(p.overview.research.title) +
          "</h3>" +
          (p.overview.research.image
            ? '<figure class="cs-research__figure"><img src="' +
              escAttr(p.overview.research.image) +
              '" alt="' +
              escAttr(p.overview.research.imageAlt || "") +
              '" loading="lazy" decoding="async"></figure>'
            : "") +
          '<div class="cs-research__body">' +
          (p.overview.research.body || [])
            .map(function (para) {
              return "<p>" + esc(para) + "</p>";
            })
            .join("") +
          "</div>" +
          "</div>"
        : "") +
      "</div></section>" +
      // Phases (optional, alternating background)
      (Array.isArray(p.phases) && p.phases.length
        ? p.phases
            .map(function (ph, pi) {
              var alt = pi % 2 === 0; // first phase alt-bg
              return (
                '<section class="cs-block' +
                (alt ? " cs-block--alt" : "") +
                '"><div class="wrap">' +
                '<p class="eyebrow reveal">' +
                esc(ph.eyebrow || "Process") +
                "</p>" +
                '<h2 class="cs-block__title reveal" style="--i:1">' +
                esc(ph.title) +
                "</h2>" +
                (ph.image
                  ? '<figure class="cs-process__figure reveal" style="--i:2"><img src="' +
                    escAttr(ph.image) +
                    '" alt="' +
                    escAttr(ph.imageAlt || "") +
                    '" loading="lazy" decoding="async"></figure>'
                  : "") +
                '<div class="cs-process__body reveal" style="--i:3">' +
                (ph.body || [])
                  .map(function (para) {
                    return "<p>" + esc(para) + "</p>";
                  })
                  .join("") +
                "</div>" +
                "</div></section>"
              );
            })
            .join("")
        : "") +
      // Experience — alternate bg based on last phase
      '<section class="cs-block' +
      ((Array.isArray(p.phases) && p.phases.length && (p.phases.length % 2 === 0))
        ? " cs-block--alt"
        : (Array.isArray(p.phases) && p.phases.length ? "" : " cs-block--alt")) +
      '"><div class="wrap">' +
      '<p class="eyebrow reveal">Experience</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">How it works</h2>' +
      '<div class="cs-timeline">' +
      timeline +
      "</div>" +
      mockup +
      "</div></section>" +
      // Screens / product features (optional)
      (p.screens
        ? (function () {
            var screenImages = Array.isArray(p.screens.images) && p.screens.images.length
              ? p.screens.images
              : (p.screens.image ? [p.screens.image] : []);
            var hasList = Array.isArray(p.screens.list) && p.screens.list.length;
            var single = screenImages.length === 1;
            var figures = screenImages
              .map(function (im) {
                return (
                  '<figure class="cs-screens__item"><img src="' +
                  escAttr(im.src) +
                  '" alt="' +
                  escAttr(im.alt || "") +
                  '" loading="lazy" decoding="async">' +
                  (im.caption
                    ? '<figcaption>' + esc(im.caption) + "</figcaption>"
                    : "") +
                  "</figure>"
                );
              })
              .join("");
            var list = hasList
              ? '<ul class="cs-screens__list">' +
                p.screens.list
                  .map(function (it) {
                    if (typeof it === "string") {
                      return "<li>" + esc(it) + "</li>";
                    }
                    return (
                      "<li><h4>" + esc(it.h) + "</h4>" +
                      (it.p ? "<p>" + esc(it.p) + "</p>" : "") +
                      "</li>"
                    );
                  })
                  .join("") +
                "</ul>"
              : "";
            return (
              '<section class="cs-block"><div class="wrap">' +
              '<p class="eyebrow reveal">' +
              esc(p.screens.eyebrow || "Screens") +
              "</p>" +
              '<h2 class="cs-block__title reveal" style="--i:1">' +
              esc(p.screens.title || "In the app") +
              "</h2>" +
              (p.screens.body
                ? '<p class="cs-block__lead reveal" style="--i:2">' +
                  esc(p.screens.body) +
                  "</p>"
                : "") +
              '<div class="cs-screens' +
              (single && hasList ? " cs-screens--split" : "") +
              ' reveal" style="--i:3">' +
              figures +
              list +
              "</div>" +
              "</div></section>"
            );
          })()
        : "") +
      // Features
      '<section class="cs-block"><div class="wrap">' +
      '<p class="eyebrow reveal">Features</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">Key features</h2>' +
      (p.featuresLead
        ? '<p class="cs-block__lead reveal" style="--i:2">' +
          esc(p.featuresLead) +
          "</p>"
        : "") +
      '<div class="cs-cards' +
      (p.features && p.features.some(function (f) { return f.img; })
        ? " cs-cards--media"
        : "") +
      ' reveal" style="--i:3">' +
      cards(p.features) +
      "</div>" +
      "</div></section>" +
      // Gallery — more app screens (optional)
      (p.gallery && Array.isArray(p.gallery.images) && p.gallery.images.length
        ? '<section class="cs-block"><div class="wrap">' +
          '<p class="eyebrow reveal">' +
          esc(p.gallery.eyebrow || "Gallery") +
          "</p>" +
          '<h2 class="cs-block__title reveal" style="--i:1">' +
          esc(p.gallery.title || "A closer look") +
          "</h2>" +
          (p.gallery.body
            ? '<p class="cs-block__lead reveal" style="--i:2">' +
              esc(p.gallery.body) +
              "</p>"
            : "") +
          '<div class="cs-showcase reveal" style="--i:3">' +
          p.gallery.images
            .map(function (im) {
              return (
                '<figure class="cs-showcase__row cs-showcase__row--' +
                escAttr(im.layout || "wide") +
                '">' +
                '<div class="cs-showcase__text">' +
                (im.caption ? "<h3>" + esc(im.caption) + "</h3>" : "") +
                (im.body ? "<p>" + esc(im.body) + "</p>" : "") +
                "</div>" +
                '<div class="cs-showcase__media"><img src="' +
                escAttr(im.src) +
                '" alt="' +
                escAttr(im.alt || "") +
                '" loading="lazy" decoding="async"></div>' +
                "</figure>"
              );
            })
            .join("") +
          "</div>" +
          "</div></section>"
        : "") +
      // Photo grid — installation shots (optional)
      (p.photoGrid && Array.isArray(p.photoGrid.images) && p.photoGrid.images.length
        ? '<section class="cs-block cs-block--alt"><div class="wrap">' +
          '<p class="eyebrow reveal">' +
          esc(p.photoGrid.eyebrow || "Photos") +
          "</p>" +
          '<h2 class="cs-block__title reveal" style="--i:1">' +
          esc(p.photoGrid.title || "In the field") +
          "</h2>" +
          (p.photoGrid.body
            ? '<p class="cs-block__lead reveal" style="--i:2">' +
              esc(p.photoGrid.body) +
              "</p>"
            : "") +
          '<div class="cs-photo-grid reveal" style="--i:3">' +
          p.photoGrid.images
            .map(function (im) {
              return (
                '<figure class="cs-photo-grid__item">' +
                '<div class="cs-photo-grid__media"><img src="' +
                escAttr(im.src) +
                '" alt="' +
                escAttr(im.alt || "") +
                '" loading="lazy" decoding="async"></div>' +
                (im.caption
                  ? '<figcaption class="cs-photo-grid__cap">' +
                    esc(im.caption) +
                    "</figcaption>"
                  : "") +
                "</figure>"
              );
            })
            .join("") +
          "</div>" +
          "</div></section>"
        : "") +
      // End — summary + thank you
      '<section class="cs-block cs-block--alt cs-end"><div class="wrap">' +
      '<p class="eyebrow reveal">End</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">Summary</h2>' +
      '<p class="cs-block__lead reveal" style="--i:2">' +
      esc((p.outcomes && p.outcomes.lead) || p.summary) +
      "</p>" +
      '<p class="cs-end__thanks reveal" style="--i:3">Thank you for reading.</p>' +
      "</div></section>" +
      // Pager
      '<nav class="cs-pager wrap" aria-label="More projects">' +
      '<a class="cs-pager__link cs-pager__link--prev" href="case.html?p=' +
      encodeURIComponent(prev.slug) +
      '"><span class="cs-pager__kicker">' +
      "&larr; Previous</span><span class=\"cs-pager__name\">" +
      esc(prev.title) +
      "</span></a>" +
      '<a class="cs-pager__link cs-pager__link--next" href="case.html?p=' +
      encodeURIComponent(next.slug) +
      '"><span class="cs-pager__kicker">Next &rarr;</span>' +
      '<span class="cs-pager__name">' +
      esc(next.title) +
      "</span></a>" +
      "</nav>";

    rescan();
  }

  /* ============================================================
     Blog post page
     ============================================================ */
  function renderPost() {
    var root = document.getElementById("post-root");
    if (!root) return;
    var posts = Array.isArray(window.POSTS) ? window.POSTS : [];
    var slug = qsParam("p");
    var post = null;
    for (var k = 0; k < posts.length; k++) {
      if (posts[k].slug === slug) post = posts[k];
    }
    if (!post) {
      document.title = "Post not found | Tomas Roos";
      emptyState(
        root,
        "Post not found",
        "That article doesn't exist or may have moved.",
        "index.html#writing",
        "Back to all writing"
      );
      return;
    }

    document.title = post.title + " | Tomas Roos";
    setMeta("description", post.excerpt);

    var cover = "";
    if (post.cover) {
      var isPdf = /\.pdf($|\?)/i.test(post.cover);
      cover = isPdf
        ? '<figure class="article__cover article__cover--pdf reveal" style="--i:2">' +
          '<object data="' + escAttr(post.cover) + '#view=FitH" type="application/pdf" aria-label="' + escAttr(post.coverAlt || post.title) + '">' +
          '<a href="' + escAttr(post.cover) + '">Download PDF</a>' +
          '</object>' +
          '</figure>'
        : '<figure class="article__cover reveal" style="--i:2"><img src="' +
          escAttr(post.cover) +
          '" alt="' +
          escAttr(post.coverAlt || post.title) +
          '"></figure>';
    }

    root.innerHTML =
      '<div class="wrap"><a class="back-link" href="index.html#writing">' +
      ARROW_LEFT +
      " All writing</a></div>" +
      '<article class="article wrap">' +
      '<p class="eyebrow reveal">' +
      esc(post.kicker || "Writing") +
      "</p>" +
      '<h1 class="article__title reveal" style="--i:1">' +
      esc(post.title) +
      "</h1>" +
      '<p class="article__meta reveal" style="--i:1">' +
      '<time datetime="' +
      escAttr(post.date) +
      '">' +
      esc(formatDate(post.date)) +
      "</time>" +
      '<span class="dot" aria-hidden="true"></span>' +
      "<span>" +
      esc(post.readingTime || "") +
      "</span></p>" +
      cover +
      '<div class="prose reveal" style="--i:3">' +
      mdToHtml(post.body) +
      "</div>" +
      "</article>";

    rescan();
  }

  /* ---- Boot ------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("work-grid")) {
      renderHomeWork();
      renderHomeGallery();
      renderHomeWriting();
    }
    if (document.getElementById("case-root")) renderCase();
    if (document.getElementById("post-root")) renderPost();
    rescan();
  });

  /* Expose for reuse */
  window.SiteRender = { mdToHtml: mdToHtml, formatDate: formatDate };
})();
