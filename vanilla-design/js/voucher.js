/* ============================================================
   BONY — konfigurator bonu (live preview + add to cart).
   Odwzorowanie BonyPage z React: kwota / szablon / dedykacja / forma.
   ============================================================ */
(function () {
  'use strict';
  var root = document.getElementById('amt-grid');
  if (!root) return; // tylko strona bonów

  var state = { amount: 500, custom: '', theme: 'warm', recipient: '', message: '', delivery: 'digital' };
  var zl = window.zl || function (n) { return n + ' zł'; };

  var customWrap = document.getElementById('cfg-custom');
  var customIn = document.getElementById('amt-custom');
  var artBox = document.getElementById('v-art');
  var msgEl = document.getElementById('v-msg');
  var totalEl = document.getElementById('v-total');
  var buyBtn = document.getElementById('v-buy');
  var addBtn = document.getElementById('v-add');
  var delNote = document.getElementById('v-delivery-note');

  function value() {
    return state.amount === 'custom' ? Math.max(0, parseInt(state.custom || '0', 10)) : state.amount;
  }
  function valid() { return value() >= 50; }

  function render() {
    var isCustom = state.amount === 'custom';
    var v = value();
    if (artBox && window.TRCart) {
      artBox.innerHTML = window.TRCart.voucherArt(state.theme, v, state.recipient, isCustom && !v);
    }
    if (msgEl) {
      if (state.message) { msgEl.hidden = false; msgEl.textContent = '„' + state.message + '"'; }
      else { msgEl.hidden = true; }
    }
    if (totalEl) totalEl.textContent = valid() ? zl(v) : '—';
    if (buyBtn) { buyBtn.textContent = 'Kup teraz' + (valid() ? ' — ' + zl(v) : ''); buyBtn.disabled = !valid(); buyBtn.style.opacity = valid() ? '' : '.5'; }
    if (addBtn) { addBtn.disabled = !valid(); addBtn.style.opacity = valid() ? '' : '.5'; }
  }

  root.querySelectorAll('.amt-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.amt-btn').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      var a = b.dataset.amt;
      state.amount = a === 'custom' ? 'custom' : parseInt(a, 10);
      if (customWrap) customWrap.hidden = a !== 'custom';
      render();
    });
  });
  if (customIn) customIn.addEventListener('input', function () { state.custom = customIn.value; render(); });

  document.querySelectorAll('#tpl-grid .tpl-btn').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('#tpl-grid .tpl-btn').forEach(function (x) { x.classList.remove('sel'); });
      t.classList.add('sel'); state.theme = t.dataset.theme; render();
    });
  });
  var rec = document.getElementById('v-recipient'); if (rec) rec.addEventListener('input', function () { state.recipient = rec.value; render(); });
  var msg = document.getElementById('v-message'); if (msg) msg.addEventListener('input', function () { state.message = msg.value; render(); });

  document.querySelectorAll('#v-delivery button').forEach(function (d) {
    d.addEventListener('click', function () {
      document.querySelectorAll('#v-delivery button').forEach(function (x) { x.classList.remove('sel'); });
      d.classList.add('sel'); state.delivery = d.dataset.del;
      if (delNote) delNote.textContent = state.delivery === 'digital'
        ? 'Bon w formacie PDF wyślemy na e-mail od razu po zakupie — gotowy do wydruku lub przesłania dalej.'
        : 'Elegancką kartę podarunkową wyślemy kurierem (1–2 dni robocze). Koszt wysyłki gratis.';
    });
  });

  function addVoucher(go) {
    if (!valid() || !window.TRCart) return;
    var v = value();
    window.TRCart.add({
      key: 'voucher-' + state.theme + '-' + v + '-' + state.delivery + '-' + (state.recipient || 'x') + '-' + Date.now(),
      type: 'voucher', title: 'Bon podarunkowy — ' + zl(v),
      sub: (state.delivery === 'digital' ? 'Wersja cyfrowa (PDF)' : 'Wersja fizyczna (karta)') + (state.recipient ? ' · dla ' + state.recipient : ''),
      price: v, qty: 1, voucherTheme: state.theme
    });
    if (go) location.href = 'koszyk.html';
  }
  if (buyBtn) buyBtn.addEventListener('click', function () { addVoucher(true); });
  if (addBtn) addBtn.addEventListener('click', function () { addVoucher(false); });

  render();
})();
