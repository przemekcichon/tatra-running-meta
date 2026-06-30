# Faza 5 - mapowanie vanilla-design na WordPress

Dokument realizacyjny fazy 5 (zakres z `plan.md`): mapowanie `HTML -> szablony WP`, `JS/CSS -> enqueue`, `dane -> Woo/ACF/CPT`, integracje i notatki cache/ESI.

## 1. HTML -> szablony WordPress

| Vanilla HTML | Docelowy szablon WP | Uwagi wdrozeniowe |
|---|---|---|
| `index.html` | `front-page.php` | Home |
| `obozy.html` | `archive-product.php` | Archiwum produktow z filtrem kat. `obozy` |
| `obozy-kids.html` | `taxonomy-product_cat-kids.php` lub filtr w `archive-product.php` | Wariant listingu `kids` |
| `obozy-junior.html` | `taxonomy-product_cat-junior.php` lub filtr w `archive-product.php` | Wariant listingu `junior` |
| `oboz.html` | `single-product.php` | Produkt obozu + pola ACF |
| `bony.html` | `archive-product.php` lub `taxonomy-product_cat-bony.php` | Listing bonow + konfigurator UI |
| `koszyk.html` | Woo template override `cart/cart.php` | Makieta przechodzi na natywny koszyk Woo |
| `kasa.html` | Woo template override `checkout/form-checkout.php` | Makieta przechodzi na checkout Woo |
| `zespol.html` | `page-zespol.php` (lub `page-{slug}.php`) | Lista trenerow (CPT `trener`) |
| `trener.html` | `single-trener.php` | Single CPT `trener` |
| `partnerzy.html` | `page-partnerzy.php` | Dane z ACF repeater `partnerzy` |
| `kontakt.html` | `page-kontakt.php` | Osadzenie Gravity Forms |
| `blog.html` | `home.php` lub `archive.php` | Archiwum wpisow |
| `blog-post.html` | `single.php` | Single wpisu |
| `newsletter.html` | `page-newsletter.php` | Strona podziekowania/CTA po zapisie |
| `regulamin.html` | `page-regulamin.php` | Strona statyczna |
| `zasady-newslettera.html` | `page-zasady-newslettera.php` | Strona statyczna |
| `prywatnosc.html` | `page-prywatnosc.php` | Strona statyczna |
| `dokumenty.html` | `page-dokumenty.php` | Strona statyczna |

## 1.1 Kontrakt permalinkow WooCommerce

- Struktura permalinkow produktow: `%product_cat%`.
- Rozdzial URL po kategorii glownej produktu:
	- `obozy` -> `/obozy/<slug>/`
	- `bony` -> `/bony/<slug>/`
- Kazdy produkt musi miec ustawiona kategorie glowna (primary category), bo to ona steruje docelowym URL.
- Podkategorie obozow: `biegowe`, `skitour`, `kids`, `junior`.

## 2. JS -> enqueue i warunki ladowania

| Plik JS | Zakres ladowania w WP | Powod |
|---|---|---|
| `js/klaro.config.js` | globalnie (`wp_enqueue_scripts`) + przed skryptami zaleznymi | Dostarcza `window.TRKlaro` i event `aura:klaro-change` |
| `js/aura.js` | globalnie | Orb/panel `.acct`, stany Aury, modal ustawien |
| `js/embeds.js` | globalnie (lub strony z `.embed-frame`) | Bramkowanie embedow po zgodzie |
| `js/cart.js` | globalnie dla badge + szczegolnie `is_cart()` i `is_checkout()` | API koszyka makiety, `window.TRCart`, `window.zl` |
| `js/voucher.js` | tylko strona bonow (`is_product_category('bony')` lub dedykowany template) | Konfigurator bonu (`#amt-grid`) |
| `js/accordion.js` | tylko single obozu (`is_singular('product')`) | Accordion planu `.acc` |

## 3. CSS -> enqueue

Kolejnosc zgodna z vanilla:

1. `css/tokens.css`
2. `css/base.css`
3. `css/components.css`
4. `css/pages.css`

W WP: 4 wywolania `wp_enqueue_style()` z zachowaniem zaleznosci/kolejnosci.

## 4. Kontrakt danych i mapowanie na WP

## 4.0 Frontend creator (`acf_form()`) - mapowanie fazy 5

Uwaga: w producerze brak jeszcze `dodaj-oboz.html`, ale mapowanie kreatora jest wymagane przez plan i stanowi kontrakt dla kolejnej fazy implementacyjnej.

| Obszar | Mapowanie WP |
|---|---|
| Wejscie UX | dedykowana strona kreatora (np. `page-dodaj-oboz.php` i analogiczna dla trenera) |
| Silnik formularza | `acf_form()` (frontend) |
| Wzorzec implementacyjny | referencja read-only: `go4taste-recipes-plugin/features/frontend-creator` |
| Obiekt zapisu - oboz | produkt Woo (`post_type=product`, kat. `obozy`) + pola ACF obozu |
| Obiekt zapisu - trener | CPT `trener` + pola ACF trenera |
| Tryb pracy | wielostronicowy kreator krokowy (AirBnB-like), walidacja krokowa, finalny podglad przed publikacja |

