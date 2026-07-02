/* ============================================================
   BOOKING — panel rezerwacji obozu (single obozu)
   Port z react-design/pages-camp.jsx (BookingCard). Na mobile
   panel to dolny "sheet": uchwyt `.booking__grab` rozwija/zwija
   szczegoly (klasa `.is-open` + scrim), a przyciski qty przeliczaja
   zaliczke/reszte. Dodawanie do koszyka obsluguje cart.js
   (czyta `data-qty`); tu tylko zamykamy sheet po dodaniu.
   ============================================================ */
(function () {
  'use strict';

  var sheet = document.querySelector('.booking--sheet');
  if (!sheet) return;

  var mq = window.matchMedia('(max-width: 760px)');
  var scrim = null;

  /* ---------- rozwijanie / zwijanie (mobile) ---------- */
  var grab = sheet.querySelector('.booking__grab');
  var hintTxt = sheet.querySelector('.booking__hint-txt');

  function openSheet() {
    sheet.classList.add('is-open');
    if (grab) grab.setAttribute('aria-expanded', 'true');
    if (hintTxt) hintTxt.textContent = 'Zwiń szczegóły';
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'booking__scrim';
      scrim.addEventListener('click', closeSheet);
      document.body.appendChild(scrim);
    }
  }
  function closeSheet() {
    sheet.classList.remove('is-open');
    if (grab) grab.setAttribute('aria-expanded', 'false');
    if (hintTxt) hintTxt.textContent = 'Przeciągnij, aby zobaczyć szczegóły';
    if (scrim) { scrim.remove(); scrim = null; }
  }
  function toggleSheet() { sheet.classList.contains('is-open') ? closeSheet() : openSheet(); }

  if (grab) {
    grab.addEventListener('click', toggleSheet);

    /* gest przeciagniecia (mobile): w gore = rozwin, w dol = zwin.
       maly ruch traktujemy jak tap -> obsluguje handler click powyzej */
    var startY = null;
    grab.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
    }, { passive: true });
    grab.addEventListener('touchend', function (e) {
      if (startY === null) return;
      var endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : startY;
      var dy = endY - startY;
      startY = null;
      if (dy < -40) { e.preventDefault(); openSheet(); }        /* swipe up */
      else if (dy > 40) { e.preventDefault(); closeSheet(); }   /* swipe down */
    }, { passive: false });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  mq.addEventListener('change', function () { if (!mq.matches) closeSheet(); });

  /* ---------- liczba osob + przeliczenie zaliczki ---------- */
  var deposit = parseInt(sheet.getAttribute('data-deposit'), 10) || 0;
  var full = parseInt(sheet.getAttribute('data-full'), 10) || 0;
  var qtyWrap = sheet.querySelector('.qty');
  var qty = 1;

  function zl(n) { return new Intl.NumberFormat('pl-PL').format(n) + ' zł'; }

  function render() {
    if (qtyWrap) {
      var span = qtyWrap.querySelector('span');
      if (span) span.textContent = qty + ' ' + (qty === 1 ? 'osoba' : 'osoby');
      var qbtns = qtyWrap.querySelectorAll('button');
      if (qbtns[0]) qbtns[0].disabled = qty <= 1;
    }
    var depB = sheet.querySelector('.book-deposit__row b');
    if (depB && deposit) depB.textContent = zl(deposit * qty);
    var restEl = sheet.querySelector('.book-deposit__row--mut span:last-child');
    if (restEl && full) restEl.textContent = zl((full - deposit) * qty);
    var cta = sheet.querySelector('.booking__cta-desktop');
    if (cta && deposit) cta.textContent = 'Zarezerwuj — zaliczka ' + zl(deposit * qty);
    sheet.querySelectorAll('[data-add-camp]').forEach(function (b) { b.dataset.qty = String(qty); });
  }

  if (qtyWrap) {
    var qbtns = qtyWrap.querySelectorAll('button');
    if (qbtns[0]) qbtns[0].addEventListener('click', function () { if (qty > 1) { qty--; render(); } });
    if (qbtns[1]) qbtns[1].addEventListener('click', function () { if (qty < 10) { qty++; render(); } });
  }
  render();
})();
