# Korty Tenisowe A-TEAM Rydułtowy, strona internetowa

Statyczna strona (HTML + CSS + JavaScript, bez frameworków i bez backendu),
gotowa do umieszczenia na **GitHub Pages** za darmo. Oprócz strony głównej
zawiera stronę **ligi** (tabela wyników z edycją po haśle) oraz stronę
**rezerwacji kortu online** (siatka wolnych godzin).

---

## Struktura plików

```
a-team-tennis/
├── index.html          → strona główna
├── liga.html           → tabela ligi (grupy, punktacja, edycja po haśle)
├── rezerwacje.html     → rezerwacja kortu online (wolne godziny)
├── favicon.svg         → ikona w karcie przeglądarki
├── css/
│   └── styles.css       → cały wygląd (kolory, czcionki, layout)
├── js/
│   ├── nav.js           → wspólne: menu, nagłówek, animacje (wszystkie strony)
│   ├── main.js          → strona główna: liczby, galeria
│   ├── store.js         → dane ligi i rezerwacji + hasła (patrz niżej)
│   ├── liga.js          → obsługa tabeli ligi
│   └── rezerwacje.js    → obsługa siatki rezerwacji
└── images/
    ├── hero-players.jpg  → główne zdjęcie (gracze + niebo)
    ├── court-banner.jpg  → kort z bannerem „A-TEAM"
    ├── court-evening.jpg → korty o zmierzchu (tło sekcji Liga)
    ├── court-clay.jpg    → zbliżenie na mączkę
    └── og-image.jpg      → miniatura przy udostępnianiu linku
```

---

## Jak opublikować na GitHub Pages

### Sposób 1: przez stronę GitHub (najprościej, bez instalowania niczego)

1. Załóż konto na <https://github.com> (jeśli jeszcze nie masz).
2. Kliknij **New repository** (zielony przycisk).
   - **Repository name:** np. `a-team-tennis` (albo dowolna nazwa).
   - Ustaw **Public**.
   - Kliknij **Create repository**.
3. Wejdź w utworzone repozytorium, potem **Add file → Upload files**.
4. Przeciągnij **całą zawartość** folderu `a-team-tennis`
   (czyli `index.html`, `liga.html`, `rezerwacje.html`, `favicon.svg`
   oraz foldery `css`, `js`, `images`).
   > Ważne: wrzucasz to, co jest **w środku** folderu, a nie sam folder.
   > Plik `index.html` musi być w głównym katalogu repozytorium.
5. Na dole strony kliknij **Commit changes**.
6. Wejdź w **Settings → Pages** (menu po lewej).
7. W sekcji **Build and deployment → Source** wybierz **Deploy from a branch**.
8. W **Branch** wybierz `main` oraz folder `/ (root)`, potem **Save**.
9. Odczekaj 1 do 2 minut i odśwież stronę. Pojawi się adres w stylu:
   `https://twoja-nazwa.github.io/a-team-tennis/`

### Sposób 2: przez git (jeśli wolisz konsolę)

```bash
# w folderze a-team-tennis:
git init
git add .
git commit -m "Strona Korty Tenisowe A-TEAM"
git branch -M main
git remote add origin https://github.com/TWOJA-NAZWA/a-team-tennis.git
git push -u origin main
```

Następnie tak samo: **Settings → Pages → Deploy from a branch → main → /(root)**.

---

## Liga: jak to działa i jak edytować wyniki

Strona `liga.html` pokazuje tabelę w trzech grupach (A, B, C). Punktacja:
2 punkty za wygrany mecz, 1 punkt za rozegraną porażkę. Kolejność ustala się
po punktach, a przy remisie po bilansie setów.

- **Podgląd bez logowania.** Każdy widzi tabelę.
- **Edycja po haśle.** Przycisk „Zaloguj, aby edytować" prosi o hasło.
  Hasło grupy odblokowuje edycję tylko tej jednej grupy. Hasło prowadzącego
  odblokowuje wszystkie grupy i przycisk „Przywróć dane przykładowe".
- W trybie edycji wpisuje się liczbę wygranych, porażek i setów.
  Mecze i punkty przeliczają się same. „Zapisz zmiany" zapisuje tabelę.

## Rezerwacje: jak to działa

