# Tatra Running — instrukcje projektu (migracja na WordPress)

Migracja prototypu frontendu `tatrarunning.pl` (React, CDN + Babel, hash-SPA) na produkcyjny WordPress + WooCommerce. Pełny plan: [plan.md](./docs/plan.md). Specyfikacja wzorca Aura: [aura.md](./docs/aura.md).

## Środowisko: multiroot workspace

Pracujemy w **multiroot workspace**. Foldery (część dodawana stopniowo):

| Folder | Rola | Edycja |
|---|---|---|
| `tatrarunning-meta` (ten) | Plan, dokumentacja, agenci, prompty, inwentaryzacja, prototyp `react-design/` | **TAK** |
| `tatrarunning-core` | Wtyczka własna: CPT + pola ACF + frontend creator (`acf_form()`) | **TAK** |
| `tatrarunning-theme` | Motyw WordPress | **TAK** |
| `tatrarunning-aura` | Wtyczka własna: wdrożenie wzorca Aura (orb, panel, analityka) wg [aura.md](./docs/aura.md) | **TAK** |
| `woocommerce` | Referencja — szablony budujemy **w oparciu o nią** | **READ-ONLY** |
| `go4taste-recipes-plugin` | Referencja dla frontend creatora (wzorzec `acf_form()`) | **READ-ONLY** |
| `acf-pro` (Advanced Custom Fields PRO) | Referencja API ACF | **READ-ONLY** |

**Zasada READ-ONLY:** w `woocommerce`, `go4taste-recipes-plugin`, `acf-pro` **nie wolno wprowadzać żadnych zmian** — czytamy je wyłącznie jako źródło prawdy o API i wzorcach. Cały kod własny powstaje w `tatrarunning-core`, `tatrarunning-theme`, `tatrarunning-aura`.

### Dostęp do żywej instancji WordPressa (`@localwp`)

Strona dev działa w **Local (LocalWP)**: **Tatra Running New** (slug `tatra-running-new`, status *running*), katalog `~\Local Sites\tatra-running-new\app\public` (= root WP tego workspace).

Do **odczytu** stanu żywego WP służy narzędzie **`@localwp`** (read-only — surowe SQL są tylko do odczytu). Komendy slash:

| Komenda | Działanie |
|---|---|
| `@localwp /sites` | lista wszystkich stron Local + status (running/stopped) |
| `@localwp /plugins` | aktywne wtyczki (szybko — prosto z DB) |
| `@localwp /options siteurl` | opcje pasujące do wzorca (`wp_options`) |
| `@localwp /db SELECT ...` | surowe zapytanie SQL **tylko do odczytu** |

Działa też **język naturalny**, np. `@localwp What plugins are active?`, `@localwp What is the siteurl?`, `@localwp List all users`, `@localwp What WordPress version is running?`, `@localwp Show me all transients matching _site_transient_%`. Inną stronę wskazuje flaga `--site=`, np. `@localwp --site=tatra-running-new What theme is active?`.

**Kiedy używać:** weryfikacja realnego stanu (aktywne wtyczki, wersja WP/Woo, opcje, slugi/permalinki, dane CPT/ACF) zamiast zgadywania. **`@localwp` jest źródłem prawdy o stanie żywego WP** — komplementarnym do ground-truth z kodu na dysku. **Nie** używać do modyfikacji danych (nawet jeśli SQL by na to pozwalał — kontrakt narzędzia jest read-only).

## Architektura: vertical slice

Motyw i obie wtyczki własne budujemy w **architekturze vertical slice**:
- Kod jednej funkcjonalności trzymamy razem (od danych po render), nie rozbijany na poziome warstwy techniczne.
- Bootstrap cienki; zero abstrakcji „na zapas”.
- Granica artefakt↔artefakt (wtyczka/motyw) jest nadrzędna wobec granic slice'ów — slice nie przecieka między `tatrarunning-core`, `tatrarunning-theme`, `tatrarunning-aura`.

## Model danych (skrót — pełnia w [plan.md](./docs/plan.md))

