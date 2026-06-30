# Ground-truth Faza 5 — mapowanie vanilla na WordPress

Teraz mapujemy artefakty vanilla-design na stos WP (motyw, wtyczki, dane).

## 1. Producent → Konsument

**Producent (vanilla-design/):** 19 stron HTML + assets + 6 skryptów (cart, accordion, aura, klaro, embeds) + CSS → gotowe do osadzenia w WP.

**Konsument (Faza 5):** Dokument mapowania `vanilla-design → WP` zawierający:
- HTML template → PHP plik motywu (front-page.php, single-product.php, page-*.php, itd.)
- JS (vanilla) → wpisy do `wp_enqueue_script()` w motywie + hook/action
- CSS (vanilla) → `wp_enqueue_style()` w motywie
- Dane statyczne (Camp/Trainer/Partner) → produkt Woo / CPT trener / ACF repeater
- Embedy (mapa OSM, YouTube, formularz) → Klaro + bramkowanie w WP
- Klaro/Aura/analityka → snippet sGTM + GA4 #1/#2 + cookie dobowy
- Orb/Panel NIE-cacheowalne → ESI lub lazy JS
- Presety Aury → przechowywanie w cookie / localStorage
- Integracje: Gravity Forms (kontakt/formularz), WooCommerce (koszyk/kasa), ACF (pola produktu/trenera), Mailchimp (newsletter)

## 2. Inwentaryzacja (literały kod-vanilla → WP)

### localStorage/cookie (vanilla → WP)
| Vanilla localStorage | WP → |
|---|---|
| `tr_prefs_v1` (prefs) | user meta lub session / cookie |
| `tr_user_v1` (user mock) | WC_Customer / wp_get_current_user() |
| `tr_cart_v1` (koszyk) | WC_Cart |
| `tr_aura_seed` (trwały seed) | first-party cookie (WP Set-Cookie) |
| `tr_aura_day` (dobowy seed) | dobowe first-party cookie (reset 24h) |
| `aura_klaro` (konsenty) | Klaro JS cookie |
| `aura_unmeasured` (opt-out) | Klaro flaga / sGTM sygnał |

### Klucze literałowe 
- Phone: `+48500152300`, `48500152300`
- Presety: `smooth`→`Na lekko`, `balanced`→`Szlakiem`, `sanctuary`→`Schronisko` (mapować na ustawienia profilu/preferencje)
- Stany Aury: `unmeasured`, `ephemeral`, `recognised`, `linked` → mapować na WC user status / mater / auth level
- Usługi Klaro (6): `ga4-essential`, `ga4-analytics`, `youtube`, `osm`, `whatsapp`, `gravity-forms`

### Mapa HTML → PHP (motyw tatrarunning-theme)
| Vanilla HTML | WP szablon | Rola |
|---|---|---|
| index.html | front-page.php | Home |
| obozy.html | archive-product.php (kategoria obozy) | Archiwum obozów |
| oboz.html | single-product.php (kategoria obozy) | Single obozu (karta + ACF) |
| obozy-kids.html | archive-product.php (filtr kids) | Archive kids |
| obozy-junior.html | archive-product.php (filtr junior) | Archive junior |
| zespol.html | page-team.php (właściwie page-*) | Zespół (CPT trener query) |
| trener.html | single-trainer.php (custom CPT template) | Single trenera |
| partnerzy.html | page-partners.php | Partnerzy (ACF repeater) |
| bony.html | archive-product.php (kategoria bony) | Archiwum bonów |
| koszyk.html | cart.php (Woo override) | Koszyk (WC_Cart) |
| kasa.html | checkout.php (Woo override) | Kasa (WC_Checkout) |
| kontakt.html | page-contact.php | Kontakt (Gravity Form) |
| blog.html | home.php / archive.php | Blog archiwum |
| blog-post.html | single.php | Single wpisu |
| dodaj-oboz.html | page-add-camp.php | Kreator (acf_form wizard) |
| newsletter.html | (custom CPT) newsletter-thank.php | Podziękowanie newsletter (post type) |
| regulamin.html, zasady-newslettera.html, prywatnosc.html, dokumenty.html | page-*.php (natywne strony) | Strony prawne |

### JS (vanilla) → hooki WP
| Vanilla JS | WP hook / gdzie ładować |
|---|---|
| js/cart.js | wp_enqueue_script + on WooCommerce pages (is_cart, is_checkout) |
| js/accordion.js | wp_enqueue_script + on single camp (is_singular('product')) |
| js/aura.js | wp_enqueue_script global (all pages) + `wp_footer` |
| js/klaro.config.js | wp_enqueue_script global + `wp_head` (PRZED aura/analytics) |
| js/embeds.js | wp_enqueue_script + `wp_footer` |

