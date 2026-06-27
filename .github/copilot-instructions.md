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
- **Git / wersjonowanie** (pełna procedura + linki do repo: [plan.md](./docs/plan.md) → „Workflow git"): **wszystkie cztery repozytoria** (`tatrarunning-core`/`-theme`/`-aura` **oraz `tatra-running-meta`**) są pod git/PR. **GitHub CLI (`gh`) jest zainstalowane.** Na **każdą fazę** wykonawca tworzy **branch**, robi **atomowe commity** (Conventional Commits, EN, bez sekretów) i **obowiązkowo otwiera PR** (`gh pr create`) — recenzja idzie na diffie PR. **Wykonawca NIE merguje i NIE robi force-push; decyzję o merge podejmuje człowiek.** Wydania znaczymy **tagami wg SemVer** — **wykonawca sugeruje numer wersji** (z uzasadnieniem bumpa), **tag nakłada człowiek** po merge. Ground-truth jest TYLKO DO ODCZYTU (bez brancha/commitów/tagów).
- Wtyczki docelowe wypychane na produkcję przez **WP Pusher**; bezpieczeństwo — **Wordfence**; cache — **LiteSpeed** (treści zależne od stanu: ESI / nie cache'ować, zob. [plan.md](./docs/plan.md)).
- Zgody i bramkowanie embedów: **Klaro** (zob. [aura.md](./docs/aura.md)).
- Newsletter/kontakt: **Gravity Forms** (+ Mailchimp add-on). Płatności: **PayU lub Przelewy24**.
