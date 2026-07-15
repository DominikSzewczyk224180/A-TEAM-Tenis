/* ==========================================================================
   A-TEAM Korty Tenisowe — rezerwacje.js
   Rezerwacja online (demo): wybór dnia, siatka dostępności, rezerwacja slotu.
   Dane w store.js; panel prowadzącego pozwala odwoływać i czyścić grafik.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.ATEAM) return;
  var S = window.ATEAM;

  function $(s, c) { return (c || document).querySelector(s); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  var DOW_SHORT = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  var DOW_LONG = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayIso = S.isoOf(today);
  var selectedDate = todayIso;
  var adminMode = false;
  var pending = null; // {date, court, time}

  var dayPick = $('#dayPick');
  var gridArea = $('#gridArea');

  function labelLong(iso) {
    var d = new Date(iso + 'T00:00:00');
    return DOW_LONG[d.getDay()] + ', ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1);
  }

  /* ---------- day picker (next 7 days) ---------- */
  function buildDays() {
    dayPick.innerHTML = '';
    for (var i = 0; i < 7; i++) {
      var d = new Date(today); d.setDate(d.getDate() + i);
      var iso = S.isoOf(d);
      var b = el('button', 'day');
      b.dataset.date = iso;
      var top = (i === 0) ? 'Dziś' : (i === 1 ? 'Jutro' : DOW_SHORT[d.getDay()]);
      b.innerHTML = '<span class="day__dow">' + top + '</span>' +
        '<span class="day__date">' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '</span>';
      (function (iso) {
        b.addEventListener('click', function () {
          if (selectedDate === iso) return;
          selectedDate = iso;
          syncDays();
          renderGrid();
        });
      })(iso);
      dayPick.appendChild(b);
    }
    syncDays();
  }
  function syncDays() {
    Array.prototype.forEach.call(dayPick.children, function (b) {
      b.classList.toggle('is-active', b.dataset.date === selectedDate);
    });
  }

  /* ---------- grid ---------- */
  function renderGrid() {
    gridArea.innerHTML = '';
    var slots = S.slotsForDate(selectedDate);
    var courts = S.COURTS;
    var now = new Date();
    var isToday = selectedDate === todayIso;

    var head = el('div', 'grid-head');
    head.appendChild(el('span', 'grid-head__title', labelLong(selectedDate)));
    var free = 0, busy = 0;
    slots.forEach(function (t) {
      courts.forEach(function (c) {
        if (S.slotStatus(selectedDate, c.id, t)) busy++; else free++;
      });
    });
    head.appendChild(el('span', 'grid-head__count', free + ' wolnych terminów'));
    gridArea.appendChild(head);

    var grid = el('div', 'slotgrid');

    // header row
    grid.appendChild(el('div', 'slotgrid__corner', 'Godz.'));
    courts.forEach(function (c) {
      grid.appendChild(el('div', 'slotgrid__court', c.name));
    });

    // rows
    slots.forEach(function (t) {
      grid.appendChild(el('div', 'slotgrid__time', t));
      var hour = parseInt(t.slice(0, 2), 10);
      var past = isToday && hour < now.getHours();
      courts.forEach(function (c) {
        var info = S.slotStatus(selectedDate, c.id, t);
        if (info) {
          var busyCell = el('div', 'slot slot--busy');
          busyCell.appendChild(el('span', 'slot__state', 'Zajęty'));
          if (adminMode) {
            busyCell.classList.add('slot--admin');
            busyCell.appendChild(el('span', 'slot__who', info.name || 'rezerwacja'));
            var x = el('button', 'slot__cancel', null);
            x.setAttribute('aria-label', 'Odwołaj rezerwację');
            x.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
            (function (court, time) {
              x.addEventListener('click', function () {
                S.cancel(selectedDate, court, time);
                renderGrid();
                toast('Odwołano rezerwację.');
              });
            })(c.id, t);
            busyCell.appendChild(x);
          }
          grid.appendChild(busyCell);
        } else if (past) {
          var pastCell = el('div', 'slot slot--past');
          pastCell.appendChild(el('span', 'slot__state', 'minęło'));
          grid.appendChild(pastCell);
        } else {
          var freeCell = el('button', 'slot slot--free');
          freeCell.appendChild(el('span', 'slot__state', 'Wolny'));
          freeCell.setAttribute('aria-label', 'Zarezerwuj ' + c.name + ' o ' + t);
          (function (court, time) {
            freeCell.addEventListener('click', function () { openBooking(court, time); });
          })(c.id, t);
          grid.appendChild(freeCell);
        }
      });
    });

    gridArea.appendChild(grid);
  }

  /* ---------- booking modal ---------- */
  var bookModal = $('#bookModal');
  var bookForm = $('#bookForm');
  var bookName = $('#bookName');
  var bookPhone = $('#bookPhone');
  var bookError = $('#bookError');
  var bookSummary = $('#bookSummary');
  var bookClose = $('#bookClose');
  var lastFocusB = null;

  function courtName(id) {
    var c = S.COURTS.filter(function (x) { return x.id === id; })[0];
    return c ? c.name : ('Kort ' + id);
  }
  function openBooking(court, time) {
    pending = { date: selectedDate, court: court, time: time };
    bookSummary.innerHTML = '';
    bookSummary.appendChild(chip(courtName(court)));
    bookSummary.appendChild(chip(labelLong(selectedDate)));
    bookSummary.appendChild(chip('godz. ' + time));
    bookError.hidden = true;
    bookName.value = ''; bookPhone.value = '';
    bookName.classList.remove('invalid'); bookPhone.classList.remove('invalid');
    lastFocusB = document.activeElement;
    bookModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { bookName.focus(); }, 30);
  }
  function closeBooking() {
    bookModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusB) lastFocusB.focus();
  }
  function chip(text) { return el('span', 'summary-chip', text); }

  bookClose.addEventListener('click', closeBooking);
  bookModal.addEventListener('click', function (e) { if (e.target === bookModal) closeBooking(); });
  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = bookName.value.trim();
    var phone = bookPhone.value.trim();
    var ok = true;
    if (!name) { bookName.classList.add('invalid'); ok = false; }
    if (!phone) { bookPhone.classList.add('invalid'); ok = false; }
    if (!ok) { bookError.hidden = false; return; }
    var done = S.book(pending.date, pending.court, pending.time, { name: name, phone: phone });
    closeBooking();
    renderGrid();
    toast(done ? 'Zarezerwowano: ' + courtName(pending.court) + ', godz. ' + pending.time + '.'
               : 'Ten termin został właśnie zajęty. Wybierz inny.');
  });
  bookName.addEventListener('input', function () { bookName.classList.remove('invalid'); bookError.hidden = true; });
  bookPhone.addEventListener('input', function () { bookPhone.classList.remove('invalid'); bookError.hidden = true; });

  /* ---------- admin modal ---------- */
  var adminModal = $('#adminModal');
  var adminForm = $('#adminForm');
  var adminPass = $('#adminPass');
  var adminError = $('#adminError');
  var adminClose = $('#adminClose');
  var adminBtn = $('#adminBtn');
  var adminExit = $('#adminExit');
  var adminChip = $('#adminChip');
  var resetRes = $('#resetRes');
  var lastFocusA = null;

  function openAdmin() {
    adminError.hidden = true; adminPass.value = ''; adminPass.classList.remove('invalid');
    lastFocusA = document.activeElement;
    adminModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { adminPass.focus(); }, 30);
  }
  function closeAdmin() {
    adminModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusA) lastFocusA.focus();
  }
  adminBtn.addEventListener('click', openAdmin);
  adminClose.addEventListener('click', closeAdmin);
  adminModal.addEventListener('click', function (e) { if (e.target === adminModal) closeAdmin(); });
  adminForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (S.checkPassword(adminPass.value) !== 'admin') {
      adminError.hidden = false; adminPass.classList.add('invalid'); adminPass.focus();
      return;
    }
    adminMode = true;
    closeAdmin();
    setAdminUI();
    renderGrid();
    toast('Panel prowadzącego włączony.');
  });
  adminPass.addEventListener('input', function () { adminPass.classList.remove('invalid'); adminError.hidden = true; });

  adminExit.addEventListener('click', function () {
    adminMode = false;
    setAdminUI();
    renderGrid();
    toast('Panel wyłączony.');
  });
  resetRes.addEventListener('click', function () {
    S.resetReservations();
    renderGrid();
    toast('Przywrócono grafik przykładowy.');
  });
  function setAdminUI() {
    adminChip.hidden = !adminMode;
    adminBtn.hidden = adminMode;
    adminExit.hidden = !adminMode;
    resetRes.hidden = !adminMode;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!bookModal.hidden) closeBooking();
    else if (!adminModal.hidden) closeAdmin();
  });

  /* ---------- toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = el('div', 'toast'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- init ---------- */
  buildDays();
  setAdminUI();
  renderGrid();
})();
