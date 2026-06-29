/* ============================================================
   CART — makieta koszyka (localStorage); odwzorowanie useCart z React.
   Spina funnel: dodawanie (obozy/bony) → drawer (koszyk) → kasa.
   ============================================================ */
(function () {
  'use strict';

  var LS_KEY = 'tr_cart_v1';

  /* ---------- formatter (odpowiednik zl()) ---------- */
  function zl(n) {
    return new Intl.NumberFormat('pl-PL').format(Math.round(n || 0)) + ' zł';
  }

  /* ---------- voucher art (odpowiednik VoucherArt) ---------- */
  var VOUCHER_THEMES = {
    warm: { vc: '#F65824', bg: 'assets/home-hero.webp' },
    cool: { vc: '#2f6f9e', bg: 'assets/team-2.webp' },
    folk: { vc: '#c2362b', bg: 'assets/team-1.webp' }
  };
  function voucherArt(theme, amount, recipient, custom) {
    var t = VOUCHER_THEMES[theme] || VOUCHER_THEMES.warm;
    var amt = custom && !amount ? '— —' : new Intl.NumberFormat('pl-PL').format(amount || 0);
    return '' +
      '<div class="voucher voucher--cqw" style="--vc:' + t.vc + '">' +
      '<div class="voucher__bg"><img src="' + t.bg + '" alt="" /></div>' +
      '<div class="voucher__shade"></div>' +
      '<div class="voucher__inner">' +
      '<div class="voucher__top"><span class="logo-tile"><img src="assets/logo.webp" alt="Tatra Running" /></span>' +
      '<span class="voucher__kicker">Bon<br/>podarunkowy</span></div>' +
      '<div>' + (recipient ? '<div class="voucher__ded">Dla ' + esc(recipient) + '</div>' : '') +
      '<div class="voucher__amt" style="color:' + (amount ? '#fff' : 'rgba(255,255,255,.6)') + '">' + amt + '<small>PLN</small></div>' +
      '<div class="voucher__brand">Obozy · Treningi · Skitury</div></div></div>' +
      '<div class="voucher__stripe"><i></i></div></div>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- store ---------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch (e) {}
  }
  function count() { return read().reduce(function (s, x) { return s + x.qty; }, 0); }
  function total() { return read().reduce(function (s, x) { return s + x.price * x.qty; }, 0); }

  function add(item) {
    var items = read();
    var i = items.findIndex(function (x) { return x.key === item.key; });
    if (i >= 0) { items[i].qty += item.qty || 1; }
    else { items.push(Object.assign({ qty: 1 }, item)); }
    write(items);
    render();
  }
  function remove(key) { write(read().filter(function (x) { return x.key !== key; })); render(); }
  function setQty(key, qty) {
    write(read().map(function (x) { return x.key === key ? Object.assign({}, x, { qty: Math.max(1, qty) }) : x; }));
    render();
  }
  function clear() { write([]); render(); }

  /* ---------- render: badge ---------- */
  function renderBadge() {
    var c = count();
    document.querySelectorAll('.cart-btn').forEach(function (btn) {
      var b = btn.querySelector('.cart-badge');
      if (c > 0) {
        if (!b) { b = document.createElement('span'); b.className = 'cart-badge'; btn.appendChild(b); }
        b.textContent = c;
        btn.setAttribute('aria-label', 'Koszyk, ' + c + ' pozycji');
      } else if (b) { b.remove(); btn.setAttribute('aria-label', 'Koszyk, 0 pozycji'); }
    });
  }

  /* ---------- render: line item ---------- */
  function lineItem(it) {
    var media = it.type === 'voucher'
      ? voucherArt(it.voucherTheme, it.price, '', false)
      : '<img src="' + (it.image || 'assets/team-2.webp') + '" alt="" style="width:100%;height:100%;object-fit:cover" />';
    return '' +
      '<div class="line-item" data-key="' + esc(it.key) + '">' +
      '<div class="line-item__media">' + media + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<b style="overflow:hidden;text-overflow:ellipsis">' + esc(it.title) + '</b>' +
      (it.sub ? '<div class="sub">' + esc(it.sub) + '</div>' : '') +
      '<div class="line-item__bottom">' +
      '<div class="line-qty">' +
      '<button data-act="dec" aria-label="Mniej">–</button><span>' + it.qty + '</span>' +
      '<button data-act="inc" aria-label="Więcej">+</button></div>' +
      '<span class="line-price">' + zl(it.price * it.qty) + '</span></div>' +
      '<button class="line-remove" data-act="rm">Usuń</button></div></div>';
  }

  /* ---------- render: koszyk drawer ---------- */
  function renderKoszyk() {
    var aside = document.querySelector('main .drawer');
    if (!aside) return;
    var items = read();
    var head = '<div class="drawer__head"><h3>Koszyk' + (items.length ? ' (' + count() + ')' : '') + '</h3>' +
      '<a href="index.html" class="drawer__close" aria-label="Zamknij koszyk"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></svg></a></div>';
    if (!items.length) {
      aside.innerHTML = head +
        '<div class="drawer__body"><div class="drawer__empty">' +
        '<div class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg></div>' +
        '<p style="font-weight:700;color:var(--ink);margin-bottom:6px">Twój koszyk jest pusty</p>' +
        '<p style="font-size:14px">Dodaj obóz lub bon podarunkowy, by kontynuować.</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">' +
        '<a href="obozy.html" class="btn btn--ink btn--block">Przeglądaj obozy</a>' +
        '<a href="bony.html" class="btn btn--ghost btn--block">Kup bon</a></div></div></div>';
      return;
    }
    aside.innerHTML = head +
      '<div class="drawer__body">' + items.map(lineItem).join('') + '</div>' +
      '<div class="drawer__foot"><div class="drawer__total"><span style="color:var(--muted)">Razem</span>' +
      '<span class="t">' + zl(total()) + '</span></div>' +
      '<a href="kasa.html" class="btn btn--accent btn--block btn--lg">Przejdź do kasy</a>' +
      '<p style="text-align:center;font-size:12.5px;color:var(--muted);margin-top:12px">Bezpieczna płatność · BLIK · Przelewy24</p></div>';
  }

  /* ---------- render: kasa ---------- */
  var PAY = [
    { id: 'blik', name: 'BLIK', badges: ['BLIK'] },
    { id: 'p24', name: 'Przelewy24', badges: ['P24', 'VISA', 'MC'] },
    { id: 'transfer', name: 'Przelew tradycyjny', badges: ['IBAN'] }
  ];
  function renderKasa() {
    var root = document.querySelector('main[data-page="kasa"]');
    if (!root) return;
    var items = read();
    if (!items.length) return; // pusty stan = statyczny markup
    root.innerHTML = '' +
      '<section class="page-hero"><div class="wrap wrap--wide"><div class="breadcrumb">' +
      '<a href="index.html">Home</a><span>›</span><a href="koszyk.html">Koszyk</a><span>›</span><span>Kasa</span></div>' +
      '<div class="eyebrow">Kasa</div><h1>Finalizacja zamówienia</h1></div></section>' +
      '<section class="section" style="padding-top:8px"><div class="wrap wrap--wide">' +
      '<form class="co-grid" id="co-form"><div>' +
      '<div class="co-card"><h3>Dane kontaktowe</h3><p class="hint">Na ten adres wyślemy potwierdzenie i ewentualny bon w PDF.</p>' +
      '<div class="cfg-row2"><div class="field"><label>Imię</label><input class="cfg-input" required placeholder="Jan" /></div>' +
      '<div class="field"><label>Nazwisko</label><input class="cfg-input" required placeholder="Kowalski" /></div></div>' +
      '<div class="cfg-row2"><div class="field"><label>E-mail</label><input class="cfg-input" type="email" required placeholder="jan@example.com" /></div>' +
      '<div class="field"><label>Telefon</label><input class="cfg-input" required placeholder="500 100 200" /></div></div></div>' +
      '<div class="co-card"><h3>Metoda płatności</h3><p class="hint">Płatność obsługiwana przez bezpieczną bramkę.</p>' +
      PAY.map(function (p, i) {
        return '<label class="pay-opt' + (i === 0 ? ' sel' : '') + '"><input type="radio" name="pay" value="' + p.id + '"' + (i === 0 ? ' checked' : '') + ' />' +
          '<span class="pay-name">' + p.name + '</span><span class="pay-logo">' + p.badges.map(function (b) { return '<span class="pay-badge">' + b + '</span>'; }).join('') + '</span></label>';
      }).join('') + '</div></div>' +
      '<aside class="co-aside"><div class="co-card" style="margin-bottom:0"><h3 style="margin-bottom:16px">Twoje zamówienie</h3>' +
      items.map(function (it) { return '<div class="summary-line"><span style="max-width:70%">' + it.qty + '× ' + esc(it.title) + '</span><b style="color:var(--ink)">' + zl(it.price * it.qty) + '</b></div>'; }).join('') +
      '<div class="summary-line"><span>Dostawa</span><b style="color:var(--ink)">0 zł</b></div>' +
      '<div class="summary-total"><span>Razem</span><span>' + zl(total()) + '</span></div>' +
      '<button type="submit" class="btn btn--accent btn--block btn--lg" style="margin-top:18px">Zapłać ' + zl(total()) + '</button>' +
      '<div class="trust-row" style="justify-content:center;margin-top:14px"><span>Bezpieczna płatność</span><span>Faktura VAT</span></div>' +
      '</div></aside></form></div></section>';
    var form = root.querySelector('#co-form');
    form.querySelectorAll('.pay-opt').forEach(function (lbl) {
      lbl.addEventListener('click', function () { form.querySelectorAll('.pay-opt').forEach(function (l) { l.classList.remove('sel'); }); lbl.classList.add('sel'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var order = 'TR-' + Math.floor(100000 + Math.random() * 899999);
      var sum = total();
      clear();
      root.innerHTML = '<div class="wrap"><div class="success"><div class="success__check"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6" /></svg></div>' +
        '<div class="eyebrow" style="text-align:center">Dziękujemy!</div><h1 style="margin-top:12px">Zamówienie przyjęte</h1>' +
        '<p class="lead" style="margin-top:16px">Potwierdzenie wysłaliśmy na Twój e-mail.</p>' +
        '<div class="order-box"><div class="summary-line"><span>Numer zamówienia</span><b style="color:var(--ink)">' + order + '</b></div>' +
        '<div class="summary-line"><span>Kwota</span><b style="color:var(--ink)">' + zl(sum) + '</b></div></div>' +
        '<a href="index.html" class="btn btn--ink btn--lg">Wróć na stronę główną</a></div></div>';
      window.scrollTo({ top: 0 });
    });
  }

  /* ---------- delegated drawer actions ---------- */
  document.addEventListener('click', function (e) {
    var li = e.target.closest('.line-item');
    if (!li) return;
    var key = li.getAttribute('data-key');
    var act = e.target.closest('[data-act]');
    if (!act) return;
    var a = act.getAttribute('data-act');
    var it = read().find(function (x) { return x.key === key; });
    if (!it) return;
    if (a === 'inc') setQty(key, it.qty + 1);
    else if (a === 'dec') setQty(key, it.qty - 1);
    else if (a === 'rm') remove(key);
  });

  /* ---------- camp add buttons ---------- */
  function bindCampButtons() {
    document.querySelectorAll('[data-add-camp]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        add({
          key: btn.dataset.key, type: 'camp', title: btn.dataset.title,
          sub: btn.dataset.sub, price: parseInt(btn.dataset.price, 10), qty: 1, image: btn.dataset.image
        });
      });
    });
  }

  function render() { renderBadge(); renderKoszyk(); renderKasa(); }

  window.TRCart = { add: add, remove: remove, setQty: setQty, clear: clear, count: count, total: total, read: read, zl: zl, voucherArt: voucherArt, render: render };
  window.zl = zl;

  document.addEventListener('DOMContentLoaded', function () { bindCampButtons(); render(); });
})();
