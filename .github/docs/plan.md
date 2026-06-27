# Plan: Przepisanie prototypu tatrarunning.pl na vanilla (pod WordPress)

## Kontekst / stan obecny

- Prototyp: React 18 (CDN UMD) + Babel Standalone, BEZ build-stepu. SPA z hash-routerem.
- ~3500 linii, ~35 komponentów. Czysty CSS z tokenami (`styles.css` base + `app.css` komponenty).
- Pliki: `index.html`, `data.jsx`, `ui.jsx`, `router.jsx`, `blocks.jsx`, `chrome.jsx`, `account.jsx`, `pages-*.jsx` (home/camp/shop/blog/team/legal/misc), `app.jsx`.
- Assets: `assets/*.webp` (logo, hero, team, trenerzy). `uploads/teksty-do-strony.md`.

## Decyzje (ustalone z klientem)

1. **Cel vanilla** = STATYCZNE, wielostronicowe HTML/CSS/JS — jeden plik HTML na typ szablonu WP (mapowanie 1:1 na `header.php` / `footer.php` / `page-*.php` / `single-*.php`).
2. **AURA** jest **w pełni instalowana** (nie tylko wizualnie): orb obecności w navbarze + 4 stany + panel + warstwa analityczna. **Presety** zostają, ale **przemianowane na klimat tatrarunning.pl** (górsko-biegowy): *Na lekko* (wszystko włączone), *Szlakiem* (domyślny, wyważony), *Schronisko* (nic ekstra). Pełna specyfikacja: [`aura.md`](./aura.md).
3. **Klaro JS** zarządza WSZYSTKIMI zgodami i bramkuje embedy (YouTube, mapy Google/OSM, pełny formularz). Zastępuje prototypowy system `consent` + `PrivacyMap` / `PrivacyVideo`. Zsynchronizowany z panelem Aury — zob. [`aura.md`](./aura.md).
4. **Analityka** (zob. [`aura.md`](./aura.md)): przedzgodowa = **GA4 #1 sandbox** przez **server-side GTM** z **dobowym first-party cookie** (ślad ulotny); po zgodzie = **druga instancja GA4** (#2 produkcyjna).
5. **Konfigurator bonów**: plan wysokopoziomowy teraz, szczegóły WooCommerce dopiero przy wdrożeniu.

## Mapowanie React → vanilla → WP

| Prototyp (React) | Vanilla | WordPress |
| --- | --- | --- |
| `chrome.jsx` Header/Footer/MobileMenu | `partials/header.html` + `footer.html` | `header.php` / `footer.php` |
| `router.jsx` (hash) | ZNIKA | natywne URL + szablony WP |
| `ui.jsx` `Icon` (inline SVG) | sprite SVG / partial | sprite w motywie |
| `ui.jsx` `zl()` formatter | JS util | `wc_price()` (PHP) |
| `ui.jsx` Cart (localStorage) | makieta koszyka | WooCommerce koszyk + mini-cart fragments |
| `account.jsx` auth/user | makieta konta | WooCommerce My Account |
| `account.jsx` consent | Klaro JS | Klaro w motywie |
| `account.jsx` AURA (orb + 4 stany + panel) | `aura.js` + panel (pełna instalacja) | `aura.js` w motywie; orb/panel nie-cacheowalne (ESI) |
| Analityka (pomiar) | sGTM snippet + dobowe cookie | sGTM + GA4 #1 sandbox (przed zgodą) / GA4 #2 (po zgodzie) |
| `data.jsx` `CAMPS` | dane statyczne | **produkt WooCommerce** (kat. `obozy` + podkat. biegowe/skitour/kids/junior) + ACF; slug przez `%product_cat%` → `/obozy/...` |
| `data.jsx` `TRAINERS` | dane statyczne | CPT „trener” + ACF (relacja produkt-obóz ↔ trener) |
| `data.jsx` `POSTS` | dane statyczne | natywne wpisy WP + kategorie |
| `data.jsx` `PARTNERS` | dane statyczne | **ACF repeater** (na stronie Partnerzy / ACF Options) — nie CPT |
| `pages-shop` voucher | konfigurator + live preview | **produkt WooCommerce** (kat. `bony`) + ACF; slug przez `%product_cat%` → `/bony/...` |
| Newsletter (footer) | makieta formularza | Gravity Forms + Mailchimp add-on |
| Kontakt | makieta formularza | Gravity Forms |

