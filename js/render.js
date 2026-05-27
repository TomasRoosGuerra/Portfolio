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
        '<p class="muted" style="padding:var(--sp-3) 0">No posts yet — check back soon.</p>';
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
      document.title = "Project not found — Tomas Roos";
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

    document.title = p.title + " — Tomas Roos";
    setMeta("description", p.summary);

    function cards(arr) {
      return arr
        .map(function (c) {
          return (
            '<div class="cs-card"><h3>' +
            esc(c.h) +
            "</h3><p>" +
            esc(c.p) +
            "</p></div>"
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

    var stats = p.outcomes.stats
      .map(function (s) {
        return (
          '<div class="cs-stat reveal"><div class="cs-stat__value">' +
          esc(s.value) +
          '</div><div class="cs-stat__label">' +
          esc(s.label) +
          "</div></div>"
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

    var imageCount = (Array.isArray(p.images) && p.images.length) || 1;
    var coverHint = imageCount > 1
      ? '<span class="cs-cover__hint" aria-hidden="true">Click to view ' + imageCount + ' slides</span>'
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
      esc(p.title) +
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
      '<div class="wrap"><figure class="cs-cover cs-cover--clickable reveal" data-cs-cover tabindex="0" role="button" aria-label="Open image viewer"><img src="' +
      escAttr(p.cover) +
      '" alt="' +
      escAttr(p.coverAlt || p.title) +
      '">' + coverHint + '</figure></div>' +
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
      // Experience
      '<section class="cs-block cs-block--alt"><div class="wrap">' +
      '<p class="eyebrow reveal">Experience</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">How it works</h2>' +
      '<div class="cs-timeline">' +
      timeline +
      "</div>" +
      mockup +
      "</div></section>" +
      // Features
      '<section class="cs-block"><div class="wrap">' +
      '<p class="eyebrow reveal">Features</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">Key features</h2>' +
      '<div class="cs-cards reveal" style="--i:2">' +
      cards(p.features) +
      "</div>" +
      "</div></section>" +
      // Outcomes
      '<section class="cs-block cs-block--alt"><div class="wrap">' +
      '<p class="eyebrow reveal">Results</p>' +
      '<h2 class="cs-block__title reveal" style="--i:1">Outcomes</h2>' +
      '<p class="cs-block__lead reveal" style="--i:2">' +
      esc(p.outcomes.lead) +
      "</p>" +
      '<div class="cs-stats reveal" style="--i:3">' +
      stats +
      "</div>" +
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

    // Wire cover to lightbox
    var cover = root.querySelector("[data-cs-cover]");
    if (cover) {
      var imgs = Array.isArray(p.images) && p.images.length
        ? p.images
        : [{ src: p.cover, alt: p.coverAlt || p.title }];
      function openIt() { openLightbox(imgs, 0); }
      cover.addEventListener("click", openIt);
      cover.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIt(); }
      });
    }

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
      document.title = "Post not found — Tomas Roos";
      emptyState(
        root,
        "Post not found",
        "That article doesn't exist or may have moved.",
        "index.html#writing",
        "Back to all writing"
      );
      return;
    }

    document.title = post.title + " — Tomas Roos";
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