Sugerowany kontrakt krokow kreatora obozu (do implementacji w kolejnej fazie):

1. Podstawy: tytul, lead, hero, status.
2. Lokalizacja i termin: `location`, `region`, `dates`, `days`.
3. Plan i zawartosc: `plan[]`, `included[]`, `excluded[]`, `intro[]`.
4. Trenerzy i logistyka: `coachSlugs`, `where`, `sleep`, `prep`.
5. Sprzedaz: cena Woo, miejsca (stock), `deposit`, finalny podglad i zapis.

## 4.1 Koszyk

- Vanilla: `localStorage['tr_cart_v1']`.
- WP target: `WC()->cart` + natywne fragmenty Woo (badge/licznik).
- Uwagi: typy pozycji `camp` i `voucher` sa prezentacyjne; w WP oba przypadki to produkty Woo (z roznymi kategoriami i metadata).

## 4.2 Aura i zgody

- Vanilla klucze: `tr_prefs_v1`, `tr_user_v1`, `tr_aura_seed`, `tr_aura_day`, `aura_unmeasured`, cookie `aura_klaro`.
- WP target:
	- zgody: Klaro cookie + Consent Mode sygnaly,
	- tozsamosc Aury: first-party cookie (seed dzienny/trwaly),
	- dane zalogowania: `wp_get_current_user()` / konto Woo.

Strategia migracji kluczy (zeby uniknac dryfu implementacyjnego):

| Klucz producenta | Rola teraz (vanilla) | Kontrakt docelowy WP |
|---|---|---|
| `aura_klaro` | zgody uslug | zostaje cookie Klaro (zrodlo prawdy zgody po stronie klienta) |
| `tr_aura_day` | seed dobowy (`ephemeral`) | migrowany do first-party cookie dobowego (`Max-Age=86400`) |
| `tr_aura_seed` | seed trwaly (`recognised`/`linked`) | migrowany do trwalego first-party cookie |
| `aura_unmeasured` | opt-out lokalny | mapowany na sygnal opt-out + stan zgody (brak identyfikatora) |
| `tr_prefs_v1` | preferencje UX panelu Aury | pozostaje po stronie klienta (localStorage) lub cookie preferencji, bez powiazania z tozsamoscia konta |
| `tr_user_v1` | mock zalogowania | wygaszany; zastepuje go natywne konto WP/Woo (`wp_get_current_user()`) |

## 4.3 Produkty, trenerzy, partnerzy

- Oboz i bon: produkty Woo (`post_type=product`) + kategorie:
	- glowna: `obozy` albo `bony`,
	- podkategorie obozow: `biegowe`, `skitour`, `kids`, `junior`.
- Trenerzy: CPT `trener` + ACF.
- Partnerzy: ACF repeater (na stronie partnerow lub ACF Options), bez CPT.

## 4.4 Blog i strony statyczne

- `blog.html` / `blog-post.html` -> natywne posty WordPress.
- `regulamin`, `zasady-newslettera`, `prywatnosc`, `dokumenty` -> zwykle strony (`page`).

## 5. Integracje pluginow

| Integracja | Miejsce w mapowaniu |
|---|---|
| WooCommerce | produkty obozow/bonow, koszyk, kasa, konto |
| ACF PRO | pola produktow obozowych, CPT `trener`, repeater partnerow |
| Gravity Forms | `kontakt` + newsletter (frontend formularze) |
| Klaro | zarzadzanie zgodami + bramkowanie embedow |
| sGTM + GA4 #1/#2 | pomiar przed/po zgodzie, zgodnie z Aura |
| Mailchimp add-on | obsluga zapisu newslettera przez Gravity Forms |
| PayU / Przelewy24 | bramki platnosci WooCommerce |

## 6. Elementy nie-cacheowalne (LiteSpeed/ESI albo lazy JS)

- `.acct` (orb i panel Aury)
- `.cart-badge`
- stan konta uzytkownika (gosc/zalogowany)
- nonce i dynamiczne fragmenty Woo

Rekomendacja wdrozeniowa: zostawic shell w HTML/PHP, a stan dynamiczny dogrywac po stronie klienta (lazy JS) lub przez ESI.

## 7. Roznice wzgledem planu wykryte w producerze

- Brak `dodaj-oboz.html` w aktualnym `vanilla-design`.
- Jest `js/voucher.js`, ktory musi wejsc do mapowania i warunkowego enqueue.

## 8. Zakres tej fazy a dalsze kroki

Ten dokument konczy faze dokumentacyjna (bez implementacji PHP). Kolejna faza moze bezposrednio konsumowac te mapowanie do scaffoldingu motywu i wtyczek.
