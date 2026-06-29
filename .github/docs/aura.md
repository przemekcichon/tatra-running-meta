# Aura — specyfikacja wdrożeniowa (dla agenta)

> Dokument źródłowy dla wdrożenia wzorca **Aura** w projekcie tatrarunning.pl (wersja vanilla → WordPress).
> Konsoliduje trzy notatki koncepcyjne: *koncepcja*, *terminologia obecności*, *analityka przedzgodowa*.
> Wzorzec: **aurapattern.eu** · demo: **northwind.eu**.
>
> **Dwa dokumenty źródłowe Aury, jedna prawda:**
> - **`aura.md` (ten) = specyfikacja wzorca (CO):** stany, orb, panel, język, model pomiaru, mapowanie na projekt.
> - **`aura-integracja-wordpress-woocommerce.md` = wdrożenie (JAK):** nazwy usług Klaro, hooki WP/WooCommerce, presety, integracje. **Przy konflikcie technicznym dok. integracji jest nadrzędny.**
>
> **Aura jest tool-agnostyczna** — to wzorzec UI + model stanów obecności, nie konkretny stack. W tym projekcie spinamy ją z:
> - **Klaro** (JS) — silnik zgód przyjmujący sygnały zgodowe i bramkujący embedy. **Brak osobnego panelu Klaro** — własny modal/notice schowany; **panel Aury jest jedyną widoczną kontrolką** zgód.
> - **GA4 + server-side GTM (sGTM)** — analityka,
> - **dobowe first-party cookie** — identyfikator śladu ulotnego (przed zgodą).

---

## 0. Cel wdrożenia

Aura ma być **w pełni zainstalowana** w projekcie (nie tylko jako element wizualny):

1. **Orb obecności** w navbarze zamiast klasycznej ikony „profilu", obsługujący **cztery stany** tym samym kształtem.
2. **Panel** otwierany kliknięciem orba — sterowanie obecnością i integracjami **przed** założeniem konta i po nim.
3. **Warstwa analityczna** zgodna z modelem stanów: pomiar przedzgodowy (ślad ulotny) + pomiar po zgodzie, spięte z Klaro.
4. **Język** zgodny z zasadami wzorca (nigdy „anonimowy”).

> **Odstępstwo od pierwotnego planu:** wcześniej ustalono „AURA zostaje jako element wizualny, presety usunąć”. Teraz zakres jest szerszy — Aura jest funkcjonalna (stany + analityka). **Presety zostają**, ale są **przemianowane na klimat tatrarunning.pl** (górsko-biegowy) — zob. sekcja 3.1. Reszta panelu zostaje.

---

## 1. Cztery stany obecności

Aura obsługuje **cztery stany** — nie binarne „anonim ↔ zalogowany”. Stany 1–3 to coraz mocniejsza identyfikacja; stan 0 to **podłoga** najbliższa anonimowości, osiągalna z każdego z pozostałych.

| # | Stan (UI) | Mechanizm | Status danych | Podstawa |
|---|---|---|---|---|
| 0 | **Unmeasured** (podłoga) | Opt-out z pomiaru: identyfikator dobowy/sesyjny **nie powstaje**. Osiągalny z każdego z pozostałych stanów. | Brak ID pomiarowego — na zaufaniu (fingerprint wciąż technicznie możliwy). | Sprostowanie / opt-out |
| 1 | **Ślad ulotny** (przed zgodą) | Krótkoterminowy identyfikator **dobowy** w first-party cookie (lub po stronie serwera). Reset codziennie. | Pseudonimowy, ulotny. | § 25 ust. 2 nr 2 TDDDG — funkcja usługi (weryfikacja dostarczenia) |
| 2 | **Rozpoznane urządzenie** (po zgodzie) | Pełna analityka: trwałe first-party cookie. Wciąż nie znamy właściciela urządzenia. | Pseudonimowy, trwały. | Zgoda (§ 25 ust. 1) |
| 3 | **Powiązana tożsamość** (po zalogowaniu) | E-mail/telefon łączy wcześniejszą aktywność z osobą. Możliwe łączenie między urządzeniami (hash z saltem). | Dane identyfikujące. | Zgoda + uwierzytelnienie |