Strona `rezerwacje.html` pokazuje siatkę: dni u góry, godziny po lewej,
trzy korty w kolumnach. Zielone pole jest wolne, kliknięcie otwiera okienko
rezerwacji (imię + telefon). Zajęte pola są wyszarzone. Po zalogowaniu jako
prowadzący pojawia się możliwość odwołania rezerwacji i wyczyszczenia grafiku.

---

## Hasła (WAŻNE)

Hasła ustawia się na górze pliku `js/store.js`:

```
var ADMIN_PASSWORD = 'ateam-admin';          // prowadzący (pełny dostęp)

var GROUPS = [
  { id: 'a', name: 'Grupa A', ..., pass: 'grupa-a' },
  { id: 'b', name: 'Grupa B', ..., pass: 'grupa-b' },
  { id: 'c', name: 'Grupa C', ..., pass: 'grupa-c' }
];
```

Hasła startowe (demo, **koniecznie zmień przed pokazaniem strony na żywo**):

| Rola | Hasło |
|---|---|
| Prowadzący (wszystkie grupy) | `ateam-admin` |
| Grupa A | `grupa-a` |
| Grupa B | `grupa-b` |
| Grupa C | `grupa-c` |

> **To nie jest prawdziwe zabezpieczenie.** W wersji tylko front-end każdy,
> kto otworzy kod strony, może odczytać hasła. Chroni to grafik „grzecznościowo"
> przed przypadkową edycją, ale nie przed kimś, kto naprawdę chce coś zmienić.
> Prawdziwe logowanie wymaga backendu (patrz sekcja niżej).

## Gdzie zapisują się dane

Wyniki ligi i rezerwacje trzymane są w przeglądarce (localStorage). Oznacza to:

- Zmiany widzi tylko ta osoba, na tym urządzeniu i w tej przeglądarce.
- Wpis z jednego telefonu **nie pojawi się** na innym urządzeniu.
- Wyczyszczenie danych przeglądarki kasuje zmiany.

To celowe rozwiązanie na etap „tylko front-end": strona działa od razu na
GitHub Pages, bez serwera, i pokazuje pełny wygląd oraz zachowanie docelowej
funkcji.

## Krok w przyszłość: prawdziwy backend i panel admina

Cała logika danych jest w jednym miejscu (`js/store.js`), a reszta stron
(`liga.js`, `rezerwacje.js`) korzysta wyłącznie z jego funkcji. Dzięki temu
podłączenie serwera nie wymaga przerabiania wyglądu, wystarczy zamienić środek
tych funkcji na zapytania do API:

- `getLeague`, `saveGroup`, `resetLeague` (dane ligi),
- `getReservations`, `book`, `cancel`, `resetReservations` (rezerwacje),
- `checkPassword` (logowanie), oraz wewnętrzne `read` i `write` (odczyt/zapis).

Wtedy dane będą wspólne dla wszystkich, rezerwacje trafią do klubu, a panel
prowadzącego stanie się prawdziwym logowaniem z hasłami po stronie serwera.

---

## Jak edytować treść strony głównej

Wszystko jest po polsku w `index.html`. Najczęstsze zmiany:

| Co chcesz zmienić | Gdzie szukać |
|---|---|
| Numer telefonu | wyszukaj `507 146 610` oraz `+48507146610` |
| Adres | wyszukaj `Bema 126C` |
| Godziny otwarcia | sekcja „Godziny otwarcia" w `index.html` |
| Cena za kort | wyszukaj `40 zł` |
| Godziny w rezerwacjach | funkcja `slotsForDate` w `js/store.js` |
| Nazwy kortów | tablica `COURTS` w `js/store.js` |
| Teksty sekcji | edytuj między znacznikami `<p>…</p>` i `<h2>…</h2>` |

### Podmiana zdjęć

Wrzuć własne zdjęcia do folderu `images/` i albo nazwij je tak samo jak
obecne, albo zmień nazwy plików w `index.html` (wyszukaj np. `hero-players.jpg`).

---

## O projekcie (dla ciekawych)

- **Kolory:** butelkowa zieleń (tożsamość marki), ceglana czerwień mączki
  (akcent, przyciski) i biel linii kortu (motyw przewodni).
- **Czcionki (Google Fonts):** Archivo (nagłówki), Inter (tekst),
  Space Mono (liczby, etykiety, „tablica wyników").
- **Motyw przewodni:** białe linie kortu tenisowego w logo, w tle hero
  i na banerach podstron.
- Strona jest responsywna, ma animacje pojawiania się sekcji i respektuje
  systemowe ustawienie „ogranicz ruch".
