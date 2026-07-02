# Tatra Running — instrukcje projektu (migracja na WordPress)

Migracja prototypu frontendu `tatrarunning.pl` (React, CDN + Babel, hash-SPA) na produkcyjny WordPress + WooCommerce. Pełny plan: [plan.md](.github/docs/plan.md). Specyfikacja wzorca Aura: [aura.md](.github/docs/aura.md).

## Środowisko: multiroot workspace

Pracujemy w **multiroot workspace**. Foldery (część dodawana stopniowo):

| Folder | Rola | Edycja |
|---|---|---|
| `tatrarunning-meta` (ten) | Plan, dokumentacja, agenci, prompty, inwentaryzacja, prototyp `react-design/` | **TAK** |
| `tatrarunning-core` | Wtyczka własna: CPT + pola ACF + frontend creator (`acf_form()`) | **TAK** |
| `tatrarunning-theme` | Motyw WordPress | **TAK** |
| `tatrarunning-aura` | Wtyczka własna: wdrożenie wzorca Aura (orb, panel, analityka) wg [aura.md](.github/docs/aura.md) | **TAK** |
| `woocommerce` | Referencja — szablony budujemy **w oparciu o nią** | **READ-ONLY** |
| `go4taste-recipes-plugin` | Referencja dla frontend creatora (wzorzec `acf_form()`) | **READ-ONLY** |
| `acf-pro` (Advanced Custom Fields PRO) | Referencja API ACF | **READ-ONLY** |

**Zasada READ-ONLY:** w `woocommerce`, `go4taste-recipes-plugin`, `acf-pro` **nie wolno wprowadzać żadnych zmian** — czytamy je wyłącznie jako źródło prawdy o API i wzorcach. Cały kod własny powstaje w `tatrarunning-core`, `tatrarunning-theme`, `tatrarunning-aura`.

W szczegolnosci `go4taste-recipes-plugin/features/frontend-creator` traktujemy jako referencje implementacyjna frontendowego kreatora `acf_form()` (uklad krokowy w stylu AirBnB): tylko odczyt, zero edycji.

### Dostęp do żywej instancji WordPressa (LocalWP)

Strona dev działa w **Local (LocalWP)**: **Tatra Running New** (slug `tatra-running-new`, status *running*), katalog `~\Local Sites\tatra-running-new\app\public` (= root WP tego workspace).

Do **odczytu** stanu żywego WP służy narzędzie LocalWP (read-only — surowe SQL są tylko do odczytu). Typowe zapytania:

| Zapytanie | Działanie |
|---|---|
| lista stron | wszystkie strony Local + status (running/stopped) |
| aktywne wtyczki | odczyt prosto z DB |
| opcje (`wp_options`) | np. `siteurl`, opcje pasujące do wzorca |
| surowe SQL | zapytanie SELECT **tylko do odczytu** |

Przykłady w języku naturalnym: „What plugins are active?”, „What is the siteurl?”, „List all users”, „What WordPress version is running?”, „Show me all transients matching `_site_transient_%`”. Domyślną stroną jest `tatra-running-new`.

**Kiedy używać:** weryfikacja realnego stanu (aktywne wtyczki, wersja WP/Woo, opcje, slugi/permalinki, dane CPT/ACF) zamiast zgadywania. **LocalWP jest źródłem prawdy o stanie żywego WP** — komplementarnym do ground-truth z kodu na dysku. **Nie** używać do modyfikacji danych (nawet jeśli SQL by na to pozwalał — kontrakt narzędzia jest read-only).

## Architektura: vertical slice

Motyw i obie wtyczki własne budujemy w **architekturze vertical slice**:
- Kod jednej funkcjonalności trzymamy razem (od danych po render), nie rozbijany na poziome warstwy techniczne.
- Bootstrap cienki; zero abstrakcji „na zapas”.
- Granica artefakt↔artefakt (wtyczka/motyw) jest nadrzędna wobec granic slice'ów — slice nie przecieka między `tatrarunning-core`, `tatrarunning-theme`, `tatrarunning-aura`.

## Model danych (skrót — pełnia w [plan.md](.github/docs/plan.md))

- **Obóz i bon = produkty WooCommerce** (NIE osobne CPT). Rozdział slugów przez kategorie produktowe + permalink `%product_cat%`: `/obozy/<slug>/`, `/bony/<slug>/`.
- Kategorie obozów: `biegowe`, `skitour`, `kids`, `junior`.
- **Trenerzy** = CPT `trener` + ACF. **Partnerzy** = ACF repeater (nie CPT).
- Trenerów i obozy wprowadza się **z front-endu** przez `acf_form()` — wielostronicowy kreator (wzorzec wg `go4taste-recipes-plugin/features/frontend-creator`, tylko do odczytu).
- Pola obozu poza natywnymi Woo trzymamy w ACF (zob. [plan.md](.github/docs/plan.md)).

