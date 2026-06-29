/* ============================================================
   KLARO — konfiguracja zgód + lekki menedżer (vanilla makieta).
   Usługi z aura.md §5.1 + dok. integracji (6). Brak required.
   Panel Aury = jedyna widoczna kontrolka; własny notice schowany.
   API: TRKlaro.consents() · setConsent · optOutAll · saveAndApply.
   Emit zdarzenia 'aura:klaro-change' → Aura/embeds odświeżają stan.
   ============================================================ */
(function () {
  'use strict';

  var COOKIE = 'aura_klaro';

  /* konfiguracja usług (teksty PL). 'default' = stan startowy */
  var SERVICES = [
    { name: 'ga4-essential', default: true, label: 'Pomiar śladu ulotnego (GA4 sandbox)' },
    { name: 'ga4-analytics', default: false, label: 'Pełna analityka (GA4 produkcja)' },
    { name: 'youtube', default: false, label: 'Filmy YouTube' },
    { name: 'osm', default: false, label: 'Mapa OpenStreetMap' },
    { name: 'whatsapp', default: false, label: 'WhatsApp' },
    { name: 'gravity-forms', default: false, label: 'Pełny formularz kontaktowy' }
  ];

  function readCookie() {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
      return m ? JSON.parse(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  }
  function writeCookie(o) {
    try { document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(o)) + ';path=/;max-age=' + (60 * 60 * 24 * 180) + ';SameSite=Lax'; } catch (e) {}
  }

  var state = (function () {
    var saved = readCookie() || {};
    var s = {};
    SERVICES.forEach(function (svc) { s[svc.name] = (svc.name in saved) ? !!saved[svc.name] : svc.default; });
    return s;
  })();

  function emit() { document.dispatchEvent(new CustomEvent('aura:klaro-change', { detail: Object.assign({}, state) })); }
  function consents() { return Object.assign({}, state); }
  function saveAndApply() { writeCookie(state); emit(); }
  function setConsent(name, on) { if (name in state) { state[name] = !!on; saveAndApply(); } }
  function optOutAll() { SERVICES.forEach(function (s) { state[s.name] = false; }); saveAndApply(); }

  window.TRKlaro = { consents: consents, setConsent: setConsent, optOutAll: optOutAll, saveAndApply: saveAndApply, SERVICES: SERVICES };
})();
