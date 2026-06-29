# Aura — wdrożenie w projekcie WordPress + WooCommerce (obozy biegowe w górach)

> Dokument **wdrożeniowy (JAK)**. Spina wzorzec **Aura** (orb obecności + panel + cztery stany) z konkretnym stackiem sklepu: **WordPress + WooCommerce**, **Klaro** jako silnik zgód i ładowania usług, **dwie instancje GA4 przez sGTM** (sandbox przedzgodowy + produkcyjna po zgodzie), oraz integracje **WhatsApp ↔ telefon**, **YouTube**, **OpenStreetMap** i **Gravity Forms**.
>
> **Specyfikacja wzorca (CO):** `aura.md` — stany, orb, panel, model pomiaru, język. Ten dok. jest nadrzędny przy konflikcie czysto technicznym/WP. Kontekst koncepcyjny: `Aura-koncepcja.md`, `Aura-analityka-przedzgodowa.md`, `Aura-terminologia-obecnosci.md`.

---

## 1. Cel i zasada podziału ról

Aura **nie zastępuje** Klaro ani analityki — jest **warstwą prezentacji i kontroli** postawioną nad nimi. Podział odpowiedzialności jest sztywny:

| Warstwa | Czym jest | Za co odpowiada |
|---|---|---|
| **Klaro** | Consent Manager (CMP) | Jedyne źródło prawdy o zgodach. Przechowuje decyzje, gatuje (ładuje/blokuje) każdą usługę zewnętrzną, emituje sygnały zgodowe (w tym Google Consent Mode v2). **Własne okno Klaro schowane.** |
| **Aura** | UI obecności: orb w navbarze + panel + cztery stany | **Jedyna widoczna kontrolka** zgód. Wizualizuje, kim jest gość (orb), i daje mu kontrolę. Panel Aury **pisze do Klaro** przez jego API — nie trzyma własnego stanu zgód. |
| **GA4 #1 sandbox (sGTM)** | Instancja przedzgodowa | Pomiar **przedzgodowy** (stan *Ślad ulotny*). Dobowe first-party cookie (reset 24 h), karmiona przez sGTM. |
| **GA4 #2 produkcyjna (sGTM)** | Instancja po zgodzie | Pomiar **po zgodzie** (stany 2–3). Ładowana wyłącznie po `ga4-analytics: true`. |

**Reguła nadrzędna:** panel Aury nigdy nie zmienia stanu usług bezpośrednio. Każde przełączenie woła `klaro.getManager().updateConsent(service, bool)` i `saveAndApplyConsents()`. Klaro pozostaje jedynym wykonawcą.

---

## 2. Mapowanie czterech stanów Aury na stack

| Stan Aury | Co go realizuje technicznie | Pomiar | Podstawa |
|---|---|---|---|
| **0 · Unmeasured** (podłoga) | Klaro „odrzuć wszystko" **plus** opt-out z `ga4-essential` + flaga `aura_unmeasured` → identyfikator dobowy **nie powstaje** (cookie nie stawiane, sGTM nie liczy). | brak ID pomiarowego | sprostowanie / opt-out |
| **1 · Ślad ulotny** (domyślny, przedzgodowy) | GA4 #1 sandbox przez sGTM. Identyfikator **dobowy** w first-party cookie (reset co 24 h). Brak GA4 produkcyjnej w przeglądarce. | pseudonimowy, ulotny | § 25 ust. 2 nr 2 TDDDG — funkcja usługi |
| **2 · Rozpoznane urządzenie** (po zgodzie) | Klaro `ga4-analytics: true` → ładuje GA4 #2 produkcyjną z trwałym first-party cookie. GA4 #1 sandbox działa dalej (dedup po `client_id`). | pseudonimowy, trwały | zgoda (Klaro) |
| **3 · Powiązana tożsamość** | Gość jest zalogowanym klientem **WooCommerce**. `user_id` z konta WP łączy aktywność. Hash e-maila/telefonu **z solą** (server-side). | dane identyfikujące | zgoda + uwierzytelnienie WooCommerce |

Stany 1→2→3 to drabina identyfikacji. Stan 0 to **podłoga prostopadła** — osiągalna z każdego z trzech pozostałych przez cichy link „Turn off measurement entirely".

---

## 3. Analityka dwutorowa — szczegóły

### 3.1 Tor przedzgodowy — GA4 #1 sandbox (stan *Ślad ulotny*)