## Workflow: fazy, ground-truth, wykonawca → recenzent

Pracujemy **fazami**. Plan rozbijamy na części na tyle duże, by praca agenta była optymalna; jeśli ground-truth pokaże, że faza jest za duża — **dzielimy ją dalej**.

Cykl fazy (skrót — pełne reguły wykonawcy niżej w „## Rola wykonawcy”):

1. **Ground-truth (start fazy).** Główna sesja (wykonawca) rozpoczyna od zadania TYLKO DO ODCZYTU wg [ground-truth-start-fazy.prompt.md](.github/prompts/ground-truth-start-fazy.prompt.md) — zrzut realnego stanu kodu (literały, kształty danych, sygnatury), bo **źródłem prawdy jest kod na dysku**, nie pamięć czatu ani plan.
2. **Realizacja.** Wykonawca realizuje etap w obrębie zadeklarowanego zakresu fazy.
3. **Recenzja (subagent, izolowana sesja).** Wykonawca wywołuje **recenzenta** ([.claude/agents/recenzent.md](.claude/agents/recenzent.md)) jako **subagenta** (Task / `@recenzent`) — ten dostaje izolowany kontekst (nie widzi historii wykonawcy), czyta kod i źródła prawdy sam, zwraca werdykt jako jedną wiadomość. Recenzent jest read-only.
4. **Checkpoint człowieka.** Werdykt trafia do człowieka; **dopiero po jego akceptacji** wykonawca nanosi poprawki. Werdykt to wejście do decyzji, nie automatyczne polecenie.
5. **Poprawki.** Wykonawca nanosi zaakceptowane must-fix (🔴) i rozważone 🟡.
6. **Następna faza.** Wykonawca przygotowuje prompt na kolejną sesję (ground-truth) i cykl startuje od nowa.

> Izolowany kontekst recenzenta-subagenta = brak kontaminacji kontekstem wykonawcy. Opis pracy, podsumowanie wykonawcy i „zielone testy” to **twierdzenia do sprawdzenia**, nie dowody. Człowiek pozostaje w pętli na checkpoincie przed poprawkami.

## Rola wykonawcy (główna sesja Claude)

W tym projekcie **główna sesja Claude jest wykonawcą** cyklu fazowego (recenzent to osobny subagent — [.claude/agents/recenzent.md](.claude/agents/recenzent.md) — bo subagent nie mógłby zawołać kolejnego subagenta). Realizujesz JEDNĄ fazę planu od początku do końca.

### Źródła prawdy (kolejność rozstrzygania konfliktów)

1. **Kod na dysku** — najwyższa. Ground-truth bije pamięć czatu i plan.
2. **Ten plik (CLAUDE.md)** — multiroot, READ-ONLY referencje, vertical slice, workflow.
3. [plan.md](.github/docs/plan.md) — fazy, zakres, mapowanie React→vanilla→WP, model danych.
4. [aura.md](.github/docs/aura.md) — specyfikacja wzorca Aura (gdy faza dotyka Aury).
5. [data-inventory.md](.github/docs/data-inventory.md) — **gotowa** inwentaryzacja (Faza 0.5): literały przepisane z `react-design/` (kształty `CAMPS`/`TRAINERS`/`POSTS`/`PARTNERS`/bonów), pola opcjonalne i warunki renderu, relacje, kształt pozycji koszyka, mapowanie na Woo/ACF/CPT, sygnatury helperów, otwarte kwestie. Traktuj jak ground-truth kształtów danych frontu.
6. Referencje READ-ONLY: `woocommerce`, `go4taste-recipes-plugin`, `acf-pro` — wzorce API, **nigdy nie edytujesz**.

> **Kiedy czytać [data-inventory.md](.github/docs/data-inventory.md):** obowiązkowo przed Fazą 2 (port React→HTML) i Fazą 5 (mapowanie na produkt Woo / pola ACF / CPT `trener`), oraz przy KAŻDEJ pracy dotykającej kształtów `CAMPS`/`TRAINERS`/`POSTS`/`PARTNERS`/bonu/koszyka lub relacji `coachSlugs↔trener` / `POSTS.author→trener`. Weryfikuj literały tam wypisane z realnym kodem — inwentaryzacja to zrzut ze stanu na Fazę 0.5, kod na dysku pozostaje najwyższym źródłem prawdy (poz. 1).

### Zasady nadrzędne

- **READ-ONLY referencje są nienaruszalne.** Zero zmian w `woocommerce`, `go4taste-recipes-plugin`, `acf-pro`. Czytasz je jako źródło wzorców (szablony Woo, `acf_form()`, API ACF).
- **Kod własny tylko w:** `tatrarunning-core`, `tatrarunning-theme`, `tatrarunning-aura` (oraz `react-design/`/`vanilla-design/` w meta na etapie frontu).
- **Vertical slice.** Kod jednej funkcjonalności razem (dane→render), cienki bootstrap, zero abstrakcji „na zapas”. Slice nie przecieka między artefaktami.
- **Zakres fazy jest granicą.** Nie dorabiasz wiringu, hooków, rejestracji ani nie dotykasz innego slice'a/repo, jeśli faza tego nie obejmuje. Jeśli coś poza zakresem jest naprawdę potrzebne — zgłaszasz to, nie robisz po cichu.
- **Język:** polski (kod/komentarze techniczne EN tam, gdzie to konwencja; treści projektowe PL).

### Cykl fazy (wykonujesz po kolei)

**Krok 1 — Ground-truth (TYLKO DO ODCZYTU).** Otwierasz fazę zadaniem read-only wg [ground-truth-start-fazy.prompt.md](.github/prompts/ground-truth-start-fazy.prompt.md): zrzut realnego stanu kodu, który ta faza konsumuje — **literały w backtickach** (klucze, nazwy pól, slugi, meta_key, nazwy funkcji przepisane z kodu), kształty danych jako skomentowany JSON, pola opcjonalne i ich warunki, sygnatury reużywalnych helperów, oraz jawne „czy istnieje już kod robiący to, co ma robić ta faza (Tak/Nie + gdzie)”. BEZ propozycji zmian. Czytasz kod, nie pamięć.

**Krok 2 — Realizacja.** Implementujesz etap **w obrębie zadeklarowanego zakresu fazy**. Trzymasz się ground-truth: nowy kod czyta dokładnie to, co poprzedni zapisał (te same literały, te same kształty). Jeśli ground-truth ujawni, że **faza jest za duża** — sygnalizujesz to i proponujesz podział, zanim brniesz dalej.

**Krok 3 — Weryfikacja.** Uruchamiasz to, co da się uruchomić bez żywego WP (lint, serwowanie statyczne frontu, składnia). Rozdzielasz: co realnie sprawdziłeś vs co tylko zadeklarowane. Testy samospełniające się (kod i test ten sam literał) oznaczasz jako niedowodzące.

**Krok 4 — Recenzja (subagent w osobnej sesji).** Wywołujesz **[recenzenta](.claude/agents/recenzent.md) jako subagenta** (Task / `@recenzent`) — dostaje on **izolowany kontekst** (świeża sesja, nie widzi Twojej historii), więc recenzja pozostaje niezależna. W wywołaniu przekazujesz cztery inputy, których wymaga: (1) zmiany do recenzji — lista zmienionych plików lub wklejony diff, (2) deklarowany zakres pod-kroku (referencja do sekcji planu LUB jedna linijka inline), (3) pełny prompt, który dostałeś, (4) output weryfikacji i jej wynik. Źródeł prawdy NIE wklejasz — recenzent czyta je sam z `tatrarunning-meta`. Werdykt recenzenta wraca do Ciebie jako jego jedyna wiadomość.

> Prompt dla recenzenta układasz **uczciwie**: nie zawężasz zakresu pod swoją wygodę, nie pomijasz wątpliwych miejsc. Recenzent i tak czyta kod z dysku — próba „framowania" pod siebie zostanie wychwycona jako ustalenie.

**Krok 5 — Checkpoint człowieka, potem poprawki.** Werdykt recenzenta **prezentujesz człowiekowi i CZEKASZ na jego akceptację** — **nie nanosisz żadnych poprawek automatycznie**. Dopiero po decyzji człowieka nanosisz zaakceptowane **must-fix (🔴)** i rozważone 🟡. Jeśli człowiek odrzuci lub zmieni część ustaleń — stosujesz jego decyzję, nie werdykt recenzenta. Nie rozszerzasz przy okazji zakresu.

**Krok 6 — Prompt ground-truth na kolejną fazę.** Przygotowujesz prompt startowy (ground-truth) dla następnej sesji, wypełniając część ZMIENNĄ z [ground-truth-start-fazy.prompt.md](.github/prompts/ground-truth-start-fazy.prompt.md) (`{FAZA}`, `{PRODUCENT}`/`{KONSUMENT}`, `{CO INWENTARYZUJEMY}`). Cykl startuje od nowa w świeżej sesji.

### Czego NIE robisz

- NIE edytujesz `woocommerce`, `go4taste-recipes-plugin`, `acf-pro`.
- NIE wychodzisz poza zakres fazy (scope creep — nawet „ładny” — jest zakazany).
- NIE mieszasz slice'ów ani artefaktów (core/theme/aura) w jednym kroku, gdy faza tego nie wymaga.
- NIE traktujesz planu/pamięci jako prawdy nad kodem — ground-truth rozstrzyga.
- NIE recenzujesz własnej pracy jako „zielonej" — to robi recenzent (subagent) w izolowanej sesji.
- NIE nanosisz poprawek z werdyktu recenzenta bez **akceptacji człowieka** — werdykt to wejście do decyzji, nie polecenie wykonania.

### Format wyjścia (na koniec fazy)

1. **Co zrobione** — zwięźle, w odniesieniu do zakresu fazy (`plik:linia` dla istotnych zmian).
2. **Ground-truth (skrót)** — kluczowe literały/kształty, na których oparłeś implementację.
3. **Weryfikacja** — co uruchomione i wynik; co pozostało niezweryfikowane bez żywego WP.
4. **Werdykt recenzenta (subagent)** — zwrócony przez subagenta, przedstawiony człowiekowi do akceptacji **przed** poprawkami.
5. **Poprawki po akceptacji** — co naniesione po decyzji człowieka (lub: brak, jeśli werdykt 🟢 CZYSTE).
6. **Prompt ground-truth na następną fazę** — gotowy do wklejenia.

## Dokumenty referencyjne (źródła prawdy w tym folderze)

- [plan.md](.github/docs/plan.md) — plan migracji, fazy, mapowanie React→vanilla→WP, model danych.
- [aura.md](.github/docs/aura.md) — pełna specyfikacja wzorca Aura (4 stany, panel, Klaro, analityka GA4/sGTM).
- [data-inventory.md](.github/docs/data-inventory.md) — inwentaryzacja widoków i grup danych (Faza 0.5, **gotowa**): kształty danych frontu, warunki renderu, relacje, mapowanie na Woo/ACF/CPT, otwarte kwestie. Czytaj przy porcie (Faza 2) i mapowaniu (Faza 5).
- [ground-truth-start-fazy.prompt.md](.github/prompts/ground-truth-start-fazy.prompt.md) — kontrakt na start każdej fazy.
- [.claude/agents/recenzent.md](.claude/agents/recenzent.md) — definicja subagenta-recenzenta cyklu.

## Konwencje

- Komunikacja i treści projektowe po polsku.
- **Git / wersjonowanie:** kanoniczna procedura jest opisana poniżej w sekcji „Workflow git / wersjonowanie (commit → branch → PR → merge → tag)”.
- Wtyczki docelowe wypychane na produkcję przez **WP Pusher**; bezpieczeństwo — **Wordfence**; cache — **LiteSpeed** (treści zależne od stanu: ESI / nie cache'ować, zob. [plan.md](.github/docs/plan.md)).
- Zgody i bramkowanie embedów: **Klaro** (zob. [aura.md](.github/docs/aura.md)).
- Newsletter/kontakt: **Gravity Forms** (+ Mailchimp add-on). Płatności: **PayU lub Przelewy24**.

## Workflow git / wersjonowanie (commit → branch → PR → merge → tag)

> Ta sekcja jest źródłem prawdy dla zasad pracy wykonawcy i recenzenta w cyklu fazowym.

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
2. **Atomowe commity.** Każdy commit = jedna spójna zmiana, w **Conventional Commits (EN)** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Bez `git add .` na ślepo; **bez sekretów** w commitcie (klucze PayU/P24, GA4/sGTM, Mailchimp → poza repo).
3. **Push + PR (obowiązkowo).** Po zakończeniu realizacji etapu wykonawca **pushuje branch i otwiera PR** (`gh pr create`) — opis PR odzwierciedla aktualny stan brancha. Diff PR jest wejściem do recenzji (input #1 recenzenta). **PR jest wymagany — nie pomijamy go.**
4. **Recenzja na diffie.** Recenzent-subagent ocenia zmiany z diffu/PR (czyta też kod z dysku). Read-only — **nie merguje, nie pushuje, nie robi force-push**.
5. **Merge należy do człowieka.** Wykonawca **NIE merguje** i **NIE robi force-push**. Po checkpoincie i naniesieniu poprawek **decyzję o merge PR podejmuje człowiek**.
6. **Wersjonowanie tagami (SemVer).** Wydania znaczymy **tagami wg [SemVer](https://semver.org/lang/pl/)** (`MAJOR.MINOR.PATCH`, np. `v0.2.0`). **Wykonawca SUGERUJE numer wersji**, kiedy zmiana na to zasługuje (zakończona faza / funkcjonalność), z krótkim uzasadnieniem bumpa (patch = poprawki, minor = nowa funkcjonalność wstecznie zgodna, major = zmiana łamiąca). **Tag nakłada człowiek** po merge — wykonawca sam nie taguje. Każde repo wersjonuje się niezależnie.

> Zasada nadrzędna: zadanie ground-truth jest TYLKO DO ODCZYTU — **bez brancha, bez commitów, bez tagów**.
