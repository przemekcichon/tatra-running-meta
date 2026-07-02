/* ============================================================
   AUTH (konto) — modal logowania / rejestracji
   Samodzielny modul konta (mock, front-only). Progressive enhancement:
   przycisk konta `.acct-btn` w headerze pozostaje linkiem do
   kontakt.html (fallback bez JS); z JS klik otwiera modal.
   Docelowo w WP: WooCommerce My Account.
   ============================================================ */
(function () {
  'use strict';

  var USER_KEY = 'tr_user_v1';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var modalEl = null;
  var modalEscFn = null;
  var modalReturnFocusEl = null;

  function authHTML(mode) {
    var isReg = mode === 'register';
    var logoEl = document.querySelector('.brand__logo');
    var logoSrc = logoEl ? logoEl.src : 'assets/logo.webp';
    var closeX = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
    var arrowR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    var shieldI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    var nameField = isReg ? '<label class="field"><span>Imię i nazwisko</span><input id="auth-name" class="cfg-input" type="text" placeholder="Jan Kowalski" autocomplete="given-name" required></label>' : '';
    var forgotLnk = !isReg ? '<a class="auth-forgot" href="#" data-auth="auth-forgot">Nie pamiętasz hasła?</a>' : '';
    var altMode = isReg ? 'login' : 'register';
    return '<div class="modal-scrim" data-auth="scrim">'
      + '<div class="modal modal--auth" role="dialog" aria-modal="true" aria-label="' + (isReg ? 'Rejestracja' : 'Logowanie') + '">'
      + '<button class="modal__x" data-auth="close" aria-label="Zamknij">' + closeX + '</button>'
      + '<div class="auth-head">'
      + '<img class="auth-logo" src="' + escapeHtml(logoSrc) + '" alt="Tatra Running">'
      + '<h3>' + (isReg ? 'Załóż konto' : 'Zaloguj się') + '</h3>'
      + '<p>' + (isReg ? 'Szybciej rezerwuj obozy i miej swoje wyjazdy w jednym miejscu.' : 'Witaj z powrotem w górach.') + '</p>'
      + '</div>'
      + '<div class="auth-tabs" role="tablist" aria-label="Tryb logowania">'
      + '<button type="button" class="' + (!isReg ? 'is-on' : '') + '" data-auth="auth-tab" data-mode="login" role="tab" aria-selected="' + (!isReg) + '" tabindex="' + (!isReg ? '0' : '-1') + '">Logowanie</button>'
      + '<button type="button" class="' + (isReg ? 'is-on' : '') + '" data-auth="auth-tab" data-mode="register" role="tab" aria-selected="' + isReg + '" tabindex="' + (isReg ? '0' : '-1') + '">Rejestracja</button>'
      + '</div>'
      + '<form class="auth-form" data-auth="auth-form">'
      + nameField
      + '<label class="field"><span>Adres e-mail</span><input id="auth-email" class="cfg-input" type="email" placeholder="jan@example.com" autocomplete="email" required></label>'
      + '<label class="field"><span>Hasło</span><input id="auth-pass" class="cfg-input" type="password" placeholder="••••••••" autocomplete="' + (isReg ? 'new-password' : 'current-password') + '" required minlength="4"></label>'
      + forgotLnk
      + '<button type="submit" class="btn btn--accent btn--block btn--lg" style="margin-top:6px">' + (isReg ? 'Utwórz konto' : 'Zaloguj się') + ' ' + arrowR + '</button>'
      + '<p class="auth-alt">' + (isReg ? 'Masz już konto? ' : 'Nie masz konta? ') + '<button type="button" data-auth="auth-switch" data-mode="' + altMode + '">' + (isReg ? 'Zaloguj się' : 'Załóż je') + '</button></p>'
      + '</form>'
      + '<p class="auth-note">' + shieldI + ' Demonstracja interfejsu — dane nie są nigdzie wysyłane.</p>'
      + '</div></div>';
  }

  function closeModal() {
    if (modalEl) { modalEl.remove(); modalEl = null; document.body.style.overflow = ''; }
    if (modalEscFn) { document.removeEventListener('keydown', modalEscFn); modalEscFn = null; }
    if (modalReturnFocusEl && typeof modalReturnFocusEl.focus === 'function') { try { modalReturnFocusEl.focus(); } catch (e) {} }
    modalReturnFocusEl = null;
  }

  function openLogin(mode) {
    modalReturnFocusEl = document.querySelector('.acct-btn') || document.activeElement;
    closeModal();
    document.body.insertAdjacentHTML('beforeend', authHTML(mode || 'login'));
    modalEl = document.body.lastElementChild;
    document.body.style.overflow = 'hidden';
    modalEscFn = function (e) { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', modalEscFn);
    var focusEl = modalEl && modalEl.querySelector(mode === 'register' ? '#auth-name' : '#auth-email');
    if (!focusEl) focusEl = modalEl && modalEl.querySelector('.modal__x');
    if (focusEl && typeof focusEl.focus === 'function') { try { focusEl.focus(); } catch (e) {} }
  }

  /* Wyzwalacz: przycisk konta w headerze (link -> modal). */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.acct-btn, [data-auth-open]');
    if (trigger) { e.preventDefault(); openLogin('login'); return; }

    var t = e.target.closest('[data-auth]');
    if (!t) return;
    var k = t.getAttribute('data-auth');
    if (k === 'close' || k === 'scrim') {
      if (k === 'scrim' && e.target !== t) return;
      closeModal();
    } else if (k === 'auth-tab' || k === 'auth-switch') {
      var nm = t.getAttribute('data-mode');
      closeModal();
      openLogin(nm);
    } else if (k === 'auth-forgot') {
      e.preventDefault();
    }
  });

  document.addEventListener('submit', function (e) {
    if (!e.target.matches('[data-auth="auth-form"]')) return;
    e.preventDefault();
    var nameEl = e.target.querySelector('#auth-name');
    var emailEl = e.target.querySelector('#auth-email');
    var em = emailEl ? emailEl.value.trim() : '';
    var n = (nameEl && nameEl.value.trim()) || em.split('@')[0] || 'Gość';
    try { localStorage.setItem(USER_KEY, JSON.stringify({ name: n, email: em })); } catch (ex) {}
    closeModal();
  });

  window.TRAuth = { open: openLogin, close: closeModal };
})();
