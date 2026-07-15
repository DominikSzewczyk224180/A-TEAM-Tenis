/* ==========================================================================
   A-TEAM Korty Tenisowe — liga.js
   Tabela ligi: zakładki grup, podgląd/edycja, logowanie hasłem.
   Dane i "hasła" pochodzą ze store.js (wersja demonstracyjna).
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

  var currentGroup = S.GROUPS[0].id;
  var authScope = null;      // null | 'admin' | groupId
  var editing = false;

  var tabsEl = $('#groupTabs');
  var areaEl = $('#tableArea');
  var chipEl = $('#authChip');
  var hintEl = $('#authHint');
  var loginBtn = $('#loginBtn');
  var logoutBtn = $('#logoutBtn');
  var adminTools = $('#adminTools');

  /* ---------- tabs ---------- */
  function buildTabs() {
    tabsEl.innerHTML = '';
    S.GROUPS.forEach(function (g) {
      var b = el('button', 'tab', null);
      b.setAttribute('role', 'tab');
      b.dataset.group = g.id;
      b.innerHTML = '<span class="tab__name">' + g.name + '</span><span class="tab__tag">' + g.tag + '</span>';
      b.addEventListener('click', function () {
        if (currentGroup === g.id) return;
        currentGroup = g.id;
        editing = false;
        syncTabs();
        render();
      });
      tabsEl.appendChild(b);
    });
    syncTabs();
  }
  function syncTabs() {
    Array.prototype.forEach.call(tabsEl.children, function (b) {
      var on = b.dataset.group === currentGroup;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function canEdit(groupId) { return authScope === 'admin' || authScope === groupId; }

  /* ---------- render table ---------- */
  function render() {
    var league = S.getLeague();
    var players = league[currentGroup] || [];
    var rows = S.standings(players);
    var group = S.GROUPS.filter(function (g) { return g.id === currentGroup; })[0];
    var editable = canEdit(currentGroup);

    areaEl.innerHTML = '';

    var wrap = el('div', 'table-wrap');

    // caption
    var cap = el('div', 'table-cap');
    var capL = el('div', 'table-cap__l');
    capL.appendChild(el('span', 'table-cap__name', group.name));
    capL.appendChild(el('span', 'table-cap__tag', group.tag + ' · ' + players.length + ' zawodników'));
    cap.appendChild(capL);

    if (editable) {
      var capR = el('div', 'table-cap__r');
      if (!editing) {
        var editBtn = el('button', 'btn btn--sm btn--ghost-light', 'Edytuj tabelę');
        editBtn.addEventListener('click', function () { editing = true; render(); });
        capR.appendChild(editBtn);
      } else {
        var saveBtn = el('button', 'btn btn--sm btn--chalk', 'Zapisz zmiany');
        saveBtn.addEventListener('click', saveEdits);
        var cancelBtn = el('button', 'btn btn--sm btn--link-light', 'Anuluj');
        cancelBtn.addEventListener('click', function () { editing = false; render(); });
        capR.appendChild(saveBtn);
        capR.appendChild(cancelBtn);
      }
      cap.appendChild(capR);
    }
    wrap.appendChild(cap);

    // table
    var scroll = el('div', 'table-scroll');
    var table = el('table', 'standings');
    var thead = el('thead');
    var htr = el('tr');
    var cols = ['#', 'Zawodnik', 'M', 'W', 'P', 'Sety', 'Pkt'];
    cols.forEach(function (c) {
      var th = el('th', null, c);
      if (c === 'Zawodnik') th.className = 'col-name';
      if (c === '#') th.className = 'col-rank';
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = el('tbody');

    if (!editing) {
      rows.forEach(function (r, i) {
        var tr = el('tr');
        if (i === 0) tr.className = 'is-leader';
        tr.appendChild(cell('col-rank', '#', String(i + 1)));
        tr.appendChild(cell('col-name', 'Zawodnik', r.name));
        tr.appendChild(cell(null, 'M', String(r.played)));
        tr.appendChild(cell(null, 'W', String(r.won)));
        tr.appendChild(cell(null, 'P', String(r.lost)));
        tr.appendChild(cell('col-sets', 'Sety', r.setsW + ' : ' + r.setsL));
        tr.appendChild(cell('col-pts', 'Pkt', String(r.pts)));
        tbody.appendChild(tr);
      });
    } else {
      // edit mode keeps current sorted order; recompute M/Pkt live
      rows.forEach(function (r, i) {
        var tr = el('tr');
        tr.dataset.id = r.id;
        tr.appendChild(cell('col-rank', '#', String(i + 1)));
        tr.appendChild(cell('col-name', 'Zawodnik', r.name));
        var mTd = cell('col-m', 'M', String(r.played));
        tr.appendChild(mTd);
        tr.appendChild(numCell('W', 'won', r.won));
        tr.appendChild(numCell('P', 'lost', r.lost));
        tr.appendChild(setsCell(r.setsW, r.setsL));
        var pTd = cell('col-pts', 'Pkt', String(r.pts));
        tr.appendChild(pTd);
        tbody.appendChild(tr);
        // live recompute
        tr.addEventListener('input', function () { recompute(tr, mTd, pTd); });
      });
    }

    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    if (!editable && authScope) {
      wrap.appendChild(hint('Zalogowano do innej grupy. Aby edytować tę tabelę, zaloguj się jej hasłem.'));
    } else if (!editable) {
      wrap.appendChild(hint('Podgląd. Zaloguj się hasłem grupy, aby edytować jej wyniki.'));
    } else if (editing) {
      wrap.appendChild(hint('Wpisz liczbę wygranych, porażek i setów. Mecze i punkty przeliczą się automatycznie.'));
    }

    areaEl.appendChild(wrap);
  }

  function cell(cls, label, val) {
    var td = el('td', cls, val);
    td.setAttribute('data-label', label);
    return td;
  }
  function numCell(label, key, val) {
    var td = el('td', 'col-edit');
    td.setAttribute('data-label', label);
    var inp = document.createElement('input');
    inp.type = 'number'; inp.min = '0'; inp.step = '1';
    inp.value = String(val);
    inp.className = 'cell-input';
    inp.dataset.key = key;
    inp.setAttribute('aria-label', label);
    td.appendChild(inp);
    return td;
  }
  function setsCell(w, l) {
    var td = el('td', 'col-edit col-sets');
    td.setAttribute('data-label', 'Sety');
    var box = el('span', 'sets-input');
    var iw = document.createElement('input');
    iw.type = 'number'; iw.min = '0'; iw.step = '1'; iw.value = String(w);
    iw.className = 'cell-input cell-input--sets'; iw.dataset.key = 'setsW'; iw.setAttribute('aria-label', 'Sety wygrane');
    var sep = el('span', 'sets-sep', ':');
    var il = document.createElement('input');
    il.type = 'number'; il.min = '0'; il.step = '1'; il.value = String(l);
    il.className = 'cell-input cell-input--sets'; il.dataset.key = 'setsL'; il.setAttribute('aria-label', 'Sety przegrane');
    box.appendChild(iw); box.appendChild(sep); box.appendChild(il);
    td.appendChild(box);
    return td;
  }
  function hint(text) {
    var p = el('p', 'table-hint', text);
    return p;
  }

  function readInt(input) {
    var v = parseInt(input.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    return v;
  }
  function recompute(tr, mTd, pTd) {
    var w = readInt(tr.querySelector('input[data-key="won"]'));
    var l = readInt(tr.querySelector('input[data-key="lost"]'));
    mTd.textContent = String(w + l);
    pTd.textContent = String(w * S.SCORING.win + l * S.SCORING.loss);
  }

  function saveEdits() {
    var league = S.getLeague();
    var players = (league[currentGroup] || []).slice();
    var byId = {};
    players.forEach(function (p) { byId[p.id] = p; });
    Array.prototype.forEach.call(areaEl.querySelectorAll('tbody tr'), function (tr) {
      var id = tr.dataset.id;
      if (!id || !byId[id]) return;
      byId[id].won = readInt(tr.querySelector('input[data-key="won"]'));
      byId[id].lost = readInt(tr.querySelector('input[data-key="lost"]'));
      byId[id].setsW = readInt(tr.querySelector('input[data-key="setsW"]'));
      byId[id].setsL = readInt(tr.querySelector('input[data-key="setsL"]'));
    });
    S.saveGroup(currentGroup, players);
    editing = false;
    render();
    toast('Zapisano wyniki grupy ' + currentGroup.toUpperCase() + '.');
  }

  /* ---------- auth ---------- */
  function applyAuth() {
    if (authScope === 'admin') {
      chipEl.textContent = 'Prowadzący · wszystkie grupy';
      chipEl.dataset.state = 'admin';
      hintEl.textContent = 'Masz pełny dostęp do edycji wszystkich tabel.';
      adminTools.hidden = false;
    } else if (authScope) {
      var g = S.GROUPS.filter(function (x) { return x.id === authScope; })[0];
      chipEl.textContent = 'Edycja: ' + (g ? g.name : authScope);
      chipEl.dataset.state = 'group';
      hintEl.textContent = 'Możesz edytować wyniki swojej grupy.';
      adminTools.hidden = true;
    } else {
      chipEl.textContent = 'Podgląd';
      chipEl.dataset.state = 'guest';
      hintEl.textContent = 'Wyniki możesz przeglądać bez logowania. Edycja po podaniu hasła grupy.';
      adminTools.hidden = true;
    }
    loginBtn.hidden = !!authScope;
    logoutBtn.hidden = !authScope;
  }

  /* ---------- login modal ---------- */
  var modal = $('#loginModal');
  var loginForm = $('#loginForm');
  var loginPass = $('#loginPass');
  var loginError = $('#loginError');
  var loginClose = $('#loginClose');
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    loginError.hidden = true;
    loginPass.value = '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { loginPass.focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  loginBtn.addEventListener('click', openModal);
  loginClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (!modal.hidden && e.key === 'Escape') closeModal();
  });
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var scope = S.checkPassword(loginPass.value);
    if (!scope) {
      loginError.hidden = false;
      loginPass.classList.add('invalid');
      loginPass.focus();
      return;
    }
    authScope = scope;
    closeModal();
    applyAuth();
    // if a group logged in, jump to its tab
    if (scope !== 'admin') { currentGroup = scope; editing = false; syncTabs(); }
    render();
    toast(scope === 'admin' ? 'Zalogowano jako prowadzący.' : 'Zalogowano do grupy ' + scope.toUpperCase() + '.');
  });
  loginPass.addEventListener('input', function () { loginPass.classList.remove('invalid'); loginError.hidden = true; });

  logoutBtn.addEventListener('click', function () {
    authScope = null;
    editing = false;
    applyAuth();
    render();
    toast('Wylogowano.');
  });

  $('#resetLeague').addEventListener('click', function () {
    S.resetLeague();
    editing = false;
    render();
    toast('Przywrócono dane przykładowe.');
  });

  /* ---------- toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = el('div', 'toast');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------- init ---------- */
  buildTabs();
  applyAuth();
  render();
})();
