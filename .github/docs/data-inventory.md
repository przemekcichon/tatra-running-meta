# Inwentaryzacja danych — prototyp `react-design/`

> **Cel.** Kompletna mapa: **co** jest renderowane w każdym widoku i **skąd** pochodzi
> (`data.jsx` lub treść statyczna/generowana), zanim zaczniemy port do HTML (Faza 2)
> i mapowanie na produkt Woo / pola ACF / CPT `trener` (Faza 5).
>
> **Źródło prawdy:** kod w `react-design/` (stan na Fazę 0.5). Wszystkie identyfikatory
> poniżej to **literały przepisane z kodu**, nie z pamięci.
>
> **Legenda powtarzalności:** `1` = pojedyncze · `[]` = lista/repeater · `?` = opcjonalne (zob. warunek).
>
> **Legenda celu WP:** `Woo` = natywne pole WooCommerce · `ACF` = pole ACF · `tax` = taksonomia ·
> `CPT` = custom post type · `static` = treść statyczna w szablonie/motywie · `runtime` = generowane po stronie klienta (nie-cache).

---

## 1. Źródła danych w `react-design/data.jsx`

Wszystko eksportowane przez `Object.assign(window, { IMG, CAMPS, TRAINERS, VOUCHER_TEMPLATES, VOUCHER_AMOUNTS, PARTNERS, POSTS })`.

### 1.1 `CAMPS` — tablica obozów (11 rekordów)