- **Obóz i bon = produkty WooCommerce** (NIE osobne CPT). Rozdział slugów przez kategorie produktowe + permalink `%product_cat%`: `/obozy/<slug>/`, `/bony/<slug>/`.
- Kategorie obozów: `biegowe`, `skitour`, `kids`, `junior`.
- **Trenerzy** = CPT `trener` + ACF. **Partnerzy** = ACF repeater (nie CPT).
- Trenerów i obozy wprowadza się **z front-endu** przez `acf_form()` — wielostronicowy kreator (wzorzec wg `go4taste-recipes-plugin`).
- Pola obozu poza natywnymi Woo trzymamy w ACF (zob. [plan.md](./docs/plan.md)).

## Workflow: fazy, ground-truth, wykonawca → recenzent

Pracujemy **fazami**. Plan rozbijamy na części na tyle duże, by praca agenta była optymalna; jeśli ground-truth pokaże, że faza jest za duża — **dzielimy ją dalej**.

Każda faza to **nowa sesja** i cykl:

1. **Ground-truth (start fazy).** Agent **wykonawca** ([agents/wykonawca.agent.md](./agents/wykonawca.agent.md)) rozpoczyna od zadania TYLKO DO ODCZYTU wg [ground-truth-start-fazy.prompt.md](./prompts/ground-truth-start-fazy.prompt.md) — zrzut realnego stanu kodu (literały, kształty danych, sygnatury), bo **źródłem prawdy jest kod na dysku**, nie pamięć czatu ani plan.
2. **Realizacja.** Wykonawca realizuje etap w obrębie zadeklarowanego zakresu fazy.
3. **Recenzja (subagent, izolowana sesja).** Wykonawca wywołuje **recenzenta** ([agents/recenzent.agent.md](./agents/recenzent.agent.md)) jako **subagenta** — ten dostaje izolowany kontekst (nie widzi historii wykonawcy), czyta kod i źródła prawdy sam, zwraca werdykt jako jedną wiadomość. Recenzent jest read-only.
4. **Checkpoint człowieka.** Werdykt trafia do człowieka; **dopiero po jego akceptacji** wykonawca nanosi poprawki. Werdykt to wejście do decyzji, nie automatyczne polecenie.
5. **Poprawki.** Wykonawca nanosi zaakceptowane must-fix (🔴) i rozważone 🟡.
6. **Następna faza.** Wykonawca przygotowuje prompt na kolejną sesję (ground-truth) i cykl startuje od nowa.

> Izolowany kontekst recenzenta-subagenta = brak kontaminacji kontekstem wykonawcy. Opis pracy, podsumowanie wykonawcy i „zielone testy” to **twierdzenia do sprawdzenia**, nie dowody. Człowiek pozostaje w pętli na checkpoincie przed poprawkami.

## Dokumenty referencyjne (źródła prawdy w tym folderze)

- [plan.md](./docs/plan.md) — plan migracji, fazy, mapowanie React→vanilla→WP, model danych.
- [aura.md](./docs/aura.md) — pełna specyfikacja wzorca Aura (4 stany, panel, Klaro, analityka GA4/sGTM).
- `docs/data-inventory.md` — inwentaryzacja widoków i grup danych (powstaje w Fazie 0.5).
- [ground-truth-start-fazy.prompt.md](./prompts/ground-truth-start-fazy.prompt.md) — kontrakt na start każdej fazy.
- [agents/wykonawca.agent.md](./agents/wykonawca.agent.md), [agents/recenzent.agent.md](./agents/recenzent.agent.md) — definicje agentów cyklu.

## Konwencje

- Komunikacja i treści projektowe po polsku.
- **Git / wersjonowanie:** kanoniczna procedura jest opisana poniżej w sekcji „Workflow git / wersjonowanie (commit → branch → PR → merge → tag)”.
- Wtyczki docelowe wypychane na produkcję przez **WP Pusher**; bezpieczeństwo — **Wordfence**; cache — **LiteSpeed** (treści zależne od stanu: ESI / nie cache'ować, zob. [plan.md](./docs/plan.md)).
- Zgody i bramkowanie embedów: **Klaro** (zob. [aura.md](./docs/aura.md)).
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