**Kluczowe:** żaden stan nie jest w pełni anonimowy. „Unmeasured” to **nie kolejny szczebel drabiny**, lecz **podłoga**, na którą schodzi się z dowolnego z trzech stanów.

---

## 2. Orb — „presence orb” (anatomia + stany)

Ikona zastępuje sylwetkę użytkownika **kulą obecności**: pierścień przestrzeni osobistej owinięty wokół generatywnego awatara.

- **Pierścień** = strefa kontroli odwiedzającego.
- **Rdzeń (awatar)** = tożsamość generowana proceduralnie z seeda cookie (miękkie, nakładające się koła w palecie HSL — istniejący `AuraAvatar` w `account.jsx`).
- **Poświata (aura-breathe)** = subtelna, „oddychająca” aura w kolorze tożsamości pod orbem.

Pierścień **domyka się** wraz ze wzrostem rozpoznawalności, a w stanie *Unmeasured* **wygasza się** całkowicie:

| Stan | Pierścień | Rdzeń | Poświata |
|---|---|---|---|
| **01 Ślad ulotny** | rzadko przerywany, powoli się obraca | awatar (reset dobowy) | delikatna |
| **02 Rozpoznane urządzenie** | gęstsze kreski | awatar trwały | delikatna |
| **03 Powiązana tożsamość** | ciągła obręcz + zielona kropka weryfikacji | awatar nazwany | delikatna |
| **00 Unmeasured** | jeden cienki, wyblakły obrys (wygaszony) | pusty środek (kropka/obrys, brak awatara) | **wyłączona** |

> Istniejący kod referencyjny: `AuraAvatar`, `AuraMark`, `auraIdentity`, `rng` w `account.jsx` (`react-design/`). Logikę awatara i seeda przenosimy do `vanilla-design/js/aura.js`. Brak seeda (Unmeasured) ⇒ brak awatara — to spójne z modelem.

---

## 3. Panel obecności (kliknięcie orba)

Panel steruje doświadczeniem **przed** kontem i po zalogowaniu. Zawartość:

### 3.1 Presety jednym tapnięciem (nazwy w klimacie tatrarunning.pl)

Trzy presety z oryginalnego wzorca (Smooth ride / Balanced / Sanctuary) **przemianowane** na język górsko-biegowy marki. Preset ustawia od razu wszystkie przełączniki integracji (sekcja 3.3); nie dotyka warstwy pomiaru/zgód poza tym, co integracje obejmują.

| Preset (UI) | Odpowiednik wzorca | Zachowanie | Podtytuł |
|---|---|---|---|
| **Na lekko** | Smooth ride | wszystko włączone (maks. wygoda) | „Wszystko włączone” |
| **Szlakiem** | Balanced | rozsądna wartość domyślna (włączona od startu) | „Wyważony, domyślny” |
| **Schronisko** | Sanctuary | nic ekstra (pełna prywatność) | „Nic ekstra” |

> *Na lekko* nawiązuje do filozofii obozów TR („bieganie i trekking na lekko”). *Szlakiem* = bezpieczna, domyślna trasa. *Schronisko* = górskie sanktuarium (odpowiednik „Sanctuary”). Nazwy do ewentualnego dostrojenia z klientem.

### 3.2 Nagłówek tożsamości — awatar, nick, tag `#XXXX`, status zależny od stanu:
- *Ephemeral trace · session ID only*
- *Recognised device · persistent first-party cookie*
- *Linked identity · synced to your account*
- *Unmeasured · no measurement ID, on trust* (bez nicka i tagu, przycisk losowania ukryty)

Przycisk losowania nowej tożsamości — widoczny tylko gdy niepowiązana i mierzona.

**Wskaźnik zaufania** — pasek „X z 4 wstrzymanych”: ile zewnętrznych integracji jest aktualnie wstrzymanych.

### 3.3 Przełączniki per-integracja

**Przełączniki per-integracja** — każdy z opcją „prywatną” (ikona tarczy) i „wygodną”. **To te same kontrolki, które bramkuje Klaro** (sekcja 5), i które ustawiają presety (sekcja 3.1):

