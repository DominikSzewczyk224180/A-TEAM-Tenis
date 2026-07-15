/* ==========================================================================
   A-TEAM Korty Tenisowe — nav.js
   Shared across all pages: sticky header, mobile menu, scroll reveals, year.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* ---- sticky header: solidify on scroll ---- */
  var header = $('.site-header');
  if (header && !header.classList.contains('is-solid')) {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- mobile menu ---- */
  var toggle = $('#navToggle');
  var menu = $('#menu');
  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otwórz menu');
    };
    var openMenu = function () {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Zamknij menu');
    };
    toggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
    });
  }

  /* ---- reveal on scroll ---- */
  var revealEls = $$('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- footer year ---- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
