/* ============================================================
   MENU MOBILNE — otwieranie / zamykanie overlaya (.mm-overlay)
   Port z react-design/chrome.jsx (MobileMenu). Progressive
   enhancement: burger to <a href="#mobile-menu"> (fallback bez JS
   przewija do overlaya); z JS klik przelacza atrybut `hidden`.
   ============================================================ */
(function () {
  'use strict';

  var overlay = document.getElementById('mobile-menu');
  if (!overlay) return;

  var opener = document.querySelector('a.burger[href="#mobile-menu"]');

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (opener) opener.setAttribute('aria-expanded', 'true');
    var closeBtn = overlay.querySelector('.mm-top .burger');
    if (closeBtn && typeof closeBtn.focus === 'function') { try { closeBtn.focus(); } catch (e) {} }
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.setAttribute('aria-expanded', 'false');
    if (opener && typeof opener.focus === 'function') { try { opener.focus(); } catch (e) {} }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('a.burger[href="#mobile-menu"]')) { e.preventDefault(); open(); return; }
    if (e.target.closest('#mobile-menu .mm-top .burger')) { e.preventDefault(); close(); return; }
    /* klik w link nawigacyjny lub akcje w stopce menu -> zamknij overlay */
    if (!overlay.hidden && e.target.closest('#mobile-menu a[href]:not(.burger), #mobile-menu .mm-acct button')) {
      close();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
})();
