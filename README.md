# Korty Tenisowe A-TEAM Rydułtowy — strona internetowa

Statyczna strona typu one-page (HTML + CSS + JavaScript, bez frameworków i bez
backendu). Gotowa do umieszczenia na **GitHub Pages** za darmo.

---

## 📁 Struktura plików

```
a-team-tennis/
├── index.html          ← cała treść strony
├── favicon.svg         ← ikona w karcie przeglądarki
├── css/
│   └── styles.css       ← wygląd (kolory, czcionki, layout)
├── js/
│   └── main.js          ← interakcje (menu, galeria, formularz, animacje)
└── images/
    ├── hero-players.jpg  ← główne zdjęcie (gracze + niebo)
    ├── court-banner.jpg  ← kort z bannerem „A-TEAM"
    ├── court-evening.jpg ← korty o zmierzchu (tło sekcji Liga)
    ├── court-clay.jpg    ← zbliżenie na mączkę
    └── og-image.jpg      ← miniatura przy udostępnianiu linku
```

---

## 🚀 Jak opublikować na GitHub Pages

### Sposób 1 — przez stronę GitHub (najprościej, bez instalowania niczego)

1. Załóż konto na <https://github.com> (jeśli jeszcze nie masz).
2. Kliknij **New repository** (zielony przycisk).
   - **Repository name:** np. `a-team-tennis` (albo dowolna nazwa).
   - Ustaw **Public**.
   - Zaznacz **Add a README** — możesz, to nie przeszkadza.
   - Kliknij **Create repository**.
3. Wejdź w utworzone repozytorium → **Add file → Upload files**.
4. Przeciągnij **całą zawartość** folderu `a-team-tennis`
   (czyli `index.html`, `favicon.svg` oraz foldery `css`, `js`, `images`).
   > Ważne: wrzucasz to, co jest **w środku** folderu, a nie sam folder.
   > Plik `index.html` musi być w głównym katalogu repozytorium.
5. Na dole strony kliknij **Commit changes**.
6. Wejdź w **Settings → Pages** (menu po lewej).
7. W sekcji **Build and deployment → Source** wybierz **Deploy from a branch**.
8. W **Branch** wybierz `main` oraz folder `/ (root)` → **Save**.
9. Odczekaj 1–2 minuty i odśwież stronę. Pojawi się adres w stylu:
   `https://twoja-nazwa.github.io/a-team-tennis/`
   To jest link do gotowej strony. 🎉

### Sposób 2 — przez git (jeśli wolisz konsolę)

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

## ✏️ Jak edytować treść

Wszystko jest po polsku i podpisane w `index.html`. Najczęstsze zmiany:

| Co chcesz zmienić | Gdzie szukać w `index.html` |
|---|---|
| Numer telefonu | wyszukaj `507 146 610` (jest w kilku miejscach) oraz `+48507146610` |
| Adres | wyszukaj `Bema 126C` |
| Godziny otwarcia | sekcja z tabelą „Godziny otwarcia" |
| Cena za kort | wyszukaj `40 zł` |
| Teksty sekcji | edytuj bezpośrednio między znacznikami `<p>…</p>` i `<h2>…</h2>` |

> Numer telefonu w formularzu (do wysyłki SMS) zmienia się w `js/main.js`
> — na górze pliku jest linia `const PHONE = '+48507146610';`.

### Podmiana zdjęć

Wrzuć własne zdjęcia do folderu `images/` i albo nazwij je tak samo jak
obecne (wtedy nic więcej nie musisz robić), albo zmień nazwy plików w
`index.html` (wyszukaj np. `hero-players.jpg`).

**Wskazówka:** najlepiej prezentuje się zdjęcie z graczami i błękitnym niebem —
dlatego jest ustawione jako główne (hero). Jeśli w przyszłości zrobisz lepsze,
słoneczne ujęcia kortów, warto je podmienić — strona od razu zyska.

---

## 📩 (Opcjonalnie) Prawdziwa wysyłka rezerwacji na e-mail

Obecnie formularz **nie wysyła** danych na serwer — przygotowuje gotową
wiadomość, którą klient wysyła SMS-em lub potwierdza telefonicznie. To celowe:
nie wymaga backendu i działa od razu na GitHub Pages.

Jeśli chcesz dostawać rezerwacje na e-mail, możesz podłączyć darmową usługę
np. **Formspree** (<https://formspree.io>):

1. Załóż konto, utwórz formularz — dostaniesz adres typu
   `https://formspree.io/f/xxxxxx`.
2. W `index.html` znajdź `<form … id="rezForm">` i zamień na:
   `<form action="https://formspree.io/f/xxxxxx" method="POST" id="rezForm">`.
3. W `js/main.js` można wtedy wyłączyć blokadę `e.preventDefault()` w obsłudze
   formularza (albo zostawić obecne działanie jako dodatek).

Bez tego kroku strona działa w 100% poprawnie — to tylko rozszerzenie.

---

## 🎨 O projekcie (dla ciekawych)

- **Kolory:** butelkowa zieleń (tożsamość marki) + ceglana czerwień mączki
  (akcent, przyciski) + biel linii kortu (motyw przewodni).
- **Czcionki (Google Fonts):** Archivo (nagłówki), Inter (tekst),
  Space Mono (liczby / etykiety / „tablica wyników").
- **Motyw przewodni:** białe linie kortu tenisowego — w logo, w tle hero
  i w drobnych detalach.
- Strona jest responsywna (działa na telefonie i komputerze), ma animacje
  pojawiania się sekcji oraz respektuje ustawienie „ogranicz ruch"
  w systemie użytkownika.