| Integracja | Prywatnie | Wygodnie |
|---|---|---|
| Numery telefonu | Dialer systemowy (`tel:`) | WhatsApp (`wa.me`) |
| Filmy YouTube | Miniatura (nic z YT) | Odtwarzanie na miejscu |
| Mapy | Statyczny obraz / link (bez referrera) | Osadzona mapa OpenStreetMap (Leaflet) |
| Formularze kontaktowe | Lekki fallback (bez zewn. JS) | Pełny formularz (Gravity Forms) |

> **Mapy = OpenStreetMap/Leaflet** (hostowany lokalnie), nie Google Maps — zob. dok. integracji §5.3.

**Stopka — drabina identyfikacji** (akcja zależna od stanu, o jeden szczebel dalej):
- *ephemeral* → **„Pozwól tej stronie mnie pamiętać”** (zgoda → trwałe cookie, wciąż bez imienia)
- *recognised* → **„Przejmij tę tożsamość”** (→ konto)
- *linked* → **„Wyloguj — zostań rozpoznanym urządzeniem”** (znika tylko imię)
- *Unmeasured* → **„Włącz pomiar z powrotem”** (→ ślad ulotny)

**Opt-out prostopadły do drabiny** — cichy, trwały link na dole panelu, widoczny w stanach 1–3: **„Wyłącz pomiar całkowicie →”** (zejście na podłogę *Unmeasured*). Realizacja prawa do **sprostowania** założenia, że użytkownik zażądał usługi wraz z pomiarem.

Ustawienia przenoszą się przez wszystkie stany: *rozpoznany dziś, Ty jutro.*

---

## 4. Architektura analityki (GA4 + sGTM + dobowe cookie)

### 4.1 Dwie instancje GA4

| Instancja | Kiedy zbiera | Powiązany stan Aury | Identyfikator |
|---|---|---|---|
| **GA4 #1 — sandbox** | **Przed zgodą** (ślad ulotny) | Stan 1 | **dobowe first-party cookie** (reset co 24 h) |
| **GA4 #2 — produkcyjna** | **Po zgodzie** | Stany 2–3 | trwałe first-party cookie |

- Obie instancje karmione przez **server-side GTM (sGTM)** — kontener serwerowy pośredniczy między stroną a GA4 (kontrola payloadu, brak bezpośrednich hitów do Google z przeglądarki przed zgodą).
- **GA4 #1 (sandbox)** to instancja przedzgodowa — odizolowana, służy wyłącznie weryfikacji dostarczenia i poprawności usługi (sekcja 4.3). Nazwana „sandbox”, bo dane przedzgodowe trzymamy osobno od produkcyjnych.
- **GA4 #2** uruchamiana **dopiero po zgodzie** (sygnał z Klaro, sekcja 5).

### 4.2 Dobowe first-party cookie (ślad ulotny)

- Identyfikator **dobowy/sesyjny** stawiany **przed zgodą**, w first-party cookie (alternatywnie hash po stronie sGTM z IP + user-agent).
- **Reset każdego dnia** — twarz i nick Aury resetują się dobowo (stan 1).
- Cel **wąsko zakreślony**: weryfikacja, czy żądana usługa została dostarczona i poprawnie (nie usprawnianie, nie personalizacja).

### 4.3 Twarde ograniczenia pomiaru przedzgodowego (do egzekwowania)

1. **Minimalizacja** — pomiar obserwuje **jak usługa jest używana**, nie **samego użytkownika**. Poziom usługi, nie osoby.
2. **Tylko ten cel** — wyłącznie weryfikacja dostarczenia i poprawności. Gdy dane zaczynają służyć optymalizacji reklam / profilowaniu / personalizacji — **wychodzimy z wyjątku i wracamy do zgody**.
3. **Brak aktywnego fingerprintingu** — żadnego odczytu cech urządzenia przez JS (np. rozdzielczości) do budowy fingerprinta.
4. **Najłagodniejszy środek** — alternatywy uczciwie przeanalizowane.

> Podstawa: § 25 ust. 2 nr 2 TDDDG (implementacja art. 5 ust. 3 ePrivacy), wsparta stanowiskiem **DSK** (OH Digitale Dienste, wersja 1.2, 20.11.2024). OH to wytyczna interpretacyjna — nie porada prawna; każde wdrożenie wymaga oceny indywidualnej.

### 4.4 Opt-out (Unmeasured)