Rekord referencyjny `tien-shan-2026` ma **pełny** zestaw pól; pozostałe 10 obozów to **podzbiór** (tylko pola „kartowe" + `coachSlugs`). Kontrakt kształtu:

```jsonc
{
  "slug": "tien-shan-2026",          // string, klucz URL /oboz/:slug, relacje
  "title": "Tien-Shan Run&Hike Adventure",
  "year": "2026",                    // string (NIE number)
  "price": 6999,                     // number (PLN, cena za osobę)
  "deposit": 2000,                   // number (zaliczka)
  "location": "Kirgistan",
  "region": "Azja Centralna",
  "dates": "10.07 – 19.07.2026",     // string (zakres, nie data maszynowa)
  "days": 10,                        // number
  "level": "Adventure",              // string swobodny (np. 'Początkujący', 'Dla kobiet')
  "type": "Adventure",               // 'Bieg' | 'Adventure' | 'Skitury' — używane w filtrze kategorii
  "status": "few",                   // 'open' | 'few' | 'full'
  "spotsLeft": 3,                    // number
  "hero": "assets/team-2.webp",      // string (ścieżka relatywna)
  "lead": "Biegowo-trekkingowa eskapada…",

  // ——— pola WYSTĘPUJĄCE TYLKO w rekordzie referencyjnym (opcjonalne) ———
  "featured": true,                  // ? boolean — tylko tien-shan
  "intro": ["…", "…"],               // ? string[] — fallback w CampDetail: intro || [lead]
  "included": ["…"],                 // ? string[] — sekcja „Co jest w cenie?" ukryta, gdy brak
  "excluded": ["…"],                 // ? string[] — renderowane TYLKO gdy `included` istnieje
  "plan": [                          // ? [] — repeater dnia; sekcja „Ramowy plan" ukryta, gdy brak
    { "day": "Dzień 0", "title": "Przylot do Biszkeku", "items": ["…", "…"] }
  ],
  "where": "Naszą ideą…",            // ? string — sekcja „Gdzie biegamy?" ukryta, gdy brak
  "sleep": "Nocujemy w hotelach…",   // ? string — sekcja „Gdzie nocujemy?" ukryta, gdy brak
  "prep": "Żeby wziąć udział…",      // ? string — sekcja „Jak przygotować się?" ukryta, gdy brak

  "coachSlugs": ["kuba-osiecki", "kuba-wisniewski"]  // string[] → TRAINERS.slug (relacja)
}
```

**Pola opcjonalne i warunki renderu (`pages-camp.jsx` → `CampDetail`):**
- `intro` — gdy brak, używany `[camp.lead]` (jeden akapit).
- `included` — gdy brak, cała sekcja „Co jest w cenie?" nie renderuje się.
- `excluded` — renderowane wyłącznie wewnątrz `included` (zagnieżdżony warunek).
- `plan`, `where`, `sleep`, `prep` — każda sekcja warunkowana osobno `camp.<pole> &&`.
- `featured` — ustawione tylko na `tien-shan-2026`; **w prototypie nigdzie nie czytane** (martwy znacznik; potencjalne „wyróżnione" na Home, ale Home bierze `camps.slice(0,3)`).

**⚠️ Pole konsumowane, ale NIGDZIE nie produkowane:** `audience`.
W `pages-misc.jsx` → `CAMP_CATS` kategorie `kids` i `junior` filtrują przez `c.audience === 'kids'` / `'junior'`, ale **żaden obóz w `CAMPS` nie ma pola `audience`** → te kategorie zawsze zwracają pustą listę (stan „Terminy w przygotowaniu"). Do uzupełnienia w modelu WP (taksonomia kategorii produktowej).

**Mapowanie wstępne na WP (Faza 5):**

| Pole | Cel WP |
|---|---|
| `slug` | `Woo` slug produktu (permalink `%product_cat%` → `/obozy/<slug>/`) |
| `title` | `Woo` tytuł produktu |
| `price` | `Woo` cena regularna |
| `spotsLeft` | `Woo` stan magazynowy |
| `deposit` | `ACF` (lub WooCommerce Deposits) |
| `type` / `region` / `audience` | `tax` kategorie/atrybuty produktowe (`biegowe`/`skitour`/`kids`/`junior`) |
| `location`, `dates`, `days`, `level`, `status`, `year` | `ACF` |
| `hero`, `lead` | `ACF` (lub natywne: obrazek/krótki opis Woo) |
| `intro`, `included`, `excluded`, `where`, `sleep`, `prep` | `ACF` (text/textarea/repeater) |
| `plan` | `ACF` repeater (`day` / `title` / `items[]`) |
| `coachSlugs` | `ACF` Relationship → CPT `trener` |

---

### 1.2 `TRAINERS` — tablica trenerów (5 rekordów)

Wszystkie rekordy mają identyczny, **pełny** zestaw pól (brak opcjonalnych).

```jsonc
{
  "slug": "magda-derezinska",        // string, klucz URL /trener/:slug, relacje
  "name": "Magda Derezińska-Osiecka",
  "role": "Trasy · technika biegu · skitury",
  "photo": "assets/trener-magda.webp",
  "tags": ["Skialpinizm", "Biegi górskie", "Przewodnik tatrzański"],  // string[]
  "short": "V-ce Mistrzyni Świata…",  // string (1 zdanie, używane w karcie autora bloga)
  "bio": ["akapit 1", "akapit 2", "akapit 3"],  // string[]
  "medals": ["V-ce Mistrzyni Świata", "…"],     // string[] (3 pozycje)
  "phone": "505 104 062"             // string (format z spacjami; w UI: tel:+48 + replace(/\s/g,''))
}
```

Slugi trenerów (relacje z `CAMPS.coachSlugs` i `POSTS.author`):
`magda-derezinska` · `kuba-osiecki` · `kuba-wisniewski` · `mariusz-gizynski` · `ania-figura`.

**Mapowanie WP:** CPT `trener` + `ACF` (`role`, `tags` repeater/taxonomy, `short`, `bio` repeater, `medals` repeater, `phone`); `photo` = obraz wyróżniony / `ACF` image.

---

### 1.3 `VOUCHER_TEMPLATES` — szablony wizualne bonu (3 rekordy)

```jsonc
{ "id": "summit", "name": "Szczyt", "sub": "Letnia grań", "accent": "#F65824", "theme": "warm" }
// kolejne: id 'winter' (theme 'cool'), id 'classic' (theme 'folk')
```

**Uwaga na klucz relacji:** UI bonu (`pages-shop.jsx` → `BonyPage`) trzyma stan `tpl` i porównuje `t.theme === tpl` (NIE `t.id`). Wartości `theme`: `'warm'` | `'cool'` | `'folk'` mapują na `VOUCHER_THEMES` w `blocks.jsx` (kolor `vc` + tło `bg`):

```jsonc
// blocks.jsx VOUCHER_THEMES
"warm": { "vc": "#F65824", "bg": "assets/home-hero.webp" },
"cool": { "vc": "#2f6f9e", "bg": "assets/team-2.webp" },
"folk": { "vc": "#c2362b", "bg": "assets/team-1.webp" }
```

### 1.4 `VOUCHER_AMOUNTS` — kwoty bonu

```jsonc
[150, 300, 500, 1000]   // number[]; + opcja 'custom' (min. 50 zł, walidacja value >= 50)
```

**Mapowanie WP:** bon = produkt Woo (kat. `bony`); kwota/szablon/dedykacja/forma jako warianty lub `ACF`/pola produktu konfigurowalnego.

---

### 1.5 `PARTNERS` — obiekt z dwiema listami

```jsonc
{
  "strategic": [
    { "name": "On Running", "tag": "Partner techniczny obuwia" }  // {name, tag} ×3
  ],
  "technical": [
    { "name": "Runner's World" }                                   // {name} ×12
  ]
}
```

`strategic[]`: `name` + `tag`. `technical[]`: tylko `name` (na stronie duplikowane `[...P.technical, ...P.technical]` dla marquee).

**Mapowanie WP:** `ACF` repeater (zgodnie z planem — NIE CPT), na stronie Partnerzy / ACF Options. Dwie grupy: strategiczni (`name`+`tag`) i techniczni (`name`).

---

### 1.6 `POSTS` — wpisy blogowe (6 rekordów)

```jsonc
{
  "slug": "pierwszy-sezon-w-gorach", // string, klucz URL /blog/:slug
  "title": "Pierwszy sezon w górach: jak zacząć biegać po szlakach",
  "cat": "Trening",                  // 'Trening' | 'Skitury' | 'Adventure' | 'Eko' | 'Sprzęt'
  "author": "magda-derezinska",      // string → TRAINERS.slug (relacja; PostMeta = getTrainer)
  "date": "2026-06-12",              // string ISO 'YYYY-MM-DD' (fmtDate → polski format)
  "readMin": 7,                      // number
  "cover": "assets/team-hero.webp",  // string LUB null (placeholder, gdy null)
  "coverPos": "center 35%",          // ? string — pozycja obrazka (część rekordów)
  "feature": true,                   // ? boolean — tylko 1 wpis; ster „Polecane" na archiwum
  "excerpt": "Bieganie w terenie…",
  "body": [                          // [] bloki treści
    { "type": "p", "text": "…" },
    { "type": "h2", "text": "…" },
    { "type": "quote", "text": "…" },
    { "type": "list", "items": ["…", "…"] }
  ]
}
```

**Pola opcjonalne / warunki (`pages-blog.jsx`):**
- `cover` — może być `null` (rekord `co-spakowac-na-adventure`); `<Img>` pokazuje placeholder.
- `coverPos` — opcjonalne (przekazywane jako `imgPos`).
- `feature` — `BlogPage` wybiera `posts.find(p => p.feature) || posts[0]`; sekcja „Polecane" tylko gdy filtr = `'Wszystkie'`.
- `body[].type` — `'p'` (domyślny w `ArticleBlock`), `'h2'`, `'quote'`, `'list'` (`items[]` zamiast `text`).

**Mapowanie WP:** natywne wpisy WP + kategorie (`cat` → taksonomia kategorii); `author` → relacja do CPT `trener` (`ACF`); `cover`/`coverPos` → obraz wyróżniony + `ACF`; `body` → natywna treść (Gutenberg) lub `ACF` flexible content.

### 1.7 `IMG` — rejestr ścieżek obrazów (referencyjny, mało używany)

```jsonc
{ "homeHero": "assets/home-hero.webp", "teamHero": "assets/team-hero.webp",
  "team1": "assets/team-1.webp", "team2": "assets/team-2.webp", "teamEko": "assets/team-eko.webp" }
```
W praktyce strony używają ścieżek `assets/*.webp` wpisanych wprost (nie przez `IMG`). Do pominięcia w WP (media library).

---

## 2. Widoki (1 widok = 1 docelowy plik HTML / szablon WP)

Routing: `react-design/router.jsx` → `parseHash()`; montaż: `react-design/app.jsx` → `App` switch.

| # | Route (hash) | Komponent | Plik vanilla (plan) | Szablon WP (plan) |
|---|---|---|---|---|
| 1 | `#/` | `HomePage` | `index.html` | `front-page.php` |
| 2 | `#/obozy/:cat` | `CampsPage` | `obozy.html` | `archive` (kat. obozy) |
| 3 | `#/oboz/:slug` | `CampDetail` | `oboz.html` | `single-product.php` |
| 4 | `#/zespol` | `TeamPage` | `zespol.html` | `page-zespol.php` |
| 5 | `#/trener/:slug` | `TrainerDetail` | `trener.html` | `single-trener.php` |
| 6 | `#/partnerzy` | `PartnersPage` | `partnerzy.html` | `page-partnerzy.php` |
| 7 | `#/bony` | `BonyPage` | `bony.html` | produkt Woo (kat. bony) |
| 8 | `#/kasa` | `CheckoutPage` | `kasa.html` | Woo checkout |
| 9 | `#/kontakt` | `ContactPage` | `kontakt.html` | Gravity Form |
| 10 | `#/blog` | `BlogPage` | `blog.html` | `home.php`/`archive.php` |
| 11 | `#/blog/:slug` | `BlogPost` | `blog-post.html` | `single.php` |
| 12 | `#/dokumenty` | `LegalHubPage` | `dokumenty.html` | `page-*.php` |
| 13 | `#/regulamin` | `ShopTermsPage` | `regulamin.html` | `page-*.php` |
| 14 | `#/zasady-newslettera` | `NewsletterRulesPage` | `zasady-newslettera.html` | `page-*.php` |
| 15 | `#/prywatnosc` | `PrivacyPage` | `prywatnosc.html` | `page-*.php` |
| 16 | `#/newsletter` | `NewsletterThanksPage` | `newsletter.html` | `page-*.php` |
| — | (drawer/koszyk) | `CartDrawer` | `koszyk.html` + drawer | Woo cart/mini-cart |
| — | (chrome) | `Header` / `Footer` / `MobileMenu` | `partials/header.html`, `footer.html` | `header.php`/`footer.php` |
| — | (overlay) | `AccountMenu` / `SettingsModal` / `AuthModal` | `js/aura.js` + panel | Aura (motyw, ESI) |

> `SimplePage` (`pages-misc.jsx`) to fallback dla nieistniejącego obozu/trenera/wpisu — nie samodzielny widok.
> `#/kosz`/koszyk nie ma własnej trasy; koszyk to drawer (`CartDrawer`) montowany globalnie w `App`.

---

### Widok 1 — Home (`HomePage`, `pages-home.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | tło `assets/home-hero.webp`, eyebrow „14. sezon… 2026", tytuł „Tatra Running", podtytuł, 2× CTA (`/obozy`, `/bony`) | 1 | `static` | `static` |
| Statystyki | `num`+`lab` (`14.`, `500+`, `3`, `max 14`) | `[]` (4) | `static` (inline `stats`) | `static`/`ACF` |
| Najbliższe obozy | `featured = camps.slice(0,3)` → `CampCard` | `[]` (3) | `data.jsx` `CAMPS` | `Woo` query |
| Team teaser | obraz `assets/team-1.webp`, nagłówek, 2× CTA | 1 | `static` | `static` |
| Pasmo „Dlaczego" | `ic`+`h`+`p` (users/star/leaf) | `[]` (3) | `static` (inline) | `static`/`ACF` |
| Promo bonów | tekst + `VoucherArt theme="warm" amount={500} recipient="Zosi"` | 1 | `static` + `blocks.jsx` `VoucherArt` | `static` + link Woo |

### Widok 2 — Archiwum obozów (`CampsPage`, `pages-misc.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Nagłówek kategorii | `title`, `intro` z `CAMP_CATS[cat]` (klucze `biegowe`/`skitour`/`kids`/`junior`) lub domyślne | 1 | `static` (`CAMP_CATS`) | `tax` term meta / `static` |
| Filtr/licznik | `camps.length` + etykieta | 1 | `data.jsx` `CAMPS` (filtr `def.match`) | `Woo` query |
| Lista obozów | `CampCard` (zob. grupa współdzielona) | `[]` | `data.jsx` `CAMPS` | `Woo` |
| Pusty stan | „Terminy w przygotowaniu" (gdy `camps.length === 0`) | 1 | `static` | `static` |
| Pasmo zaufania | `ic`+`h`+`p` (shield/clock/users) | `[]` (3) | `static` (inline) | `static` |

> `CAMP_CATS` (`pages-misc.jsx`): `biegowe` → `type ∈ {Bieg, Adventure}`, `skitour` → `type === 'Skitury'`, `kids`/`junior` → `audience === …` (zob. ostrzeżenie 1.1).

### Widok 3 — Single obozu (`CampDetail`, `pages-camp.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero obozu | `hero`, `location` (label), `title` | 1 | `CAMPS` | `Woo`/`ACF` |
| Pasek tytułu | breadcrumb, `price` (`zl`), `title`+`year`, chipy: `location`/`dates`/`level`/`days` | 1 | `CAMPS` | `Woo`/`ACF` |
| Wstęp (proza) | `intro[]` (fallback `[lead]`) | `[]?` | `CAMPS.intro` / `lead` | `ACF` |
| Co w cenie | `included[]`; obok `excluded[]` (gdy `included`) | `[]?` | `CAMPS.included`/`excluded` | `ACF` |
| Ramowy plan | `plan[]` → `Accordion` (`day`/`title`/`items[]`); domyślnie otwarty index 2 | `[]?` | `CAMPS.plan` | `ACF` repeater |
| Gdzie biegamy | `where` + galeria `GALLERY_POOL.slice(0,5)` | 1? + `[]` | `CAMPS.where` + `static` (`GALLERY_POOL`) | `ACF` + media |
| Gdzie nocujemy | `sleep` | 1? | `CAMPS.sleep` | `ACF` |
| Przygotowanie | `prep` | 1? | `CAMPS.prep` | `ACF` |
| Prowadzący | `coachSlugs` → `getTrainer` → mini-karty (`photo`/`name`/`role`, link `/trener/:slug`) | `[]` | `CAMPS.coachSlugs` + `TRAINERS` | `ACF` Relationship |
| Opinie | `text`/`who`/`camp` | `[]` (2) | `static` (`REVIEWS`) | `static`/`ACF`/wtyczka |
| Zasady rezerwacji | 3 akapity (zaliczka 750/2000 zł, rezygnacja 60 dni) | 1 | `static` | `static`/`ACF` |
| Karta rezerwacji | `price`, `deposit`, `status`, `spotsLeft`; dodaj do koszyka (item `camp`) | 1 | `CAMPS` + `useCart` | `Woo` add-to-cart |

### Widok 4 — Zespół (`TeamPage`, `pages-team.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | `assets/team-hero.webp` + nagłówek | 1 | `static` | `static` |
| Filozofia | obraz `assets/team-1.webp` + 2 akapity | 1 | `static` | `static` |
| Siatka trenerów | `TRAINERS` → `tcard` (`photo`/`tags.slice(0,2)`/`name`/`role`, link `/trener/:slug`) | `[]` | `data.jsx` `TRAINERS` | `CPT trener` query |
| Pasmo Eko | obraz `assets/team-eko.webp` + tekst | 1 | `static` | `static` |

### Widok 5 — Single trenera (`TrainerDetail`, `pages-team.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Breadcrumb + tożsamość | `name`, `role`, `photo` | 1 | `TRAINERS` | `CPT`/`ACF` |
| Medale | `medals[]` | `[]` | `TRAINERS.medals` | `ACF` repeater |
| Bio | `bio[]` (akapity) | `[]` | `TRAINERS.bio` | `ACF` |
| Kontakt | `phone` (tel), e-mail statyczny | 1 | `TRAINERS.phone` + `static` | `ACF` |
| Obozy trenera | `CAMPS` filtr `coachSlugs.includes(slug)` → `CampCard` (max 3) | `[]` | `CAMPS` (relacja) | `Woo` query po relacji |

### Widok 6 — Partnerzy (`PartnersPage`, `pages-misc.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | eyebrow/tytuł/lead | 1 | `static` | `static` |
| Strategiczni | `name`+`tag` (logo = inicjały) | `[]` (3) | `data.jsx` `PARTNERS.strategic` | `ACF` repeater |
| Techniczni (marquee) | `name` (duplikowane ×2) | `[]` (12) | `data.jsx` `PARTNERS.technical` | `ACF` repeater |
| CTA współpraca | tekst + mailto | 1 | `static` | `static` |

### Widok 7 — Bony / konfigurator (`BonyPage`, `pages-shop.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | `assets/team-2.webp` + nagłówek | 1 | `static` | `static` |
| Krok 1 — kwota | `VOUCHER_AMOUNTS` + „własna" (min 50) | `[]` | `data.jsx` `VOUCHER_AMOUNTS` | `Woo`/`ACF` |
| Krok 2 — szablon | `VOUCHER_TEMPLATES` (`accent`/`name`, klucz `theme`) | `[]` (3) | `data.jsx` `VOUCHER_TEMPLATES` | `ACF`/warianty |
| Krok 3 — dedykacja | `recipient` (input), `message` (textarea, max 120) | 1 | stan UI | meta zamówienia |
| Krok 4 — forma | `delivery` (`digital`/`physical`) | 1 | stan UI | wariant Woo |
| Live preview | `VoucherArt theme amount recipient custom` + `message` | 1 | `blocks.jsx` `VoucherArt` | `runtime`/render |
| Dodaj do koszyka | item `voucher` (`title`/`sub`/`price`/`voucherTheme`) | 1 | `useCart` | `Woo` |
| Pasmo korzyści | `ic`+`h`+`p` (gift/clock/mail/star) | `[]` (4) | `static` (inline) | `static` |

### Widok 8 — Kasa (`CheckoutPage`, `pages-shop.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Stan pusty | komunikat + CTA (gdy `cart.items.length === 0`) | 1 | `static` + `useCart` | `Woo` |
| Sukces | `order` (losowy `TR-######`), `total`, `pay` | 1 | `runtime` (mock) | `Woo` order |
| Dane kontaktowe | imię/nazwisko/e-mail/telefon (inputy) | 1 | stan UI | `Woo` checkout |
| Metody płatności | `PAY` (`blik`/`p24`/`transfer`) + nr konta `86 1050…4764` | `[]` (3) | `static` (`PAY`, inline) | `Woo` (PayU/P24) |
| Podsumowanie | `cart.items` (`qty`×`title`, `price`), dostawa, razem (`zl`) | `[]` | `useCart` | `Woo` |

### Widok 9 — Kontakt (`ContactPage`, `pages-misc.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | eyebrow/tytuł/lead | 1 | `static` | `static` |
| Formularz | imię/nazwisko/e-mail/telefon/temat/treść; stan `sent` | 1 | stan UI (mock) | Gravity Forms |
| Siedziba + mapa | adres `ul. Kościelna 21, lok. 14, 34-500 Zakopane`; `PrivacyMap lat=49.2992 lng=19.9496` | 1 | `static` + `account.jsx` `PrivacyMap` | `static` + Klaro/embed |
| E-mail | `contact@tatrarunning.pl` | 1 | `static` | `static` |
| Numery | Kuba Osiecki `+48 500 152 300`, Magda `+48 505 104 062` | `[]` (2) | `static` | `static` |
| Nr konta | `86 1050 1445 1000 0090 9778 4764` | 1 | `static` | `static` |
| Social | `SocialRow` (fb/ig/yt) | `[]` (3) | `chrome.jsx` `SOCIALS` | `static`/Customizer |

### Widok 10 — Blog archiwum (`BlogPage`, `pages-blog.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | eyebrow/tytuł/lead | 1 | `static` | `static` |
| Polecane | `posts.find(p=>p.feature)||posts[0]` (`cover`/`cat`/`title`/`excerpt`/`PostMeta`) | 1 | `data.jsx` `POSTS` | `WP` query |
| Filtry kategorii | `['Wszystkie', ...unikalne POSTS.cat]` | `[]` | `POSTS.cat` | `tax` |
| Siatka wpisów | `PostCard` (`cover`/`coverPos`/`cat`/`title`/`excerpt`/`PostMeta`) | `[]` | `POSTS` | `WP` |

### Widok 11 — Single wpisu (`BlogPost`, `pages-blog.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Nagłówek artykułu | breadcrumb, `cat`, `title`, `excerpt`, `PostMeta` | 1 | `POSTS` | `WP` |
| Okładka | `cover`/`coverPos` | 1 | `POSTS` | obraz wyróżniony |
| Treść | `body[]` → `ArticleBlock` (`p`/`h2`/`quote`/`list`) | `[]` | `POSTS.body` | treść WP |
| Karta autora | `getTrainer(author)`: `photo`/`name`/`role`/`short`, link `/trener/:slug` | 1 | `POSTS.author` + `TRAINERS` | relacja `ACF` |
| Czytaj dalej | wpisy `cat` zgodne (max 3) lub fallback | `[]` | `POSTS` | `WP` query |

### Widoki 12–15 — Dokumenty prawne (`LegalHubPage`, `ShopTermsPage`, `NewsletterRulesPage`, `PrivacyPage`, `pages-legal.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Rejestr dokumentów | `LEGAL_DOCS`: `id`/`route`/`icon`/`label`/`chip`/`desc` | `[]` (3) | `static` (`LEGAL_DOCS`) | `static`/`ACF` |
| Hub | karty z `LEGAL_DOCS` | `[]` | `static` | `static` |
| Dokument (`LegalDoc`) | `eyebrow`/`title`/`updated`/`intro`/`sections[]`/`versions[]` | 1 | `static` (per-strona) | treść WP/`ACF` |
| Sekcja | `id`/`title`/`blocks[]` (`p`/`list`/`callout`/`sub`) | `[]` | `static` | treść WP |
| TOC (scrollspy) | `sections` + `updated` + `versions` | 1 | `static` + `runtime` (IntersectionObserver) | `runtime` |

> Treść = placeholder `LOREM`/`LOREM2` (focus na układzie, nie copy). Finalna treść prawna do uzupełnienia.

### Widok 16 — Newsletter podziękowanie (`NewsletterThanksPage`, `pages-misc.jsx`)

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Hero | eyebrow/tytuł/lead | 1 | `static` | `static` |
| Potwierdzenie | komunikat „Potwierdź swój adres" (double opt-in) | 1 | `static` | `static` |
| Korzyści | `ic`+`t`+`d` | `[]` (3) | `static` (`benefits` inline) | `static` |

---

## 3. Chrome (Header / Footer / Mobile menu) — `chrome.jsx`

| Grupa | Pola | Powt. | Źródło | Cel WP |
|---|---|---|---|---|
| Nawigacja główna | `NAV`: `to`+`label` (`/obozy/biegowe`, `/obozy/skitour`, `/obozy/kids`, `/obozy/junior`) | `[]` (4) | `static` (`NAV`) | menu WP |
| Topnav | `TOPNAV`: `to`+`label`+`sep` (zespół/partnerzy/pomoc · blog/kontakt) | `[]` | `static` (`TOPNAV`) | menu WP |
| Social | `SOCIALS`: `name`+`label`+`href` (fb/ig/yt) | `[]` (3) | `static` (`SOCIALS`) | Customizer/`ACF` |
| Topbar kontakt | `+48 500 152 300`, `contact@tatrarunning.pl`, „14. sezon" | 1 | `static` | `static` |
| Logo | `assets/logo.webp` | 1 | `static` | media |
| Koszyk (badge) | `cart.count` | 1 | `useCart` | `runtime` (non-cache) |
| Konto (orb) | `AccountMenu` (Aura) | 1 | `account.jsx` | `runtime` (Aura, ESI) |
| Footer — newsletter | `NewsletterSignup` (input e-mail, modal potwierdzenia) | 1 | stan UI (mock) | Gravity Forms + Mailchimp |
| Footer — kolumny | „Wyprawy"/„Tatra Running"/„Pomoc"/„Kontakt" (linki) | `[]` | `static` | menu WP |
| Footer — dół | „© 2026 Tatra Running" + `SocialRow` | 1 | `static` | `static` |

---

## 4. Aura / Konto / Prywatność / Embedy — `account.jsx`

> Wszystko **generowane po stronie klienta** (`runtime`), trzymane w `localStorage`. Docelowo: motyw/wtyczka Aura, treści **nie-cacheowalne** (ESI). Pełna spec: [aura.md](./aura.md).

| Grupa | Pola / literały | Źródło | Cel WP |
|---|---|---|---|
| Klucze storage | `tr_prefs_v1` (`PREFS_KEY`), `tr_user_v1` (`USER_KEY`), `tr_aura_seed` (`SEED_KEY`), `tr_cart_v1` (`LS_KEY`, ui.jsx) | `runtime` | `runtime`/cookie |
| Preferencje domyślne | `DEFAULT_PREFS`: `contactChannel:'auto'`, `youtube:'ask'`, `maps:'osm'`, `consent:{analytics:false, personalization:false, marketing:false}` | `static` (default) | `runtime` |
| Tożsamość Aura | `seed` (int) → `auraIdentity`: `name` (`ADJ`×`ANIMAL`), `tag` (hex4), `hue` (`AURA_HUES`) | `runtime` (seeded RNG `rng`) | `runtime` |
| Awatar | `AuraAvatar` (SVG deterministyczny z `seed`), `AuraMark` (orb ring; `claimed` = zalogowany) | `runtime` | `runtime` |
| Presety | `PRESETS`: `smooth`/`balanced`/`sanctuary`; `PRESET_META`: `label`+`sub` | `static` | `runtime` |
| Kontakt (kanał) | `resolveContact(channel)` → `tel:+48500152300` (`PHONE_E164`) / `https://wa.me/48500152300` (`WA_NUMBER`); hook `useContactLink` | `runtime` | `runtime` |
| Auth (mock) | `AuthModal`: `setUser({name, email})` — front-only, bez backendu | `runtime` (mock) | WooCommerce My Account |
| Zgody | `consent.{analytics, personalization, marketing}` (Toggle) | `runtime` | Klaro |
| Embed mapa | `PrivacyMap` (`lat`/`lng`/`query`/`label`/`zoom`): OSM iframe vs przekierowanie Google wg `prefs.maps` | `runtime` | Klaro + embed |
| Embed wideo | `PrivacyVideo` (`id`/`title`): `youtube-nocookie` iframe vs placeholder wg `prefs.youtube` | `runtime` | Klaro + embed |

> **Uwaga (presety vs plan):** w kodzie `PRESET_META` ma etykiety `Płynnie` / `Równowaga` / `Sanktuarium`. Plan ([plan.md](./plan.md)) i [aura.md](./aura.md) wymagają przemianowania na klimat górsko-biegowy: *Na lekko* / *Szlakiem* / *Schronisko*. Rozbieżność do rozstrzygnięcia w Fazie 4.

---

## 5. Pola / komponenty współdzielone między widokami

| Element | Definicja | Używany w | Pola |
|---|---|---|---|
| `CampCard` | `blocks.jsx` | Home, Archiwum, Single trenera | `hero`/`type`/`status`/`spotsLeft`/`price`/`title`/`year`/`lead`/`location`/`dates`/`level`/`days`/`slug` |
| `StatusBadge` | `blocks.jsx` | `CampCard`, `BookingCard` | `status` + `spotsLeft` (`STATUS` z ui.jsx) |
| `VoucherArt` | `blocks.jsx` | Home (promo), Bony (preview), koszyk (line-item) | `theme`/`amount`/`recipient`/`custom` (+`VOUCHER_THEMES`) |
| `PostMeta` | `pages-blog.jsx` | Archiwum, Single, karta autora | `author`→`getTrainer` (`photo`/`name`), `date` (`fmtDate`), `readMin` |
| `PostCard` | `pages-blog.jsx` | Archiwum, „Czytaj dalej" | `cover`/`coverPos`/`cat`/`title`/`excerpt`/`PostMeta` |
| `PageHero` | `pages-misc.jsx` | Archiwum, Partnerzy, Kontakt, Blog, Kasa, Newsletter, Legal | `eyebrow`/`title`/`crumbs`/`children` |
| `SectionHeading` | `blocks.jsx` | wiele | `eyebrow`/`title`/`children`/`center`/`light` |
| `SocialRow` | `chrome.jsx` | Mobile menu, Kontakt, Footer | `SOCIALS` |
| `Img` | `ui.jsx` | wszędzie | `src`/`label` (placeholder gdy brak `src`) |

**Encje pojawiające się w wielu widokach (zmapować raz):**
- **Obóz (`CAMPS`)** — karta na Home/Archiwum/Single-trenera; pełny rekord na Single obozu. → 1× produkt Woo + ACF.
- **Trener (`TRAINERS`)** — karta na Zespół; mini-karta na Single obozu; karta autora na blogu; pełny rekord na Single trenera. → 1× CPT `trener`.
- **Wpis (`POSTS`)** — karta na Archiwum/„Czytaj dalej"; pełny na Single. → 1× wpis WP.
- **Relacje:** `CAMPS.coachSlugs ↔ TRAINERS.slug` · `POSTS.author → TRAINERS.slug`.

---

## 6. Helpery do reużycia (sygnatury)

```js
// ui.jsx
zl(n)                         // → '6 999 zł' (Intl.NumberFormat pl-PL + ' zł')
getCamp(slug)                 // → window.CAMPS.find(c => c.slug === slug) | undefined
getTrainer(slug)              // → window.TRAINERS.find(t => t.slug === slug) | undefined
getPost(slug)                 // → window.POSTS.find(p => p.slug === slug) | undefined
STATUS                        // { open:{label,cls}, few:{…}, full:{…} }
Icon({ name, size, stroke, className, style })   // inline SVG sprite (~35 nazw)
Img({ src, alt, label, className, style, ratio, imgPos })  // placeholder gdy brak src
useCart()                     // { items, add, remove, setQty, clear, count, total, open, setOpen }

// blocks.jsx
VoucherArt({ theme, amount, recipient, custom, style, className })
CampCard({ camp })  ·  StatusBadge({ status, spotsLeft })  ·  SectionHeading({…})  ·  Reveal({…})

// router.jsx
useRoute()  ·  go(path)  ·  Link({ to, … })

// account.jsx
useAccount()                  // { prefs, setPref, setConsent, applyPreset, user, setUser, seed, regenIdentity, … }
useContactLink()              // → props <a> wg prefs.contactChannel
auraIdentity(seed)            // → { name, tag, hue }
rng(seed)                     // deterministyczny PRNG [0,1)
PrivacyMap({ lat, lng, query, label, zoom, className })
PrivacyVideo({ id, title, className })

// pages-blog.jsx
fmtDate(iso)                  // ISO → '12 czerwca 2026' (PL_MONTHS)
initials(name)               // 'Magda Derezińska-Osiecka' → 'MD'
```

**Kształt pozycji koszyka** (kontrakt `cart.add`, do mapowania na Woo):

```jsonc
// obóz (CampDetail → BookingCard)
{ "key": "camp-<slug>-deposit", "type": "camp", "title": "<title> <year>",
  "sub": "Zaliczka · <dates>", "price": <deposit>, "qty": <n>, "image": "<hero>", "meta": "<location>" }
// bon (BonyPage)
{ "key": "voucher-<theme>-<value>-<delivery>-<recipient|x>-<ts>", "type": "voucher",
  "title": "Bon podarunkowy — <zl(value)>", "sub": "<forma> · dla <recipient>",
  "price": <value>, "qty": 1, "voucherTheme": "<theme>" }
```

> Uwaga: w koszyku obozu `price` = **zaliczka** (`deposit`), nie pełna cena — istotne przy mapowaniu na Woo (WooCommerce Deposits / własna logika).

---

## 7. Treści statyczne / generowane (NIE z `data.jsx`)

| Treść | Lokalizacja | Charakter |
|---|---|---|
| `REVIEWS` (opinie obozu) | `pages-camp.jsx` | `static` (2 wpisy, nieparametryzowane per-obóz) |
| `GALLERY_POOL` (galeria trasy) | `pages-camp.jsx` | `static` (te same 5 zdjęć dla każdego obozu) |
| `CAMP_CATS` (definicje kategorii) | `pages-misc.jsx` | `static` (→ taksonomia WP) |
| `LEGAL_DOCS` + treść dokumentów | `pages-legal.jsx` | `static` (placeholder `LOREM`/`LOREM2`) |
| `PAY` + nr konta + dane kontaktowe | `pages-shop.jsx`, `pages-misc.jsx` | `static` |
| `NAV`/`TOPNAV`/`SOCIALS` | `chrome.jsx` | `static` (→ menu/Customizer) |
| Statystyki/„wartości"/korzyści (inline) | `pages-home.jsx`, `pages-shop.jsx`, `pages-misc.jsx` | `static` (tablice inline w JSX) |
| Aura (tożsamość, presety, awatar) | `account.jsx` | `runtime` (seeded, non-cache) |

---

## 8. Otwarte kwestie (do rozstrzygnięcia w kolejnych fazach)

1. **`audience`** — kategorie `kids`/`junior` w `CAMP_CATS` filtrują po nieistniejącym polu → puste. W WP wymaga taksonomii/atrybutu produktu (Faza 5). *(zob. 1.1)*
2. **`featured`** (CAMPS) — ustawione, ale nieczytane w prototypie. Decyzja: czy „wyróżniony obóz" ma istnieć w WP. *(zob. 1.1)*
3. **Nazwy presetów Aury** — kod ma `Płynnie`/`Równowaga`/`Sanktuarium`; plan/aura.md wymagają `Na lekko`/`Szlakiem`/`Schronisko`. *(zob. §4)*
4. **`VOUCHER_TEMPLATES.id` vs `theme`** — relacja UI używa `theme`, nie `id`. Spójność kluczy przy modelu Woo bonu. *(zob. 1.3)*
5. **Treść dokumentów prawnych** — placeholder; finalna treść prawna przed publikacją. *(zob. 12–15)*
