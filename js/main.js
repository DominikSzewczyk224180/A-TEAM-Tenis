/* ==========================================================================
   A-TEAM Korty Tenisowe — main.js
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '+48507146610';

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ====================================================================
     Sticky header — solidify on scroll
     ==================================================================== */
  var header = $('.site-header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ====================================================================
     Mobile nav
     ==================================================================== */
  var toggle = $('#navToggle');
  var menu = $('#menu');
  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otwórz menu');
  }
  function openMenu() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Zamknij menu');
  }
  toggle.addEventListener('click', function () {
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });
  // close after clicking a link
  $$('#menu a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  // close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });

  /* ====================================================================
     Reveal on scroll
     ==================================================================== */
  var revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ====================================================================
     Count-up numbers (scoreboard)
     ==================================================================== */
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

  /* ====================================================================
     Active nav link based on scroll position
     ==================================================================== */
  var sections = $$('main section[id]');
  var linkMap = {};
  $$('#menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && href.charAt(0) === '#') linkMap[href.slice(1)] = a;
  });
  if ('IntersectionObserver' in window) {
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

  /* ====================================================================
     Gallery lightbox
     ==================================================================== */
  var items = $$('.gallery__item');
  var lightbox = $('#lightbox');
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
  items.forEach(function (it, i) {
    it.addEventListener('click', function () { openLightbox(i); });
  });
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

  /* ====================================================================
     Reservation form → compose message (no backend)
     ==================================================================== */
  var form = $('#rezForm');
  var done = $('#rezDone');
  var summaryEl = $('#rezSummary');
  var smsBtn = $('#rezSms');
  var copyBtn = $('#rezCopy');
  var againBtn = $('#rezAgain');
  var dateInput = $('#rezDate');

  // set date min + default to today
  (function initDate() {
    var t = new Date();
    var iso = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    dateInput.min = iso;
    if (!dateInput.value) dateInput.value = iso;
  })();

  function formatDatePL(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    return p[2] + '.' + p[1] + '.' + p[0];
  }

  function validate() {
    var ok = true;
    ['rezName', 'rezPhone', 'rezDate', 'rezTime'].forEach(function (id) {
      var el = $('#' + id);
      var valid = el.value.trim() !== '';
      el.classList.toggle('invalid', !valid);
      if (!valid && ok) { el.focus(); }
      if (!valid) ok = false;
    });
    return ok;
  }

  function buildSummary() {
    var name = $('#rezName').value.trim();
    var phone = $('#rezPhone').value.trim();
    var date = formatDatePL($('#rezDate').value);
    var time = $('#rezTime').value;
    var peopleSel = $('#rezPeople');
    var people = peopleSel.options[peopleSel.selectedIndex].text;
    var dur = $('#rezDur').value;
    var msg = $('#rezMsg').value.trim();
    var isLesson = peopleSel.value === 'lekcja';

    var lines = [];
    lines.push('Rezerwacja — Korty A-TEAM Rydułtowy');
    lines.push('Imię: ' + name);
    lines.push('Telefon: ' + phone);
    lines.push('Termin: ' + date + ', godz. ' + time);
    if (isLesson) lines.push('Rodzaj: Lekcja z instruktorem (' + dur + ')');
    else lines.push('Gra: ' + people + ', ' + dur);
    if (msg) lines.push('Uwagi: ' + msg);
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var summary = buildSummary();
    summaryEl.textContent = summary;

    // sms link (works across most mobile OSes)
    smsBtn.setAttribute('href', 'sms:' + PHONE + '?&body=' + encodeURIComponent(summary));

    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  // clear invalid state on input
  $$('#rezForm input, #rezForm select').forEach(function (el) {
    el.addEventListener('input', function () { el.classList.remove('invalid'); });
  });

  copyBtn.addEventListener('click', function () {
    var text = summaryEl.textContent;
    var restore = function () { setTimeout(function () { copyBtn.textContent = 'Kopiuj treść'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Skopiowano ✓'; restore();
      }).catch(function () { fallbackCopy(text); copyBtn.textContent = 'Skopiowano ✓'; restore(); });
    } else {
      fallbackCopy(text); copyBtn.textContent = 'Skopiowano ✓'; restore();
    }
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  againBtn.addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    $('#rezName').focus();
  });

  /* ---------- footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

})();