- Zejście do stanu 0 z dowolnego stanu ⇒ **identyfikator nie powstaje** (dobowe cookie nie jest stawiane / hash nie jest tworzony).
- To realizacja **sprostowania**: użytkownik koryguje założenie, że pomiar mieścił się w zakresie żądanej usługi.

---

## 5. Klaro — zgody i bramkowanie

**Klaro JS** jest jedynym menedżerem zgód. Mapowanie na stany i integracje:

### 5.1 Usługi (services) w `klaro.config.js`

| Service Klaro | Co kontroluje | Stan / warstwa |
|---|---|---|
| `ga4-essential` | GA4 #1 sandbox (ślad ulotny) | **przedzgodowe** — włączone od startu jako „funkcja usługi”, ale **z możliwością opt-out** w panelu Aury (→ Unmeasured) |
| `ga4-analytics` | GA4 #2 produkcyjna | po zgodzie (stan 2) |
| `youtube` | embed YouTube | po zgodzie (panel: prywatnie/wygodnie) |
| `osm` | osadzona mapa OpenStreetMap | po zgodzie (panel: statyka/interaktywna) |
| `gravity-forms` | pełny formularz | po zgodzie (panel: fallback/pełny) |

> **Zasada „brak required”:** żadna usługa nie jest twardo wymagana. `ga4-essential` startuje włączone (pomiar to funkcja żądanej usługi), ale **zawsze da się wyłączyć** w panelu Aury (link „Wyłącz pomiar całkowicie” → Unmeasured). Błędem banerów ciastkowych jest traktowanie „technicznie niezbędne” jako „nie do wyłączenia”; tu wola użytkownika może wyłączyć każdą usługę. Stan Unmeasured zapisujemy we własnej fladze, którą respektuje sGTM.

### 5.2 Bramkowanie embedów

- Embedy (YouTube, mapa OSM, pełny formularz) **nie ładują się** bez zgody — placeholder z przyciskiem „Załaduj”.
- Przyciski w panelu Aury są **jedyną widoczną kontrolką** (własny modal Klaro schowany) — jedno źródło prawdy: stan zgód Klaro + preferencje Aury.
- Embedy mają wariant **prywatny** (miniatura YT, statyczny obraz/link mapy, lekki fallback formularza) działający bez zgody.

### 5.3 Google Consent Mode v2

- Tor przedzgodowy (ślad ulotny): `analytics_storage = denied` — GA4 #1 pracuje bez identyfikatorów ciasteczkowych.
- Po zgodzie (`ga4-analytics` true): `analytics_storage = granted`, trwałe first-party cookie i stabilny `client_id`.
- CMv2 spina się z sygnałami Klaro; szczegóły deduplikacji torów — dok. integracji §3.

### 5.3 Synchronizacja Aura ↔ Klaro

- Przełączniki integracji w panelu Aury **zapisują/odczytują** stan przez API Klaro (`klaro.getManager()`), aby panel i baner pokazywały spójny stan.
- Zmiana w panelu Aury = zmiana zgody w Klaro (i odwrotnie).

---

## 6. Zasady językowe (do egzekwowania)

1. **Nigdy** nie używać słowa „anonimowy” / „anonymous” wobec gościa ani analityki.
2. „Pseudonimowy” zostaje w warstwie spec/prawnej — **nie** jako etykieta dla zwykłego użytkownika.
3. W UI opisywać **co potrafimy, a czego nie** (rozpoznać urządzenie ≠ poznać osobę), nie wieszać kategorii prawnej.
4. Każdej etykiecie UI odpowiada jedna etykieta prawna (mapowanie 1:1).
5. *Unmeasured* jest **najbliżej anonimowości**, ale i jego **nie** nazywamy „anonimowym” — opiera się na zaufaniu (hash *nie musi* powstać), nie na technicznej niemożliwości.

**Jednozdaniowe prawdy w UI:**
- Unmeasured: „Nic tu nie mierzymy — na zaufanie.”
- Ślad ulotny: „Widzimy, że ktoś tu jest. Jutro licznik rusza od zera.”
- Rozpoznane urządzenie: „Pamiętamy to urządzenie między wizytami. Wciąż nie wiemy, kto nim steruje.”
- Powiązana tożsamość: „Połączyłeś tę obecność ze swoimi danymi.”