## Inwentaryzacja danych (`.github/docs/data-inventory.md`)

Osobny dokument, tworzony w Fazie 0.5 na podstawie analizy plików `.jsx`. Cel: zanim zaczniemy port do HTML, mieć kompletną mapę **co** jest renderowane i **skąd** pochodzi — by nic nie zgubić przy przepisaniu i by mieć gotową podstawę pod pola ACF / produkt Woo.

**Struktura dokumentu:**

1. **Lista wszystkich widoków** (1 widok = 1 docelowy plik HTML / szablon WP), np.: Home, Archiwum obozów, Single obozu, Zespół, Single trenera, Partnerzy, Bony (konfigurator), Koszyk, Kasa, Kontakt, Blog (archiwum), Single wpisu, Kreator (dodaj obóz), Newsletter (podziękowanie), strony prawne (regulamin / zasady newslettera / prywatność / dokumenty).
2. **W ramach każdego widoku — grupy danych.** Dla każdej grupy:
   - **nazwa grupy** (np. „Hero”, „Karta obozu”, „Plan dnia”, „Co obejmuje / nie obejmuje”, „Karta trenera”, „Konfigurator bonu”, „Meta wpisu”),
   - **pola** w grupie (nazwa, typ: tekst / liczba / cena / data / lista / obraz / relacja / boolean),
   - **powtarzalność** (pojedyncze vs. repeater/lista),
   - **źródło w prototypie** (`data.jsx`: `CAMPS`, `TRAINERS`, `POSTS`, `PARTNERS`, `VOUCHER_TEMPLATES`, `VOUCHER_AMOUNTS`; albo treść statyczna / generowana, np. AURA),
   - **wstępny cel w WP** (natywne pole Woo / ACF field / taksonomia / treść statyczna) — kolumna pomocnicza dla Fazy 5.
3. **Pola współdzielone między widokami** (np. obóz pojawia się jako karta na Home i w archiwum, i jako pełny rekord na single) — zaznaczyć, by zmapować raz.

> Dokument jest źródłem prawdy dla Fazy 2 (port HTML — żeby odwzorować każdą grupę) i Fazy 5 (mapowanie na produkt Woo / ACF / CPT trener). Aktualizowany, jeśli analiza odsłoni dane nieujęte wcześniej.

## Model danych w WordPress

- **Obóz = produkt WooCommerce** (NIE osobny CPT). WooCommerce trzyma wszystko na jednym post type `product`; rozdzielenie slugów robimy **kategoriami produktowymi** + permalink `%product_cat%`:
  - `obozy` → URL `/obozy/<slug>/` (kat. główna), z podkategoriami: **biegowe**, **skitour**, **kids**, **junior**.
  - `bony` → URL `/bony/<slug>/`.
  - Każdy produkt ma ustawioną **kategorię główną (primary)** sterującą slugiem.
- **Obóz i bon sprzedawane przez WooCommerce** — koszyk, kasa, PayU/P24, zamówienia natywnie dla obu.
- **Partnerzy** → **ACF repeater** (nie CPT) na stronie Partnerzy lub w ACF Options.
- **Trenerzy** → CPT `trener` + ACF; relacja do produktów-obozów polem ACF Relationship.

### Pola ACF dla produktu-obozu (z `data.jsx`)

