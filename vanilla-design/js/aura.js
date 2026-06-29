/* ============================================================
   AURA — wzorzec obecności (vanilla). Port z react-design/account.jsx.
   Cztery stany (aura.md §1): unmeasured · ephemeral · recognised · linked.
   Orb w headerze (.acct), panel obecności, awatar seeded RNG → SVG.
   Język: nigdy "anonimowy" (aura.md §6). Współpraca z TRKlaro (klaro.config.js).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- literały portowane z account.jsx ---------- */
  var PHONE_E164 = '+48500152300';
  var WA_NUMBER = '48500152300';
  var PREFS_KEY = 'tr_prefs_v1';
  var USER_KEY = 'tr_user_v1';
  var SEED_KEY = 'tr_aura_seed';     // trwały (recognised/linked)
  var DAY_KEY = 'tr_aura_day';       // dobowy (ephemeral) {d, seed}
  var UNMEASURED_KEY = 'aura_unmeasured';

  var DEFAULT_PREFS = {
    contactChannel: 'auto',   // 'auto' | 'phone' | 'whatsapp'
    youtube: 'ask',           // 'auto' | 'ask'
    maps: 'osm',              // 'osm' | 'google'
    consent: { analytics: false, personalization: false, marketing: false }
  };

  var AURA_HUES = [22, 36, 48, 96, 128, 152, 205, 14];
  var ADJ = ['Wędrowny', 'Spokojny', 'Szybki', 'Cichy', 'Górski', 'Wytrwały', 'Dziki', 'Mglisty', 'Słoneczny', 'Zwinny', 'Śmiały', 'Leśny', 'Poranny', 'Czujny', 'Wieczorny', 'Szczęśliwy'];
  var ANIMAL = ['Świstak', 'Ryś', 'Niedźwiedź', 'Orzeł', 'Jeleń', 'Borsuk', 'Lis', 'Sokół', 'Głuszec', 'Wilk', 'Kozioł', 'Pomurnik', 'Zając', 'Jastrząb', 'Bóbr', 'Łoś'];

  /* presety — nazwy z aura.md §3.1 (klimat tatrarunning) */
  var PRESETS = {
    smooth: { contactChannel: 'whatsapp', youtube: 'auto', maps: 'osm' },
    balanced: { contactChannel: 'auto', youtube: 'ask', maps: 'osm' },
    sanctuary: { contactChannel: 'phone', youtube: 'ask', maps: 'google' }
  };
  var PRESET_META = [
    { id: 'smooth', label: 'Na lekko', sub: 'Wszystko włączone' },
    { id: 'balanced', label: 'Szlakiem', sub: 'Wyważony, domyślny' },
    { id: 'sanctuary', label: 'Schronisko', sub: 'Nic ekstra' }
  ];

  /* ---------- RNG + tożsamość (1:1 z account.jsx) ---------- */
  function rng(seed) {
    var t = (seed + 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function auraIdentity(seed) {
    var a = ADJ[Math.floor(rng(seed) * ADJ.length)];
    var an = ANIMAL[Math.floor(rng(seed * 7 + 13) * ANIMAL.length)];
    var tag = Math.floor(rng(seed * 3 + 5) * 0x10000).toString(16).toUpperCase().padStart(4, '0');
    var hue = AURA_HUES[Math.floor(rng(seed * 11 + 2) * AURA_HUES.length)];
    return { name: a + ' ' + an, tag: tag, hue: hue };
  }

  /* ---------- storage ---------- */
  function readPrefs() {
    try {
      var s = JSON.parse(localStorage.getItem(PREFS_KEY));
      return s ? Object.assign({}, DEFAULT_PREFS, s, { consent: Object.assign({}, DEFAULT_PREFS.consent, s.consent || {}) }) : DEFAULT_PREFS;
    } catch (e) { return DEFAULT_PREFS; }
  }
  function writePrefs(p) { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) {} }
  function readUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch (e) { return null; } }
  function isUnmeasured() { return localStorage.getItem(UNMEASURED_KEY) === '1'; }
  function setUnmeasured(on) {
    try { on ? localStorage.setItem(UNMEASURED_KEY, '1') : localStorage.removeItem(UNMEASURED_KEY); } catch (e) {}
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  /* trwały seed (stany 2–3) */
  function persistentSeed() {
    try { var s = parseInt(localStorage.getItem(SEED_KEY), 10); if (s) return s; } catch (e) {}
    var n = Math.floor(Math.random() * 1e9);
    try { localStorage.setItem(SEED_KEY, String(n)); } catch (e) {}
    return n;
  }
  /* dobowy seed (stan 1) — reset 24 h */
  function dailySeed() {
    try {
      var d = JSON.parse(localStorage.getItem(DAY_KEY));
      if (d && d.d === today() && d.seed) return d.seed;
    } catch (e) {}
    var n = Math.floor(Math.random() * 1e9);
    try { localStorage.setItem(DAY_KEY, JSON.stringify({ d: today(), seed: n })); } catch (e) {}
    return n;
  }

  /* ---------- stan (aura.md §1) ---------- */
  function consents() { return (window.TRKlaro && TRKlaro.consents()) || {}; }
  function getState() {
    if (isUnmeasured()) return 'unmeasured';
    if (readUser()) return 'linked';
    if (consents()['ga4-analytics']) return 'recognised';
    return 'ephemeral';
  }
  function seedFor(state) {
    if (state === 'unmeasured') return null;
    if (state === 'ephemeral') return dailySeed();
    return persistentSeed();
  }

  /* ---------- awatar + orb (SVG, port AuraAvatar/AuraMark) ---------- */
  function avatarSVG(seed, size) {
    var hue = auraIdentity(seed).hue, h2 = (hue + 44) % 360, h3 = (hue + 320) % 360, id = 'trclip' + seed;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 48 48" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '"><circle cx="24" cy="24" r="24"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')">' +
      '<rect width="48" height="48" fill="hsl(' + hue + ' 42% 89%)"/>' +
      '<circle cx="15" cy="33" r="22" fill="hsl(' + hue + ' 55% 58%)" opacity=".92"/>' +
      '<circle cx="36" cy="16" r="17" fill="hsl(' + h2 + ' 52% 56%)" opacity=".85"/>' +
      '<circle cx="30" cy="38" r="11" fill="hsl(' + h3 + ' 58% 60%)" opacity=".8"/>' +
      '<circle cx="19" cy="18" r="4.5" fill="#fff" opacity=".65"/></g></svg>';
  }
  function markSVG(state, size) {
    var inset = Math.round(size * 0.12);
    var av = (state === 'unmeasured')
      ? ''
      : '<span class="aura-mark__av" style="inset:' + inset + 'px">' + avatarSVG(seedFor(state), size - inset * 2) + '</span>';
    var linked = state === 'linked';
    var dashed = state === 'ephemeral' ? '2.6 5.2' : state === 'recognised' ? '4 3' : 'none';
    var stroke = linked ? 'var(--ink)' : state === 'unmeasured' ? 'var(--line-2)' : 'var(--line-2)';
    var ring = '<svg class="aura-mark__ring ' + (state === 'ephemeral' ? 'is-anon' : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
      '<circle cx="20" cy="20" r="18" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round" stroke-dasharray="' + dashed + '"' + (state === 'unmeasured' ? ' opacity=".4"' : '') + '/>' +
      (linked ? '<circle cx="32.5" cy="10" r="3" fill="var(--green)" stroke="var(--paper)" stroke-width="1.5"/>' : '') + '</svg>';
    return '<span class="aura-mark' + (state === 'unmeasured' ? ' is-unmeasured' : '') + '" style="width:' + size + 'px;height:' + size + 'px">' + av + ring + '</span>';
  }

  /* ---------- 4 zintegrowane usługi (panel + trust) ---------- */
  function suspendedCount() {
    var c = consents();
    var toggles = [c['ga4-analytics'], c['youtube'], c['osm'], c['gravity-forms']];
    return toggles.filter(function (v) { return !v; }).length;
  }

  var STATE_LABEL = {
    unmeasured: 'Nic tu nie mierzymy — na zaufanie.',
    ephemeral: 'Widzimy, że ktoś tu jest. Jutro licznik rusza od zera.',
    recognised: 'Pamiętamy to urządzenie między wizytami. Wciąż nie wiemy, kto nim steruje.',
    linked: 'Połączyłeś tę obecność ze swoimi danymi.'
  };

  /* ---------- markup panelu (popover) ---------- */
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function panelHTML() {
    var state = getState(), seed = seedFor(state), user = readUser();
    var id = seed ? auraIdentity(seed) : null;
    var prefs = readPrefs();
    var name = state === 'linked' ? (user.name || 'Twoje konto') : (state === 'unmeasured' ? 'Pomiar wstrzymany' : id.name);
    var tag = (state === 'unmeasured' || state === 'linked') ? '' : '<span class="acct-pop__tag">#' + id.tag + '</span>';
    var regen = (state === 'ephemeral' || state === 'recognised') ? '<button class="acct-pop__regen" data-aura="regen" aria-label="Nowa tożsamość" title="Nowa tożsamość"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.4" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.4" fill="currentColor"/></svg></button>' : '';
    var presets = PRESET_META.map(function (p) {
      var on = Object.keys(PRESETS[p.id]).every(function (k) { return prefs[k] === PRESETS[p.id][k]; });
      return '<button class="preset ' + (on ? 'is-on' : '') + '" data-aura="preset" data-id="' + p.id + '"><b>' + p.label + '</b><span>' + p.sub + '</span></button>';
    }).join('');
    var ladder = {
      ephemeral: { act: 'remember', txt: 'Pozwól tej stronie mnie pamiętać' },
      recognised: { act: 'link', txt: 'Powiąż moją tożsamość' },
      linked: { act: 'logout', txt: 'Wyloguj — zostań rozpoznanym urządzeniem' },
      unmeasured: { act: 'remeasure', txt: 'Włącz pomiar z powrotem' }
    }[state];
    var optout = (state !== 'unmeasured') ? '<button class="aura-optout" data-aura="optout">Wyłącz pomiar całkowicie →</button>' : '';
    return '' +
      '<div class="acct-pop aura-panel" role="menu">' +
      '<div class="acct-pop__head">' + markSVG(state, 46) +
      '<div class="acct-pop__id"><div class="acct-pop__name"><b>' + escapeHtml(name) + '</b>' + tag + '</div>' +
      '<span>' + STATE_LABEL[state] + '</span></div>' + regen + '</div>' +
      '<div class="aura-trust"><span>' + suspendedCount() + ' z 4 wstrzymanych</span></div>' +
      '<div class="set-presets aura-panel__presets">' + presets + '</div>' +
      '<div class="acct-pop__body">' +
      '<button class="acct-item" data-aura="settings"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.4"/><circle cx="15" cy="16" r="2.4"/></svg> Ustawienia i prywatność</button>' +
      '<button class="acct-item acct-item--primary" data-aura="ladder" data-act="' + ladder.act + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M6 9l6-6 6 6"/></svg> ' + ladder.txt + '</button>' +
      optout + '</div></div>';
  }

  /* ---------- orb + panel wiring ---------- */
  var panelEl = null;
  function closePanel() { if (panelEl) { panelEl.remove(); panelEl = null; document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); } }
  function onDoc(e) { var host = document.querySelector('.acct'); if (host && !host.contains(e.target)) closePanel(); }
  function onKey(e) { if (e.key === 'Escape') closePanel(); }
  function togglePanel(host) {
    if (panelEl) { closePanel(); return; }
    host.insertAdjacentHTML('beforeend', panelHTML());
    panelEl = host.querySelector('.aura-panel');
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
  }

  function renderOrb() {
    document.querySelectorAll('.acct').forEach(function (host) {
      var state = getState(), seed = seedFor(state);
      var hue = seed ? auraIdentity(seed).hue : 205;
      host.innerHTML =
        '<button class="aura-orb-btn" data-aura="orb" aria-haspopup="menu" aria-expanded="false" aria-label="Twoja Aura — ' + STATE_LABEL[state] + '">' +
        '<span class="aura-orb-btn__glow" style="background:radial-gradient(circle, hsl(' + hue + ' 70% 62% / .5), transparent 68%)"></span>' +
        markSVG(state, 40) + '</button>';
    });
  }

  function applyPreset(id) { var p = readPrefs(); Object.assign(p, PRESETS[id]); writePrefs(p); refresh(); }
  function regenIdentity() {
    var n = Math.floor(Math.random() * 1e9);
    try { (getState() === 'ephemeral') ? localStorage.setItem(DAY_KEY, JSON.stringify({ d: today(), seed: n })) : localStorage.setItem(SEED_KEY, String(n)); } catch (e) {}
    refresh();
  }
  function ladderUp(act) {
    if (act === 'remember' && window.TRKlaro) TRKlaro.setConsent('ga4-analytics', true);
    else if (act === 'link') { window.TRAura.openSettings(); return; }
    else if (act === 'logout') { try { localStorage.removeItem(USER_KEY); } catch (e) {} }
    else if (act === 'remeasure') setUnmeasured(false);
    refresh();
  }
  function optOut() { setUnmeasured(true); if (window.TRKlaro) TRKlaro.optOutAll(); refresh(); }
  function refresh() { closePanel(); renderOrb(); }

  /* ---------- delegacja kliknięć ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-aura]'); if (!t) return;
    var kind = t.getAttribute('data-aura');
    if (kind === 'orb') { togglePanel(t.closest('.acct')); }
    else if (kind === 'preset') { applyPreset(t.getAttribute('data-id')); togglePanel(t.closest('.acct')); }
    else if (kind === 'regen') { regenIdentity(); togglePanel(t.closest('.acct')); }
    else if (kind === 'ladder') ladderUp(t.getAttribute('data-act'));
    else if (kind === 'optout') optOut();
    else if (kind === 'settings') window.TRAura.openSettings();
  });

  document.addEventListener('aura:klaro-change', refresh);

  /* ---------- modal "Ustawienia i prywatność" (panel zgód = jedyna kontrolka) ---------- */
  var modalEl = null;
  function seg(name, val, opts) {
    return '<div class="seg" role="group">' + opts.map(function (o) {
      return '<button type="button" class="seg__btn ' + (val === o.v ? 'is-on' : '') + '" data-aura="seg" data-name="' + name + '" data-val="' + o.v + '">' + o.l + '</button>';
    }).join('') + '</div>';
  }
  function tgl(svc, on) { return '<button type="button" class="tgl ' + (on ? 'is-on' : '') + '" data-aura="svc" data-svc="' + svc + '" role="switch" aria-checked="' + on + '"><span class="tgl__dot"></span></button>'; }
  function settingsHTML() {
    var p = readPrefs(), c = consents();
    return '<div class="modal-scrim" data-aura="scrim"><div class="modal modal--settings" role="dialog" aria-modal="true" aria-label="Ustawienia i prywatność">' +
      '<header class="set-head"><div><div class="eyebrow">Tylko Ty decydujesz</div><h3>Ustawienia i prywatność</h3>' +
      '<p>Domyślnie nie ładujemy treści z zewnątrz bez Twojej zgody. Zmiany zapisują się automatycznie.</p></div>' +
      '<button class="modal__x" data-aura="close" aria-label="Zamknij"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg></button></header>' +
      '<div class="set-body"><div class="set-group"><div class="set-group__label">Kontakt</div>' +
      '<div class="set-row"><div class="set-row__main"><div class="set-row__top"><div><div class="set-row__title">Domyślny kanał kontaktu</div></div>' +
      seg('contactChannel', p.contactChannel, [{ v: 'auto', l: 'Automatycznie' }, { v: 'phone', l: 'Telefon' }, { v: 'whatsapp', l: 'WhatsApp' }]) + '</div></div></div>' +
      '<div class="set-group"><div class="set-group__label">Treści z zewnątrz</div>' +
      '<div class="set-row"><div class="set-row__main"><div class="set-row__top"><div><div class="set-row__title">Filmy z YouTube</div></div>' + tgl('youtube', !!c['youtube']) + '</div></div></div>' +
      '<div class="set-row"><div class="set-row__main"><div class="set-row__top"><div><div class="set-row__title">Mapy OpenStreetMap</div></div>' + tgl('osm', !!c['osm']) + '</div></div></div>' +
      '<div class="set-row"><div class="set-row__main"><div class="set-row__top"><div><div class="set-row__title">Pełny formularz kontaktowy</div></div>' + tgl('gravity-forms', !!c['gravity-forms']) + '</div></div></div></div>' +
      '<div class="set-group"><div class="set-group__label">Pomiar</div>' +
      '<div class="set-row"><div class="set-row__main"><div class="set-row__top"><div><div class="set-row__title">Pełna analityka (po zgodzie)</div></div>' + tgl('ga4-analytics', !!c['ga4-analytics']) + '</div></div></div></div></div>' +
      '<footer class="set-foot"><button class="set-reset" data-aura="reset">Przywróć domyślne</button><button class="btn btn--ink" data-aura="close">Gotowe</button></footer></div></div>';
  }
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; document.body.style.overflow = ''; } }
  function openSettings() {
    closePanel(); closeModal();
    document.body.insertAdjacentHTML('beforeend', settingsHTML());
    modalEl = document.body.lastElementChild; document.body.style.overflow = 'hidden';
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-aura]'); if (!t) return;
    var k = t.getAttribute('data-aura');
    if (k === 'close' || k === 'scrim') { if (k === 'scrim' && e.target !== t) return; closeModal(); }
    else if (k === 'seg') { var p = readPrefs(); p[t.dataset.name] = t.dataset.val; writePrefs(p); var m = openSettings; closeModal(); m(); }
    else if (k === 'svc' && window.TRKlaro) { TRKlaro.setConsent(t.dataset.svc, t.getAttribute('aria-checked') !== 'true'); closeModal(); openSettings(); }
    else if (k === 'reset') { writePrefs(DEFAULT_PREFS); if (window.TRKlaro) TRKlaro.optOutAll(); closeModal(); openSettings(); }
  });

  window.TRAura = {
    rng: rng, auraIdentity: auraIdentity, getState: getState, seedFor: seedFor,
    readPrefs: readPrefs, writePrefs: writePrefs, refresh: refresh, render: renderOrb,
    suspendedCount: suspendedCount, openSettings: openSettings, PRESETS: PRESETS
  };

  document.addEventListener('DOMContentLoaded', renderOrb);
})();