### CSS (vanilla) → motyw
| Vanilla CSS | WP |
|---|---|
| css/tokens.css | wp_enqueue_style (root vars, :root) |
| css/base.css | wp_enqueue_style |
| css/components.css | wp_enqueue_style (+ aura, klaro, embeds klasy) |
| css/pages.css | wp_enqueue_style |

## 3. Model danych (vanilla static → WP dynamic)

### Produkty WooCommerce (obozy + bony)
- Kategoria główna: `obozy` lub `bony` (primary category → permalink `%product_cat%`)
- Podkategorie obozy: `biegowe`, `skitour`, `kids`, `junior`
- Pola ACF:
  - Obóz: `deposit`, `location`, `region`, `dates`, `days`, `level`, `type`, `status`, `featured`, `hero`, `lead`, `intro[]`, `included[]`, `excluded[]`, `plan[]` (repeater), `where`, `sleep`, `prep`, `coachSlugs` (relationship do CPT)
  - Bon: (zdefiniować w ACF + Woo product meta dla konfigu)
- Cena natywna WooCommerce, stan magazynowy = wolne miejsca

### CPT `trener` + ACF
- Pola: imię, nazwisko, bio, zdjęcie, specjalizacja (lista), kat. (lista), relacja do produktów-obozów (Relationship field)
- Mapa vanilla adny.jsx `TRAINERS` → query `get_posts(['post_type' => 'trener'])`

### ACF repeater `partner` (nie CPT)
- Store na stronie-partnerzy lub ACF Options (global)
- Pola: logo, nazwa, url, opis

### Wpisy natywne WP
- Blog posts (single.php) z kategoriami (mapować z vanilla `POSTS` структуру)

### Newsletter (Gravity Forms + Mailchimp add-on)
- Footer form na każdej stronie
- Submit → Mailchimp list via Gravity Forms integration

## 4. Integracje wtyczek

| Wtyczka | Funkcja | Vanilla mapping |
|---|---|---|
| WooCommerce | Produkty, koszyk, kasa | cart.js + checkout |
| ACF PRO | Pola produktów/trenera/partnerów, formularze | aura.js (settings), admin w WP |
| Gravity Forms | Kontakt, formularz newsletter, kreator | embeds.js (form gating), kontakt.html |
| Klaro JS | Zarządzanie zgodą, bramkowanie | klaro.config.js (6 usług) + aura.js (sync) |
| sGTM (server-side GTM) | Pomiar przedzgodowy + po zgodzie | snippet w wp_head, GA4 #1/#2 |
| Wordfence | Bezpieczeństwo | (konfiguracja, nie kod) |
| Mailchimp add-on | Newsletter | Gravity Forms integration |
| PayU / Przelewy24 | Płatności | WooCommerce payment gateway |

## 5. Treści NIE-cacheowalne (LiteSpeed ESI / lazy JS)

- Orb + panel Aury (`.acct`, `.aura-panel`)
- Cart badge (`.cart-badge`)
- Stan konta (zalogowany/niezalogowany)
- Nonce'y WooCommerce

**Implementacja:** ESI tag w motywie (`get_header()` → `<!--esi ... -->`) LUB lazy JS ładujący fragment przez JS zamiast PHP.

## 6. Analityka (sGTM + GA4)

- **GA4 #1 sandbox (ślad ulotny):** przed zgodą, dobowe cookie `tr_aura_day`, identyfikator ulotny
- **GA4 #2 produkcja:** po zgodzie (event `aura:klaro-change`), trwałe first-party cookie `tr_aura_seed`
- **sGTM kontener:** redirect payload, Google Consent Mode v2 (analytics_storage denied/granted)
- **Cookie dobowy:** `Set-Cookie: tr_aura_day=...; Max-Age=86400; SameSite=Lax`

## 7. Struktura motywy (tatrarunning-theme po Fazie 5)

```
functions.php                    (enqueue scripts/styles, hooks)
header.php                       (orb + panel, ESI marker)
footer.php                       (Klaro, sGTM, aura, analytics)
front-page.php                   (home)
archive-product.php              (obozy/bony archiwum)
single-product.php               (produkty z ACF)
archive-product-category.php     (filtry: biegowe/skitour/kids)
page-*.php                       (strony custom)
single-trainer.php               (CPT trener)
single.php                        (blog posts)
cart.php, checkout.php           (Woo overrides)
assets/js/
  - minified bundle (cart, accordion, aura, klaro, embeds)
assets/css/
  - minified bundle (tokens, base, components, pages)
```

## 8. Bez zmian (read-only celem porównania)

- react-design/ (prototyp, referenca)
- `woocommerce/` (wtyczka — czytamy szablony)
- `advanced-custom-fields-pro/` (API — bez zmian)

---

**Gotowe do Fazy 5:** Wszystkie literały, mapowania, integracje, plany ESI, struktura motywu.