- **Instancja sandbox**, karmiona przez **sGTM**; izolowana od produkcyjnej, służy weryfikacji dostarczenia usługi.
- **Identyfikator dobowy** w first-party cookie, reset co 24 h — licznik „rusza od zera" każdego dnia (realizacja *ulotności*). Alternatywa server-side (hash IP+UA+sól) jest poza zakresem tego etapu (brak narzędzia).
- **Minimalizacja (twarde granice z `Aura-analityka-przedzgodowa.md`):**
  - mierzymy **jak używana jest usługa**, nie obserwujemy osoby (poziom usługi, nie osoby),
  - **brak aktywnego odczytu cech urządzenia** w JS (np. rozdzielczości) i **brak fingerprintingu** ponad to, co i tak przychodzi w nagłówkach,
  - dane służą **wyłącznie** weryfikacji, czy strona/sklep są dostarczane poprawnie (np. „czemu mobile ma mało dodań do koszyka") — **nie** optymalizacji reklam, **nie** personalizacji. W chwili gdy cel się zmienia, wracamy do zgody.
- **Consent Mode v2:** w tym torze `analytics_storage = denied`. GA4 #1 sandbox pracuje na zdarzeniach bez identyfikatorów ciasteczkowych.

### 3.2 Tor po zgodzie — GA4 #2 produkcyjna (stan *Rozpoznane urządzenie*)

- GA4 #2 ładuje **wyłącznie Klaro** po zatwierdzeniu `ga4-analytics`. Nigdy nie ładuje się „na sztywno" w nagłówku motywu.
- Po zgodzie Consent Mode v2 przechodzi w `analytics_storage = granted`; pojawia się trwałe first-party cookie i stabilny `client_id`.
- **Deduplikacja:** GA4 #1 sandbox i GA4 #2 produkcyjna; zdarzenia spinane po `client_id`/`session_id`, żeby nie podwajać.

### 3.3 Stan *Powiązana tożsamość* (WooCommerce)

- Logowanie klienta WooCommerce ustawia `user_id` w pomiarze (User-ID GA4). Wcześniejsza aktywność łączy się z kontem **bez resetu preferencji** — ustawienia Klaro/Aury przenoszą się na konto (patrz §6).
- Łączenie między urządzeniami: hash trwałego identyfikatora (e-mail/telefon) **z solą** — server-side. Bez soli ten sam hash łączyłby też między domenami, czego nie robimy.

---

## 4. Klaro — konfiguracja usług (services) i mapowanie na panel Aury

Klaro definiuje listę `services`. Każda usługa to przełącznik w panelu Aury. Panel Aury renderuje własny UI, ale **stan czyta i zapisuje wyłącznie przez Klaro**.

```js
// klaro-config.js — zarys
window.klaroConfig = {
  acceptAll: true,
  default: false,            // domyślnie usługi OFF (poza ga4-essential = ON, ale z opt-out)
  storageMethod: 'cookie',
  cookieName: 'aura_klaro',
  services: [
    {
      name: 'ga4-essential',             // Tor przedzgodowy (stan 1) — ON, ale wyłączalny
      title: 'Pomiar dostarczenia usługi',
      purposes: ['analytics'],
      // GA4 #1 sandbox; włączony od startu jako funkcja usługi, NIGDY required — opt-out w panelu Aury
    },
    {
      name: 'ga4-analytics',             // Tor po zgodzie (stan 2) — GA4 #2 produkcyjna
      title: 'Google Analytics 4',
      purposes: ['analytics'],
    },
    {
      name: 'youtube',                   // przełącznik „Filmy YouTube"
      title: 'YouTube',
      purposes: ['media'],
    },
    {
      name: 'osm',                       // przełącznik „Mapy (OpenStreetMap)"
      title: 'OpenStreetMap',
      purposes: ['maps'],
    },
    {
      name: 'whatsapp',                  // przełącznik „Numer telefonu → WhatsApp"
      title: 'WhatsApp',
      purposes: ['contact'],
    },
    {
      name: 'gravity-forms',             // przełącznik „Pełny formularz"
      title: 'Gravity Forms',
      purposes: ['forms'],
    }
  ]
};
```

> **Brak required:** każda usługa jest wyłączalna — także `ga4-essential` (startuje ON, ale panel Aury daje opt-out → Unmeasured). „Technicznie niezbędne" ≠ „nie do wyłączenia": gdy gość chce wyłączyć — wyłącza.

> **Uwaga o Klaro UI:** w docelowym wdrożeniu **chowamy własne okno Klaro** (modal/notice) i traktujemy je jako silnik. Widoczną kontrolką jest **panel Aury**. Pierwsze wejście nie pokazuje banera-ściany — gość od razu istnieje (Ślad ulotny), a zgody zbiera przez orb. (Jeśli compliance wymaga jawnego notice, można zostawić minimalny notice Klaro jako fallback bez JS.)

### Mapowanie przełączników (panel Aury ↔ usługa Klaro)

| Przyciski w panelu Aury ↔ usługa Klaro | Usługa Klaro | Prywatnie (domyślnie) | Wygodnie (po włączeniu) |
|---|---|---|---|
| Numer telefonu | `whatsapp` | Dialer systemowy (`tel:`) | Link/klik do WhatsApp |
| Filmy YouTube | `youtube` | Miniatura (nic nie ładuje się z YT) | Osadzony odtwarzacz |
| Mapy | `osm` | Statyczny obraz / link do mapy | Interaktywne kafle OpenStreetMap |
| Formularze | `gravity-forms` | Lekki fallback (bez zewn. JS) | Pełny formularz Gravity Forms |

---

## 5. Integracje na stronie

### 5.1 WhatsApp ↔ telefon

- **Domyślnie (Schronisko/Szlakiem):** numer renderowany jako `tel:+48…` — otwiera dialer, zero żądań zewnętrznych.
- **Po włączeniu `whatsapp`:** ten sam przycisk przełącza się na `https://wa.me/48…`. Przełącznik w panelu Aury pisze do Klaro (`updateConsent('whatsapp', …)`), a front podmienia `href` i etykietę bez przeładowania.
- Implementacja: jeden komponent przycisku kontaktu, który czyta `klaro.getManager().getConsent('whatsapp')`.

### 5.2 YouTube — wyłączanie filmów

- **Domyślnie:** zamiast `<iframe>` renderujemy **miniaturę** (lokalny obraz lub `i.ytimg.com` tylko jeśli dopuszczone — preferuj lokalnie zhostowany kadr) z przyciskiem play. Żaden skrypt ani cookie YT się nie ładuje.
- **Po włączeniu `youtube`:** kliknięcie (lub globalne włączenie w panelu) podmienia miniaturę na właściwy `<iframe>` (rozważ `youtube-nocookie.com`). Klaro gatuje wstrzyknięcie iframe.
- Wzorzec „click-to-load" + globalny przełącznik w panelu Aury, oba spięte z usługą `youtube`.

### 5.3 OpenStreetMap

- **Domyślnie:** statyczny podgląd lokalizacji obozu (lokalny obraz / link „Otwórz mapę") — bez żądań do serwerów kafli.
- **Po włączeniu `osm`:** ładujemy interaktywną mapę (Leaflet + kafle OSM). Mimo że OSM jest prywatnościowo lepszy niż Google Maps, kafle to wciąż żądanie do strony trzeciej (`tile.openstreetmap.org`) — dlatego **też przechodzi przez Klaro** (`osm`).
- Hostuj Leaflet lokalnie (z motywu), nie z CDN, żeby nie generować dodatkowego żądania zewnętrznego przed zgodą.

### 5.4 Gravity Forms

- **Domyślnie:** lekki fallback — prosty `mailto:` / link kontaktowy, bez ładowania skryptów Gravity.
- **Po włączeniu `gravity-forms`:** pełny formularz Gravity z walidacją/JS. Klaro gatuje wstrzyknięcie skryptu.
- Przełącznik w panelu Aury pisze do Klaro (`updateConsent('gravity-forms', …)`).

---

## 6. Presety (panel Aury) → batche zgód Klaro

Trzy presety panelu mapują się na zbiorcze ustawienie usług Klaro:

| Preset | Usługi Klaro | Efekt |
|---|---|---|
| **Na lekko** (Smooth ride) | `ga4-essential`, `ga4-analytics`, `youtube`, `osm`, `whatsapp`, `gravity-forms` = ON | Pełna wygoda, wszystko ładowane. |
| **Szlakiem** (Balanced, domyślny) | tylko `ga4-essential` ON; reszta OFF | Rozsądny środek: ślad ulotny aktywny, zero stron trzecich. |
| **Schronisko** (Sanctuary) | wszystko OFF | Pełna prywatność; krok od Unmeasured (opt-out także z `ga4-essential`). |

Preset woła `updateConsent` dla wszystkich usług naraz + `saveAndApplyConsents()`.

---

## 7. Stan Unmeasured — opt-out z każdego stanu

- Cichy link na dole panelu „**Turn off measurement entirely →**" (widoczny w stanach 1–3).
- Działanie: ustawia trwałą flagę `aura_unmeasured` (cookie/localStorage **niezbędne funkcjonalnie**, nie pomiarowe) **oraz** odrzuca wszystkie usługi Klaro (w tym `ga4-essential`). Front przestaje wysyłać zdarzenia, a sGTM — widząc flagę — **nie liczy** identyfikatora dobowego.
- Orb się **wygasza** (pusty rdzeń, pierścień zgaszony, poświata off) — patrz `Aura-koncepcja.md` §3.
- Powrót: stopka panelu oferuje „Turn measurement back on" → wraca do *Śladu ulotnego*.

---

## 8. Integracja z WordPress / WooCommerce

- **Orb w navbarze:** podmienia ikonę konta w headerze motywu. Uwaga — **nie usuwa** funkcji My Account WooCommerce; stan *Powiązana tożsamość* = zalogowany klient. Zalecane: child theme, hook `wp_nav_menu_items` lub własny blok/part headera (FSE).
- **Ładowanie skryptów:** `wp_enqueue_script` dla Klaro (najwyżej, w `<head>`, blokująco), potem konfiguracji Aury i panelu. Klaro musi załadować się **przed** jakimkolwiek tagiem usługi.
- **GA4 #1 sandbox:** kontener sGTM odbiera zdarzenia przedzgodowe, stawia dobowe first-party cookie (reset 24 h) i raportuje do instancji sandbox. Brak ładowania skryptu Google na froncie w tym torze.
- **Przełączniki WhatsApp / YouTube / OSM / Gravity** piszą do Klaro, nie ustawiają stanu lokalnie.
- **Linked identity:** `is_user_logged_in()` → przekazanie `user_id` do pomiaru; przeniesienie preferencji Klaro/Aury na meta konta przy logowaniu (`wp_login`), tak by „rozpoznany dziś, Ty jutro" działało bez resetu.
- **WooCommerce events:** `add_to_cart`, `begin_checkout`, `purchase` raportowane **w obu torach** — w przedzgodowym tylko jako weryfikacja poprawności dostarczenia usługi (poziom usługi), w torze po zgodzie z pełnym `client_id`.

---

## 9. Checklista wdrożeniowa

- [ ] Klaro załadowany jako pierwszy, własny modal/notice schowany, panel Aury jest jedyną widoczną kontrolką.
- [ ] GA4 #1 sandbox: identyfikator dobowy w first-party cookie, reset 24 h, `analytics_storage=denied`; `ga4-essential` ON z opt-out.
- [ ] GA4 #2 produkcyjna ładowana **wyłącznie** przez Klaro po `ga4-analytics: true`; Consent Mode v2 spięty.
- [ ] Deduplikacja zdarzeń między sandbox a produkcyjną.
- [ ] Przełączniki WhatsApp / YouTube / OSM / Gravity piszą do Klaro, nie ustawiają stanu lokalnie.
- [ ] YouTube i OSM domyślnie nie wykonują żadnego żądania zewnętrznego (click-to-load, lokalny Leaflet/miniatura).
- [ ] Presety Na lekko / Szlakiem / Schronisko mapują na batche `updateConsent`.
- [ ] Brak required — każda usługa wyłączalna; link „Wyłącz pomiar całkowicie" w stanach 1–3; flaga `aura_unmeasured` zatrzymuje liczenie ID.
- [ ] Link „Turn off measurement entirely" dostępny w stanach 1–3; flaga `aura_unmeasured` zatrzymuje liczenie ID po stronie serwera.
- [ ] Orb obsługuje 4 stany; *Powiązana tożsamość* spięta z logowaniem WooCommerce; preferencje przenoszą się na konto.
- [ ] Język UI bez słowa „anonimowy" (zob. `Aura-terminologia-obecnosci.md`).

---

## 10. Zgodność i uwagi

- Podstawa bezzgodowego pomiaru i czwarty stan: `Aura-analityka-przedzgodowa.md` (§ 25 ust. 2 nr 2 TDDDG, OH Digitale Dienste DSK 2024 — kierunek projektowy, nie porada prawna).
- Zasady językowe (zakaz „anonimowy", warstwa UI vs spec): `Aura-terminologia-obecnosci.md`.
- Każde wdrożenie wymaga oceny indywidualnej z DPO — niniejszy dokument opisuje kierunek projektowy, nie poradę prawną.