---

## 7. Mapowanie na projekt / WordPress

| Element Aury | Vanilla (`vanilla-design/`) | WordPress |
|---|---|---|
| Orb + awatar (seed → SVG) | `js/aura.js` (z `account.jsx`) | `aura.js` w motywie; seed w first-party cookie |
| Panel obecności | partial + `js/aura.js` | komponent motywu; **nie cacheować** (ESI) |
| Stan konta / linked identity | makieta | WooCommerce My Account (stan 3) |
| Zgody + embedy | `js/klaro.config.js`, `js/embeds.js` | Klaro JS w motywie |
| Pomiar przedzgodowy | sGTM snippet + dobowe cookie | sGTM (kontener serwerowy) + GA4 #1 sandbox |
| Pomiar po zgodzie | trigger z Klaro | GA4 #2 produkcyjna |

**Treści NIE-cacheowalne (LiteSpeed ESI):** orb i panel (stan zależny od cookie/seeda), wskaźnik „X z 4 wstrzymanych”, stan konta. Tożsamość AURA jest per-przeglądarka.

---

## 8. Zadania wdrożeniowe (dla agenta)

1. **`js/aura.js`** — port `rng`, `auraIdentity`, `AuraAvatar`, `AuraMark` do vanilla; obsługa 4 stanów; seed w first-party cookie (dobowy dla stanu 1, trwały dla 2–3); brak seeda ⇒ Unmeasured.
2. **Orb w headerze** — render orba z poświatą; klik → panel.
3. **Panel obecności** (partial + JS) — nagłówek tożsamości, wskaźnik zaufania, presety *Na lekko / Szlakiem / Schronisko*, 4 przełączniki integracji, stopka drabiny + link opt-out.
4. **`js/klaro.config.js`** — usługi: `ga4-essential` (ON, z opt-out), `ga4-analytics`, `youtube`, `osm`, `gravity-forms`; teksty PL; brak required; panel Aury jako jedyna widoczna kontrolka.
5. **`js/embeds.js`** — bramkowanie embedów (placeholder + „Załaduj”), warianty prywatne (miniatura YT, statyczny obraz/link mapy OSM, fallback formularza).
6. **Analityka** — snippet sGTM; logika dobowego cookie (stan 1, reset 24 h); trigger GA4 #2 po zgodzie z Klaro; respektowanie Unmeasured (brak ID).
7. **Synchronizacja Aura ↔ Klaro** — wspólne źródło prawdy stanu zgód/preferencji.
8. **Język** — przejrzeć wszystkie etykiety pod kątem zasad z sekcji 6.

---

## 9. Rozstrzygnięcia (faza 4.0 — ujednolicone)

1. **`ga4-essential`** modelowany w Klaro/panelu Aury jako usługa **włączona od startu z opt-outem** — nigdy „required”. Opt-out przedzgodowy obsługuje panel Aury (link „Wyłącz pomiar całkowicie” → Unmeasured), Klaro zarządza także stanami 2–3 + embedami.
2. **Identyfikator śladu ulotnego** — **dobowe first-party cookie** (reset 24 h). Brak narzędzia na server-side hash IP+UA na tym etapie; cookie jest prostsze, transparentne, łatwy opt-out.
3. **Łączenie między urządzeniami (stan 3)** — hash z solą, wyłącznie first-party.
4. **Salt i sGTM** — salt i konfiguracja kontenera serwerowego po stronie WP (dok. integracji §8).
5. **Mapy** = OpenStreetMap/Leaflet (lokalnie), nie Google. **Integracje** = telefon/WhatsApp, YouTube, mapy OSM, formularze Gravity (4).

---

## 10. Źródła

- DSK — *Orientierungshilfe für Anbieter von digitalen Diensten* (OH Digitale Dienste), wersja 1.2, 20.11.2024.
- § 25 TDDDG (dawniej § 25 TTDSG) — implementacja art. 5 ust. 3 dyrektywy ePrivacy 2002/58/WE.
- RODO: art. 4 pkt 5 (pseudonimizacja), motyw 26 (singling out).
- Wzorzec: aurapattern.eu · demo: northwind.eu.
