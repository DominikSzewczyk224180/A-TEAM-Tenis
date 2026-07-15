/* ==========================================================================
   A-TEAM Korty Tenisowe — main.js (home page)
   Shared header/menu/reveal/year live in nav.js.
   Here: count-up scoreboard, active nav link, gallery lightbox.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---- count-up numbers (scoreboard) ---- */
  var counters = $$('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    }
  }

  /* ---- active nav link based on scroll position ---- */
  var sections = $$('main section[id]');
  var linkMap = {};
  $$('#menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') linkMap[href.slice(1)] = a;
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---- gallery lightbox ---- */
  var items = $$('.gallery__item');
  var lightbox = $('#lightbox');
  if (items.length && lightbox) {
    var lbImg = $('#lbImg');
    var lbClose = $('#lbClose');
    var lbPrev = $('#lbPrev');
    var lbNext = $('#lbNext');
    var current = 0;
    var lastFocused = null;

    var slides = items.map(function (it) {
      return { src: it.getAttribute('data-full'), alt: (it.querySelector('img') || {}).alt || '' };
    });
    function showSlide(i) {
      current = (i + slides.length) % slides.length;
      lbImg.src = slides[current].src;
      lbImg.alt = slides[current].alt;
    }
    function openLightbox(i) {
      lastFocused = document.activeElement;
      showSlide(i);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }
    items.forEach(function (it, i) { it.addEventListener('click', function () { openLightbox(i); }); });
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showSlide(current - 1); });
    lbNext.addEventListener('click', function () { showSlide(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showSlide(current - 1);
      else if (e.key === 'ArrowRight') showSlide(current + 1);
    });
  }
})();
