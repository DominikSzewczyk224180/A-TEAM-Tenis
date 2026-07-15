/* ==========================================================================
   A-TEAM Korty Tenisowe — store.js
   --------------------------------------------------------------------------
   Warstwa danych dla ligi i rezerwacji.

   WERSJA DEMONSTRACYJNA (tylko front-end):
   - Dane trzymane są w przeglądarce (localStorage). Jeśli localStorage jest
     niedostępny, dane żyją w pamieci tylko na czas otwartej karty.
   - "Hasła" poniżej to zabezpieczenie pozorne — każdy, kto otworzy kod strony,
     je zobaczy. To NIE jest prawdziwa ochrona. Prawdziwe logowanie i baza
     danych pojawią się dopiero z panelem admina po stronie serwera.
   - Cała reszta strony (liga.js, rezerwacje.js) rozmawia tylko z tym plikiem.
     Zeby w przyszlosci podlaczyc backend, wystarczy zamienic funkcje read/write
     oraz getLeague, saveGroup, book, cancel na wywolania API. UI zostaje bez zmian.
   ========================================================================== */
window.ATEAM = (function () {
  'use strict';

  /* ============================ KONFIGURACJA ============================ */
  // Zmień te hasła przed pokazaniem strony na żywo (patrz README).
  var ADMIN_PASSWORD = 'ateam-admin';

  var GROUPS = [
    { id: 'a', name: 'Grupa A', tag: 'Zaawansowani',        pass: 'grupa-a' },
    { id: 'b', name: 'Grupa B', tag: 'Średniozaawansowani', pass: 'grupa-b' },
    { id: 'c', name: 'Grupa C', tag: 'Początkujący',        pass: 'grupa-c' }
  ];

  // Punktacja ligi: pkt = 2 za wygraną, 1 za rozegraną porażkę.
  var SCORING = { win: 2, loss: 1 };

  var COURTS = [
    { id: '1', name: 'Kort 1' },
    { id: '2', name: 'Kort 2' },
    { id: '3', name: 'Kort 3' }
  ];

  var LKEY = 'ateam.league.v1';
  var RKEY = 'ateam.reservations.v1';

  /* ===================== STORAGE (localStorage / RAM) ==================== */
  var mem = {};
  var LS = (function () {
    try { var k = '__ateam_test__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  })();
  function read(key, def) {
    try { if (LS) { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } } catch (e) {}
    return (key in mem) ? mem[key] : def;
  }
  function write(key, val) {
    try { if (LS) { localStorage.setItem(key, JSON.stringify(val)); return; } } catch (e) {}
    mem[key] = val;
  }

  /* ============================ DANE STARTOWE =========================== */
  function seedLeague() {
    return {
      a: [
        { id: 'a1', name: 'Marek Wójcik',      won: 9, lost: 1, setsW: 19, setsL: 6 },
        { id: 'a2', name: 'Tomasz Lewandowski', won: 7, lost: 3, setsW: 16, setsL: 9 },
        { id: 'a3', name: 'Paweł Zieliński',    won: 6, lost: 4, setsW: 14, setsL: 11 },
        { id: 'a4', name: 'Krzysztof Mazur',    won: 5, lost: 5, setsW: 12, setsL: 13 },
        { id: 'a5', name: 'Adrian Kowal',       won: 3, lost: 7, setsW: 9,  setsL: 15 },
        { id: 'a6', name: 'Robert Sikora',      won: 1, lost: 9, setsW: 5,  setsL: 19 }
      ],
      b: [
        { id: 'b1', name: 'Anna Nowak',         won: 8, lost: 2, setsW: 17, setsL: 7 },
        { id: 'b2', name: 'Grzegorz Wiśniewski', won: 7, lost: 3, setsW: 15, setsL: 9 },
        { id: 'b3', name: 'Michał Dąbrowski',   won: 5, lost: 4, setsW: 12, setsL: 10 },
        { id: 'b4', name: 'Katarzyna Wróbel',   won: 4, lost: 5, setsW: 11, setsL: 12 },
        { id: 'b5', name: 'Piotr Kaczmarek',    won: 3, lost: 6, setsW: 8,  setsL: 13 },
        { id: 'b6', name: 'Ewa Baran',          won: 2, lost: 7, setsW: 7,  setsL: 15 }
      ],
      c: [
        { id: 'c1', name: 'Julia Szymańska',    won: 6, lost: 1, setsW: 13, setsL: 4 },
        { id: 'c2', name: 'Bartosz Wieczorek',  won: 5, lost: 2, setsW: 11, setsL: 6 },
        { id: 'c3', name: 'Magdalena Krawczyk',  won: 3, lost: 3, setsW: 8,  setsL: 8 },
        { id: 'c4', name: 'Jakub Pawlak',       won: 2, lost: 4, setsW: 6,  setsL: 9 },
        { id: 'c5', name: 'Weronika Górska',    won: 1, lost: 5, setsW: 4,  setsL: 11 }
      ]
    };
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // Rezerwacje startowe — parę zajętych slotów na dziś i jutro, żeby siatka żyła.
  function seedReservations() {
    var data = {};
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var mkDay = function (offset, slots) {
      var d = new Date(today); d.setDate(d.getDate() + offset);
      var key = isoOf(d);
      data[key] = data[key] || {};
      slots.forEach(function (s) {
        data[key][s.court] = data[key][s.court] || {};
        data[key][s.court][s.time] = { name: s.name, seeded: true };
      });
    };
    mkDay(0, [
      { court: '1', time: '17:00', name: 'A. Kowalski' },
      { court: '1', time: '18:00', name: 'A. Kowalski' },
      { court: '2', time: '19:00', name: 'M. Nowak' },
      { court: '3', time: '10:00', name: 'Trening: junior' }
    ]);
    mkDay(1, [
      { court: '2', time: '16:00', name: 'Liga: Grupa B' },
      { court: '3', time: '18:00', name: 'P. Zieliński' },
      { court: '1', time: '20:00', name: 'K. Mazur' }
    ]);
    mkDay(2, [
      { court: '1', time: '11:00', name: 'Lekcja' },
      { court: '2', time: '11:00', name: 'Lekcja' }
    ]);
    return data;
  }

  /* ============================== LIGA API ============================== */
  function getLeague() {
    var l = read(LKEY, null);
    if (!l) { l = seedLeague(); write(LKEY, l); }
    return l;
  }
  function saveGroup(groupId, players) {
    var l = getLeague();
    l[groupId] = players;
    write(LKEY, l);
    return l;
  }
  function resetLeague() { var s = seedLeague(); write(LKEY, s); return s; }

  // Wylicza pochodne pola i sortuje: pkt malejąco, potem różnica setów, potem sety+.
  function standings(players) {
    var rows = players.map(function (p) {
      var played = p.won + p.lost;
      var pts = p.won * SCORING.win + p.lost * SCORING.loss;
      var diff = p.setsW - p.setsL;
      return {
        id: p.id, name: p.name, won: p.won, lost: p.lost,
        setsW: p.setsW, setsL: p.setsL, played: played, diff: diff, pts: pts
      };
    });
    rows.sort(function (a, b) {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.setsW - a.setsW;
    });
    return rows;
  }

  /* =========================== REZERWACJE API =========================== */
  function getReservations() {
    var r = read(RKEY, null);
    if (!r) { r = seedReservations(); write(RKEY, r); }
    return r;
  }
  function slotStatus(dateStr, courtId, time) {
    var r = getReservations();
    var d = r[dateStr]; if (!d) return null;
    var c = d[courtId]; if (!c) return null;
    return c[time] || null;
  }
  function book(dateStr, courtId, time, info) {
    var r = getReservations();
    r[dateStr] = r[dateStr] || {};
    r[dateStr][courtId] = r[dateStr][courtId] || {};
    if (r[dateStr][courtId][time]) return false; // już zajęte
    r[dateStr][courtId][time] = { name: info.name, phone: info.phone || '', at: Date.now() };
    write(RKEY, r);
    return true;
  }
  function cancel(dateStr, courtId, time) {
    var r = getReservations();
    if (r[dateStr] && r[dateStr][courtId] && r[dateStr][courtId][time]) {
      delete r[dateStr][courtId][time];
      write(RKEY, r);
      return true;
    }
    return false;
  }
  function resetReservations() { var s = seedReservations(); write(RKEY, s); return s; }

  // Godziny otwarcia → lista slotów startowych dla danej daty.
  function slotsForDate(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDay(); // 0 = niedziela, 6 = sobota
    var weekend = (day === 0 || day === 6);
    var open = weekend ? 9 : 10;
    var close = weekend ? 22 : 21; // ostatni mecz zaczyna się o (close-1):00
    var out = [];
    for (var h = open; h < close; h++) out.push(pad(h) + ':00');
    return out;
  }

  /* =============================== AUTH ================================= */
  // Zwraca 'admin', id grupy, albo null.
  function checkPassword(input) {
    input = (input || '').trim();
    if (!input) return null;
    if (input === ADMIN_PASSWORD) return 'admin';
    for (var i = 0; i < GROUPS.length; i++) {
      if (input === GROUPS[i].pass) return GROUPS[i].id;
    }
    return null;
  }

  return {
    GROUPS: GROUPS,
    COURTS: COURTS,
    SCORING: SCORING,
    storageMode: LS ? 'local' : 'memory',
    // liga
    getLeague: getLeague,
    saveGroup: saveGroup,
    resetLeague: resetLeague,
    standings: standings,
    // rezerwacje
    getReservations: getReservations,
    slotStatus: slotStatus,
    book: book,
    cancel: cancel,
    resetReservations: resetReservations,
    slotsForDate: slotsForDate,
    isoOf: isoOf,
    // auth
    checkPassword: checkPassword
  };
})();
