---
mode: agent
description: 'Faza 4 · podkrok 4.0 (pre-implementacja) — reconcyliacja dokumentów Aury: konfrontacja aura.md ↔ aura-integracja-wordpress-woocommerce.md i uzupełnienie luk przed implementacją.'
---

# Faza 4 · podkrok 4.0 — Reconcyliacja dokumentacji Aury

> **Faza:** 4 (Aura + Klaro + analityka).
> **Podkrok:** 4.0 — pre-implementacja: ujednolicenie źródeł prawdy. NIE implementujemy jeszcze kodu Aury.
> **Tryb:** read-only audyt + edycja dokumentów meta (`.github/docs/`). Bez kodu vanilla, bez Aury w przeglądarce.

Pracujesz w `tatra-running-meta`. Zadanie: skonfrontować dwa dokumenty źródłowe Aury i uzupełnić luki, tak by były spójne i nie zostawiały sprzeczności przed właściwą Fazą 4 (implementacja Aury w vanilla).

## Źródła prawdy (czytaj oba w całości)

- [.github/docs/aura.md](../docs/aura.md) — specyfikacja wzorca (4 stany, orb, panel, GA4 #1/#2 przez sGTM + dobowe cookie, Klaro).
- [.github/docs/aura-integracja-wordpress-woocommerce.md](../docs/aura-integracja-wordpress-woocommerce.md) — wdrożenie na WP+WooCommerce (server-side GA bezciasteczkowo, hash IP+UA+sól, presety EN, WhatsApp/YouTube/OSM).

## Krok 1 — Audyt (TYLKO DO ODCZYTU)

Wypisz rozbieżności jako tabelę: **temat · co mówi `aura.md` · co mówi dok. integracji · rekomendowane rozstrzygnięcie**. Zwróć szczególną uwagę na:

1. **Identyfikator śladu ulotnego** — `aura.md` rekomenduje dobowe first-party cookie; dok. WP mówi hash `IP+UA+sól` bez zapisu w urządzeniu. Sprzeczność — która wersja wiążąca?
2. **`ga4-ephemeral` w Klaro** — `aura.md` rozważa usługę „required”; dok. WP trzyma server-side GA poza Klaro. Ujednolić.
3. **Nazwy presetów** — `aura.md`: Na lekko/Szlakiem/Schronisko (PL); dok. WP: Smooth ride/Balanced/Sanctuary (EN). Ustalić jedną nomenklaturę.
4. **Liczba/nazwy integracji** — `aura.md`: telefon, YouTube, mapy, formularze (4); dok. WP: WhatsApp, YouTube, OSM (3, brak formularzy/Gravity). Pogodzić.
5. **Mapy** — Google Maps vs OpenStreetMap/Leaflet. Ustalić.
6. **Dwie instancje GA4** (aura.md) vs **jedna server-side GA** (dok. WP) — pogodzić architekturę pomiaru.

## Krok 2 — Checkpoint człowieka

Przedstaw audyt; **nie edytuj** dokumentów, póki człowiek nie zaakceptuje rozstrzygnięć. Otwarte decyzje z sekcji 9 `aura.md` traktuj jako pytania, nie fakty.

## Krok 3 — Uzupełnienie luk (po akceptacji)

Wprowadź ustalone rozstrzygnięcia, oznacz jeden dokument jako nadrzędny lub scal, zachowaj zasady językowe (sekcja 6 `aura.md` — zakaz „anonimowy”). Zakres: tylko `.github/docs/`. Branch `docs/aura-reconcile`, PR, sugestia wersji, recenzja na diffie. Bez merge/tagu — to decyzja człowieka.
