# Ground-truth Faza 5 (TYLKO ODCZYT)

Cel: kontrakt wejściowy dla Fazy 5 (mapowanie `vanilla-design` -> WordPress), oparty wyłącznie o kod na dysku.

## 1. Producent -> Konsument

- Producent: `vanilla-design/` (19 plikow HTML, 3 pliki JS, 4 pliki CSS).
- Konsument: dokument mapowania fazy 5 opisujacy `HTML -> szablony WP`, `JS/CSS -> enqueue`, `dane -> Woo/ACF/CPT`.

## 2. Inwentaryzacja artefaktow producenta

### 2.1 Strony HTML (19)

`blog-post.html`, `blog.html`, `bony.html`, `dokumenty.html`, `index.html`, `kasa.html`, `kontakt.html`, `koszyk.html`, `newsletter.html`, `oboz.html`, `obozy-junior.html`, `obozy-kids.html`, `obozy.html`, `partnerzy.html`, `prywatnosc.html`, `regulamin.html`, `trener.html`, `zasady-newslettera.html`, `zespol.html`.

### 2.2 JavaScript (3)

`js/accordion.js`, `js/cart.js`, `js/voucher.js`.

### 2.3 CSS (4)

`css/tokens.css`, `css/base.css`, `css/components.css`, `css/pages.css`.

## 3. Literały kontraktowe (przepisane z kodu)

### 3.1 Klucze storage/cookie

- `tr_cart_v1`

### 3.2 Literały kontaktowe

- `+48500152300`
- `48500152300`

## 4. Ksztalt danych (skomentowany JSON)

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

- W `tr_cart_v1`: `sub`, `image`, `voucherTheme` sa opcjonalne zaleznie od typu pozycji.

## 6. Sygnatury helperow do reuzycia

### `vanilla-design/js/cart.js`

- `zl(n)`
- `voucherArt(theme, amount, recipient, custom)`
- `read()`
- `add(item)`
- `remove(key)`
- `setQty(key, qty)`
- `clear()`

## 7. Czy istnieje juz kod robiacy Faze 5?

- Tak: istnieje szkic dokumentu `ground-truth-faza5.md` (ten plik).
- Nie: brak oddzielnego, finalnego dokumentu mapowania fazy 5 w formie docelowej artefaktu.
- Nie: brak implementacji WP (foldery `tatrarunning-theme`, `tatrarunning-core` sa puste).

## 8. Rozbieznosci z planem wykryte na starcie

- W producerze nie ma pliku `dodaj-oboz.html`.
- W producerze jest `js/voucher.js`, ktory musi byc uwzgledniony w mapowaniu.
