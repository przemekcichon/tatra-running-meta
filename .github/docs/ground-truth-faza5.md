# Ground-truth Faza 5 (TYLKO ODCZYT)

Cel: kontrakt wejściowy dla Fazy 5 (mapowanie `vanilla-design` -> WordPress), oparty wyłącznie o kod na dysku.

## 1. Producent -> Konsument

- Producent: `vanilla-design/` (19 plikow HTML, 6 plikow JS, 4 pliki CSS).
- Konsument: dokument mapowania fazy 5 opisujacy `HTML -> szablony WP`, `JS/CSS -> enqueue`, `dane -> Woo/ACF/CPT`.

## 2. Inwentaryzacja artefaktow producenta

### 2.1 Strony HTML (19)

`blog-post.html`, `blog.html`, `bony.html`, `dokumenty.html`, `index.html`, `kasa.html`, `kontakt.html`, `koszyk.html`, `newsletter.html`, `oboz.html`, `obozy-junior.html`, `obozy-kids.html`, `obozy.html`, `partnerzy.html`, `prywatnosc.html`, `regulamin.html`, `trener.html`, `zasady-newslettera.html`, `zespol.html`.

### 2.2 JavaScript (6)

`js/accordion.js`, `js/aura.js`, `js/cart.js`, `js/embeds.js`, `js/klaro.config.js`, `js/voucher.js`.

### 2.3 CSS (4)

`css/tokens.css`, `css/base.css`, `css/components.css`, `css/pages.css`.

## 3. Literały kontraktowe (przepisane z kodu)

### 3.1 Klucze storage/cookie

- `tr_prefs_v1`
- `tr_user_v1`
- `tr_aura_seed`
- `tr_aura_day`
- `aura_unmeasured`
- `tr_cart_v1`
- `aura_klaro`

### 3.2 Literały domenowe Aury/Klaro

- Stany: `unmeasured`, `ephemeral`, `recognised`, `linked`
- Presety: `smooth`, `balanced`, `sanctuary`
- Usługi zgody: `ga4-essential`, `ga4-analytics`, `youtube`, `osm`, `whatsapp`, `gravity-forms`
- Event synchronizacji: `aura:klaro-change`

### 3.3 Literały kontaktowe

- `+48500152300`
- `48500152300`

## 4. Ksztalt danych (skomentowany JSON)

```jsonc
// localStorage['tr_prefs_v1']
{
  "contactChannel": "auto", // 'auto' | 'phone' | 'whatsapp'
  "youtube": "ask",         // 'auto' | 'ask'
  "maps": "osm",            // 'osm' | 'google'
  "consent": {
    "analytics": false,
    "personalization": false,
    "marketing": false
  }
}
```

```jsonc
// localStorage['tr_user_v1']
{
  "name": "Jan",
  "email": "jan@example.com"
}
```

```jsonc
// localStorage['tr_aura_day']
{
  "d": "2026-06-30", // YYYY-MM-DD
  "seed": 123456789
}
```

```jsonc
// cookie 'aura_klaro' (JSON stringify + encodeURIComponent)
{
  "ga4-essential": true,
  "ga4-analytics": false,
  "youtube": false,
  "osm": false,
  "whatsapp": false,
  "gravity-forms": false
}
```

```jsonc
// localStorage['tr_cart_v1'] = Array<CartItem>
[
  {
    "key": "camp-...",      // required
    "type": "camp",         // required
    "title": "...",         // required
    "price": 1999,            // required
    "qty": 1,                 // required
    "sub": "...",           // optional
    "image": "assets/..."   // optional
  },
  {
    "key": "voucher-...",   // required
    "type": "voucher",      // required
    "title": "Bon ...",     // required
    "price": 500,             // required
    "qty": 1,                 // required
    "sub": "Wersja ...",    // optional
    "voucherTheme": "warm"  // optional; uzywane dla type='voucher'
  }
]
```

## 5. Pola opcjonalne i warunki

- `tr_user_v1` moze byc `null` (uzytkownik niezalogowany w makiecie).
- `tr_aura_day` moze nie istniec lub miec inna date (`d`) niz dzisiejsza; wtedy generowany jest nowy `seed`.
- `tr_aura_seed` moze nie istniec; jest tworzone leniwie.
- W `tr_cart_v1`: `sub`, `image`, `voucherTheme` sa opcjonalne zaleznie od typu pozycji.
- `data-open` i `data-title` w embedach sa opcjonalne; fallback jest obslugiwany w `embeds.js`.

## 6. Sygnatury helperow do reuzycia

### `vanilla-design/js/aura.js`

- `rng(seed)`
- `auraIdentity(seed)`
- `readPrefs()`
- `writePrefs(p)`
- `readUser()`
- `getState()`
- `seedFor(state)`
- `suspendedCount()`

### `vanilla-design/js/cart.js`

- `zl(n)`
- `voucherArt(theme, amount, recipient, custom)`
- `read()`
- `add(item)`
- `remove(key)`
- `setQty(key, qty)`
- `clear()`

### `vanilla-design/js/klaro.config.js`

- `consents()`
- `setConsent(name, on)`
- `optOutAll()`
- `saveAndApply()`

### `vanilla-design/js/embeds.js`

- `consent(svc)`
- `paint()`

## 7. Czy istnieje juz kod robiacy Faze 5?

- Tak: istnieje szkic dokumentu `ground-truth-faza5.md` (ten plik).
- Nie: brak oddzielnego, finalnego dokumentu mapowania fazy 5 w formie docelowej artefaktu.
- Nie: brak implementacji WP (foldery `tatrarunning-theme`, `tatrarunning-core`, `tatrarunning-aura` sa puste).

## 8. Rozbieznosci z planem wykryte na starcie

- W producerze nie ma pliku `dodaj-oboz.html`.
- W producerze jest `js/voucher.js`, ktory musi byc uwzgledniony w mapowaniu.