Na produkcie (kat. `obozy`), poza natywnymi polami Woo (cena, stan magazynowy = wolne miejsca):
`deposit` (zaliczka), `location`, `region`, `dates`, `days`, `level`, `type`, `status` (open/few/full), `featured`, `hero`, `lead`, `intro[]`, `included[]`, `excluded[]`, `plan[]` (repeater: `day` / `title` / `items[]`), `where`, `sleep`, `prep`, `coachSlugs` (relacja do CPT `trener`).

> `price` i `spotsLeft` mapują się na natywne pola Woo (cena regularna, stan magazynowy). `deposit` przez wtyczkę typu WooCommerce Deposits lub własną logikę — szczegóły przy wdrożeniu.

### Wprowadzanie treści z front-endu (ACF-form, wizard)

- Trenerzy oraz produkty-obozy mają być wprowadzane **z front-endu przez `acf_form()`** — jako **wielostronicowy kreator** w stylu Airbnb (krok po kroku: podstawy → lokalizacja/daty → plan → co obejmuje → trenerzy → cena/zaliczka/miejsca → podgląd/publikacja).
- Referencja: użytkownik dostarczy przykładową wtyczkę/implementację z innego projektu (do załączenia) — odwzorować jej wzorzec.
- W warstwie vanilla: zaprojektować **makietę UI kreatora** (kroki, walidacja, pasek postępu), gotową do podpięcia pod `acf_form()` w motywie.

## Treści NIE-cacheowalne (LiteSpeed ESI / lazy JS)

- Licznik koszyka (cart badge), stan mini-koszyka.
- Stan konta w headerze (zalogowany/niezalogowany, `AccountMenu`).
- Nonce'y formularzy / WooCommerce.
- Tożsamość AURA / orb / panel obecności (per-przeglądarka, zależne od cookie/seeda).
- Wskaźnik zaufania w panelu Aury („X z 4 wstrzymanych”).

## Organizacja repozytorium

- Aktualny prototyp React (wszystkie obecne pliki: `index.html`, `*.jsx`, `styles.css`, `app.css`, `assets/`, itd.) przenosimy do folderu w roocie: **`react-design/`**.
- Przepisaną wersję vanilla budujemy w folderze: **`vanilla-design/`**.
- Dzięki temu oba warianty żyją obok siebie i można je łatwo porównywać (parity wizualny).

## Workflow git / wersjonowanie (commit → branch → PR → merge → tag)

> Spina cykl fazowy z gitem. Rola recenzenta jest „przed-merge" — recenzja idzie na diffie PR, a wykonawca **nie** merguje sam. **GitHub CLI (`gh`) jest zainstalowane** — wykonawca używa `gh pr create` do otwierania PR.

**Repozytoria (wszystkie pod git/PR).** Każdy artefakt ma własne repo na GitHubie i podlega pełnemu cyklowi gitowemu — **również `tatra-running-meta`** (dokumentacja, plan, prototyp, inwentaryzacja):

| Folder roboczy | Repo GitHub |
|---|---|
| `tatrarunning-core` | https://github.com/przemekcichon/tatrarunning-core |
| `tatrarunning-theme` | https://github.com/przemekcichon/tatrarunning-theme |
| `tatrarunning-aura` | https://github.com/przemekcichon/tatrarunning-aura |
| `tatra-running-meta` | https://github.com/przemekcichon/tatra-running-meta |

> Repozytoria `core`/`theme`/`aura` są dodatkowo wypychane na produkcję przez **WP Pusher**. `meta` jest tylko wersjonowane (bez deployu).

**Cykl gitowy fazy — obowiązuje dla KAŻDEGO repo (w tym meta):**

