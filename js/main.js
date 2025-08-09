// Minimal JS: nav toggle, intersection reveals, smooth hash scroll, lightbox, year
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // Sticky header shadow on scroll
  const header = $('.site-header');
  const elevate = () => {
    if (window.scrollY > 12) header.setAttribute('data-elevated','true');
    else header.removeAttribute('data-elevated');
  };
  window.addEventListener('scroll', elevate, { passive: true });
  elevate();

  // Mobile nav
  const toggle = $('.nav__toggle');
  const list = $('#nav-menu');
  if (toggle && list){
    toggle.addEventListener('click', () => {
      const open = list.getAttribute('data-open') === 'true';
      list.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
  }

  // Smooth hash scrolling
  $$('#nav-menu a, .btn[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      const el = $(href);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      list?.setAttribute('data-open', 'false');
      toggle?.setAttribute('aria-expanded', 'false');
      history.pushState(null, '', href);
    });
  });

  // Reveal on view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('reveal-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal-up, .reveal-fade').forEach(el => io.observe(el));

  // Lightbox
  const dialog = $('.lightbox');
  const lightboxImg = $('.lightbox__img');
  const closeBtn = $('.lightbox__close');
  const openLightbox = (src) => {
    lightboxImg.src = src;
    dialog.showModal();
  };
  const closeLightbox = () => dialog.close();
  closeBtn.addEventListener('click', closeLightbox);
  dialog.addEventListener('click', (e) => {
    const rect = lightboxImg.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom){
      closeLightbox();
    }
  });
  $$('.tile').forEach(tile => {
    tile.addEventListener('click', () => openLightbox(tile.dataset.lightbox));
    tile.addEventListener('keyup', (e) => { if (e.key === 'Enter') openLightbox(tile.dataset.lightbox) });
  });

  // Dynamic year
  $('#year').textContent = new Date().getFullYear();
})();