1. **Branch na każdą fazę.** Wykonawca tworzy branch fazy (np. `feature/<artefakt>-<faza>`, `docs/<faza>` dla meta) i pracuje na nim — **nigdy bezpośrednio na `main`/`master`**.
2. **Atomowe commity.** Każdy commit = jedna spójna zmiana, w **Conventional Commits (EN)** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`…). Bez `git add .` na ślepo; **bez sekretów** w commitcie (klucze PayU/P24, GA4/sGTM, Mailchimp → poza repo).
3. **Push + PR (obowiązkowo).** Po zakończeniu realizacji etapu wykonawca **pushuje branch i otwiera PR** (`gh pr create`) — opis PR odzwierciedla aktualny stan brancha. Diff PR jest wejściem do recenzji (input #1 recenzenta). **PR jest wymagany — nie pomijamy go.**
4. **Recenzja na diffie.** Recenzent-subagent ocenia zmiany z diffu/PR (czyta też kod z dysku). Read-only — **nie merguje, nie pushuje, nie robi force-push**.
5. **Merge należy do człowieka.** Wykonawca **NIE merguje** i **NIE robi force-push**. Po checkpoincie i naniesieniu poprawek **decyzję o merge PR podejmuje człowiek**.
6. **Wersjonowanie tagami (SemVer).** Wydania znaczymy **tagami wg [SemVer](https://semver.org/lang/pl/)** (`MAJOR.MINOR.PATCH`, np. `v0.2.0`). **Wykonawca SUGERUJE numer wersji**, kiedy zmiana na to zasługuje (zakończona faza / funkcjonalność), z krótkim uzasadnieniem bumpa (patch = poprawki, minor = nowa funkcjonalność wstecznie zgodna, major = zmiana łamiąca). **Tag nakłada człowiek** po merge — wykonawca sam nie taguje. Każde repo wersjonuje się niezależnie.

> Zasada nadrzędna: zadanie ground-truth jest TYLKO DO ODCZYTU — **bez brancha, bez commitów, bez tagów** (zob. [`ground-truth-start-fazy.prompt.md`](../prompts/ground-truth-start-fazy.prompt.md)).

## Struktura docelowa wersji vanilla

> Ścieżki poniżej są względem folderu `vanilla-design/`.

```
/index.html               (home → front-page.php)
/obozy.html               (archiwum/filtr kategorii → archive produktów kat. obozy)
/oboz.html                (single obozu → single-product.php, kat. obozy)
/zespol.html              (page-zespol.php)
/trener.html              (single-trener.php)
/partnerzy.html           (page-partnerzy.php; ACF repeater)
/bony.html                (konfigurator bonów → produkt Woo, kat. bony)
/koszyk.html  /kasa.html  (Woo cart/checkout — makieta)
/kontakt.html             (Gravity Form)
/blog.html                (archiwum → home.php / archive.php)
/blog-post.html           (single.php)
/dodaj-oboz.html          (kreator ACF-form, wizard wielostronicowy — makieta)
/newsletter.html          (podziękowanie)
/regulamin.html  /zasady-newslettera.html  /prywatnosc.html  /dokumenty.html
/partials/header.html, footer.html
/css/tokens.css, base.css, components.css, pages.css
/js/header.js, reveal.js, accordion.js, cart.js, voucher.js, wizard.js, aura.js, embeds.js, klaro.config.js
/assets/ (istniejące webp)
```

## Fazy

- **Faza 0 — Scaffold:** przeniesienie obecnego prototypu React do `react-design/`, utworzenie folderu `vanilla-design/` ze strukturą, przeniesienie assetów, decyzja o include partiali (fetch-include lub duplikacja).
- **Faza 0.5 — Inwentaryzacja danych (`.github/docs/data-inventory.md`):** na podstawie analizy plików `.jsx` (które trafią do HTML) wypisać **wszystkie widoki** (strony/szablony) i w ramach każdego widoku **grupy danych** — jakie pola/obiekty są renderowane, skąd pochodzą (`data.jsx`: CAMPS / TRAINERS / POSTS / PARTNERS / VOUCHER_* itd.), ich typy i powtarzalność. To fundament pod port HTML (Faza 2) oraz mapowanie na produkt Woo / pola ACF / CPT trener (Faza 5). Szczegóły formatu — sekcja *Inwentaryzacja danych* poniżej.
- **Faza 1 — Design system:** reorganizacja `styles.css` + `app.css` w `css/tokens|base|components|pages`. CSS w większości reużywalny 1:1.
- **Faza 2 — Statyczne szablony HTML:** port JSX→semantyczny HTML dla każdego typu strony. Header/Footer jako partiale.
- **Faza 3 — Vanilla JS** (progressive enhancement): `header.js` (scroll-hide, mobile menu, dropdown), `reveal.js` (IntersectionObserver), `accordion.js` (plan obozu), galeria, makieta koszyka, konfigurator bonów + live preview (`VoucherArt`), `wizard.js` (kreator ACF-form: kroki, walidacja, pasek postępu).
- **Faza 4 — Aura + Klaro + analityka** (pełna instalacja wg [`aura.md`](./aura.md)): `aura.js` (orb, 4 stany, awatar seeded RNG → SVG, panel obecności z presetami *Na lekko / Szlakiem / Schronisko*), `klaro.config.js` (zgody + bramkowanie embedów), `embeds.js` (warianty prywatne YT/mapy/formularz), warstwa analityki (sGTM + dobowe cookie / GA4 #1 sandbox przed zgodą, GA4 #2 po zgodzie), synchronizacja Aura ↔ Klaro.
- **Faza 5 — Dokument mapowania na WP:** plik HTML→szablon, dane→produkt Woo/ACF/CPT trener, interakcje→wtyczki, kreator front-end→`acf_form()`. Notatki nt. ESI/non-cache, integracji wtyczek, permalinków `%product_cat%`.

## Zakres

**WŁĄCZONE:** pełny rewrite vanilla wszystkich stron, design system, moduły JS, **pełna instalacja Aury** (orb + 4 stany + panel + analityka wg [`aura.md`](./aura.md)), Klaro (zgody + embedy), dokument mapowania WP.

**WYŁĄCZONE (na później):** faktyczny motyw WP (PHP), szczegóły produktu Woo/bonów, konfiguracja/licencje wtyczek (PayU/P24, ACF PRO, Gravity Forms, Wordfence, WP Pusher), konfiguracja serwera LiteSpeed/ESI (tylko notatki).

## Weryfikacja

- Serwowanie lokalne, przeklikanie każdej strony, brak błędów w konsoli.
- RWD (mobile menu, header scroll-hide), Lighthouse (a11y/perf).
- Klaro: baner zgody, zapamiętanie wyboru, bramkowanie embedów działa; synchronizacja z panelem Aury.
- Aura: orb przechodzi przez 4 stany, panel steruje integracjami, opt-out (Unmeasured) nie tworzy ID; analityka — GA4 #1 sandbox przed zgodą (dobowe cookie), GA4 #2 po zgodzie.
- Porównanie wizualne z prototypem React (pixel parity kluczowych sekcji).

## Do rozważenia

1. **Partiale w statycznym HTML** — by uniknąć duplikacji header/footer w ~15 plikach:
   - *A)* lekki `fetch()`-include (jeden plik HTML, ładowany JS-em; bliżej mapowania na `get_header()`),
   - *B)* duplikacja markupu (zero JS, prościej, ale trudniej utrzymać),
   - *C)* mini-generator (krótki skrypt Node łączący partiale przy zapisie).
   - **Rekomendacja: A.**
2. **Makieta koszyka/kasy** — czy odwzorować pełny drawer + checkout jako statyczny UI (do podmiany na Woo), czy zostawić tylko link „Koszyk" i całość oddać Woo?
   - **Rekomendacja:** odwzorować drawer + stronę koszyka, kasę zostawić makietowo.
3. **Kreator ACF-form (wizard)** — czeka na **referencyjną wtyczkę/implementację** z innego projektu użytkownika. Do czasu jej dostarczenia projektujemy makietę UI kroków; ostateczna struktura pól i przepływ — wg referencji.
