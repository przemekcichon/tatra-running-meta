/* ============================================================
   ACCOUNT + PRIVACY
   - User dropdown (login / register / settings)
   - Auth modal (mock, front-end only)
   - Settings & privacy modal (contact channel, embeds, consent)
   - Preference-aware embeds: PrivacyMap, PrivacyVideo
   Everything persists to localStorage. No tracking by default.
   ============================================================ */

const PHONE_E164 = '+48500152300';
const WA_NUMBER = '48500152300';
const PREFS_KEY = 'tr_prefs_v1';
const USER_KEY = 'tr_user_v1';

const DEFAULT_PREFS = {
  contactChannel: 'auto',   // 'auto' | 'phone' | 'whatsapp'
  youtube: 'ask',           // 'auto' (osadzaj) | 'ask' (przekieruj)
  maps: 'osm',              // 'osm' (osadzaj) | 'google' (przekieruj)
  consent: { analytics: false, personalization: false, marketing: false },
};

function isDesktopEnv() {
  try {
    return window.matchMedia('(pointer: fine)').matches &&
      !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  } catch (e) { return false; }
}

/* Which protocol a phone link should use, given the saved preference */
function resolveContact(channel) {
  const wa = channel === 'whatsapp' || (channel === 'auto' && isDesktopEnv());
  return wa
    ? { href: 'https://wa.me/' + WA_NUMBER, external: true, kind: 'wa' }
    : { href: 'tel:' + PHONE_E164, external: false, kind: 'tel' };
}

/* ============================================================
   AURA — anonymous "presence" identity
   A first-party seed (this browser only) → avatar + nickname.
   Transparent tracking with a friendly face; carries into login.
   ============================================================ */
const SEED_KEY = 'tr_aura_seed';
const AURA_HUES = [22, 36, 48, 96, 128, 152, 205, 14]; // brand-warm + forest + slate
const ADJ = ['Wędrowny', 'Spokojny', 'Szybki', 'Cichy', 'Górski', 'Wytrwały', 'Dziki', 'Mglisty', 'Słoneczny', 'Zwinny', 'Śmiały', 'Leśny', 'Poranny', 'Czujny', 'Wieczorny', 'Szczęśliwy'];
const ANIMAL = ['Świstak', 'Ryś', 'Niedźwiedź', 'Orzeł', 'Jeleń', 'Borsuk', 'Lis', 'Sokół', 'Głuszec', 'Wilk', 'Kozioł', 'Pomurnik', 'Zając', 'Jastrząb', 'Bóbr', 'Łoś'];

function rng(seed) {
  let t = (seed + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function auraIdentity(seed) {
  const a = ADJ[Math.floor(rng(seed) * ADJ.length)];
  const an = ANIMAL[Math.floor(rng(seed * 7 + 13) * ANIMAL.length)];
  const tag = Math.floor(rng(seed * 3 + 5) * 0x10000).toString(16).toUpperCase().padStart(4, '0');
  const hue = AURA_HUES[Math.floor(rng(seed * 11 + 2) * AURA_HUES.length)];
  return { name: `${a} ${an}`, tag, hue };
}

/* Generative avatar — soft overlapping fields, deterministic from seed */
function AuraAvatar({ seed, size = 44 }) {
  const { hue } = auraIdentity(seed);
  const h2 = (hue + 44) % 360;
  const h3 = (hue + 320) % 360;
  const id = 'trclip' + seed;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs><clipPath id={id}><circle cx="24" cy="24" r="24" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" fill={`hsl(${hue} 42% 89%)`} />
        <circle cx="15" cy="33" r="22" fill={`hsl(${hue} 55% 58%)`} opacity="0.92" />
        <circle cx="36" cy="16" r="17" fill={`hsl(${h2} 52% 56%)`} opacity="0.85" />
        <circle cx="30" cy="38" r="11" fill={`hsl(${h3} 58% 60%)`} opacity="0.8" />
        <circle cx="19" cy="18" r="4.5" fill="#fff" opacity="0.65" />
      </g>
    </svg>
  );
}

/* The presence orb — ring (control zone) around the avatar.
   anonymous: dashed, slowly turning · claimed: solid + verified dot */
function AuraMark({ seed, claimed, size = 42 }) {
  const ring = claimed ? 'var(--ink)' : 'var(--line-2)';
  const inset = Math.round(size * 0.12);
  return (
    <span className="aura-mark" style={{ width: size, height: size }}>
      <span className="aura-mark__av" style={{ inset: inset + 'px' }}>
        <AuraAvatar seed={seed} size={size - inset * 2} />
      </span>
      <svg className={'aura-mark__ring ' + (claimed ? '' : 'is-anon')} width={size} height={size} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke={ring} strokeWidth="2" strokeLinecap="round" strokeDasharray={claimed ? 'none' : '2.6 5.2'} />
        {claimed && <circle cx="32.5" cy="10" r="3" fill="var(--green)" stroke="var(--paper)" strokeWidth="1.5" />}
      </svg>
    </span>
  );
}

/* Presets map the embed/contact prefs (consent stays untouched) */
const PRESETS = {
  smooth: { contactChannel: 'whatsapp', youtube: 'auto', maps: 'osm' },
  balanced: { contactChannel: 'auto', youtube: 'ask', maps: 'osm' },
  sanctuary: { contactChannel: 'phone', youtube: 'ask', maps: 'google' },
};
const PRESET_META = [
  { id: 'smooth', label: 'Płynnie', sub: 'Wszystko włączone' },
  { id: 'balanced', label: 'Równowaga', sub: 'Domyślne' },
  { id: 'sanctuary', label: 'Sanktuarium', sub: 'Nic ekstra' },
];

/* ---------- Context ---------- */
const AccountCtx = createContext(null);
const useAccount = () => useContext(AccountCtx);

function AccountProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY));
      return saved ? { ...DEFAULT_PREFS, ...saved, consent: { ...DEFAULT_PREFS.consent, ...(saved.consent || {}) } } : DEFAULT_PREFS;
    } catch (e) { return DEFAULT_PREFS; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch (e) { return null; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [seed, setSeed] = useState(() => {
    try { const s = parseInt(localStorage.getItem(SEED_KEY), 10); if (s) return s; } catch (e) {}
    const s = Math.floor(Math.random() * 1e9);
    try { localStorage.setItem(SEED_KEY, String(s)); } catch (e) {}
    return s;
  });

  useEffect(() => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} }, [prefs]);
  useEffect(() => {
    try { user ? localStorage.setItem(USER_KEY, JSON.stringify(user)) : localStorage.removeItem(USER_KEY); } catch (e) {}
  }, [user]);

  const setPref = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: value })), []);
  const setConsent = useCallback((key, value) => setPrefs((p) => ({ ...p, consent: { ...p.consent, [key]: value } })), []);
  const resetPrefs = useCallback(() => setPrefs(DEFAULT_PREFS), []);
  const applyPreset = useCallback((id) => setPrefs((p) => ({ ...p, ...PRESETS[id] })), []);
  const regenIdentity = useCallback(() => {
    const s = Math.floor(Math.random() * 1e9);
    setSeed(s);
    try { localStorage.setItem(SEED_KEY, String(s)); } catch (e) {}
  }, []);

  const value = {
    prefs, setPref, setConsent, resetPrefs, applyPreset,
    user, setUser,
    seed, regenIdentity,
    settingsOpen, openSettings: () => setSettingsOpen(true), closeSettings: () => setSettingsOpen(false),
    authMode, openAuth: (m) => setAuthMode(m), closeAuth: () => setAuthMode(null),
  };
  return <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>;
}

/* Hook returning <a> props that honour the saved contact channel */
function useContactLink() {
  const { prefs } = useAccount();
  const c = resolveContact(prefs.contactChannel);
  return c.external
    ? { href: c.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: c.href };
}

/* ============================================================
   Small controls
   ============================================================ */
function Segmented({ value, onChange, options }) {
  return (
    <div className="seg" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`seg__btn ${value === o.value ? 'is-on' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={15} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`tgl ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="tgl__dot" />
    </button>
  );
}

function SettingRow({ icon, title, desc, children, control }) {
  return (
    <div className="set-row">
      <div className="set-row__ic"><Icon name={icon} size={19} /></div>
      <div className="set-row__main">
        <div className="set-row__top">
          <div>
            <div className="set-row__title">{title}</div>
            {desc && <p className="set-row__desc">{desc}</p>}
          </div>
          {control}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   Account dropdown (header)
   ============================================================ */
function AccountMenu() {
  const acc = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const me = auraIdentity(acc.seed);
  const go = (fn) => { setOpen(false); fn(); };

  return (
    <div className="acct" ref={ref}>
      <button
        className="aura-orb-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={acc.user ? `Twoja Aura — ${acc.user.name || me.name}` : `Twoja Aura — ${me.name}, anonimowo`}
      >
        <span className="aura-orb-btn__glow" style={{ background: `radial-gradient(circle, hsl(${me.hue} 70% 62% / .5), transparent 68%)` }} />
        <AuraMark seed={acc.seed} claimed={!!acc.user} size={40} />
      </button>

      {open && (
        <div className="acct-pop" role="menu">
          <div className="acct-pop__head">
            <AuraMark seed={acc.seed} claimed={!!acc.user} size={46} />
            <div className="acct-pop__id">
              <div className="acct-pop__name">
                <b>{acc.user ? (acc.user.name || 'Twoje konto') : me.name}</b>
                {!acc.user && <span className="acct-pop__tag">#{me.tag}</span>}
              </div>
              <span>{acc.user ? acc.user.email : 'Anonimowo · ślad tylko w tej przeglądarce'}</span>
            </div>
            {!acc.user && (
              <button className="acct-pop__regen" onClick={acc.regenIdentity} aria-label="Nowa tożsamość" title="Nowa tożsamość">
                <Icon name="dice" size={17} />
              </button>
            )}
          </div>

          <div className="acct-pop__body">
            {!acc.user && (
              <React.Fragment>
                <button className="acct-item acct-item--primary" role="menuitem" onClick={() => go(() => acc.openAuth('register'))}>
                  <Icon name="spark" size={18} /> Przejmij tę tożsamość
                </button>
                <button className="acct-item" role="menuitem" onClick={() => go(() => acc.openAuth('login'))}>
                  <Icon name="user" size={18} /> Zaloguj się
                </button>
              </React.Fragment>
            )}
            {acc.user && (
              <button className="acct-item" role="menuitem" onClick={() => go(() => {})}>
                <Icon name="bag" size={18} /> Moje zamówienia
              </button>
            )}

            <div className="acct-sep" />

            <button className="acct-item" role="menuitem" onClick={() => go(() => acc.openSettings())}>
              <Icon name="sliders" size={18} /> Ustawienia i prywatność
            </button>

            {acc.user && (
              <React.Fragment>
                <div className="acct-sep" />
                <button className="acct-item acct-item--muted" role="menuitem" onClick={() => go(() => acc.setUser(null))}>
                  <Icon name="logout" size={18} /> Wyloguj się
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Auth modal (mock)
   ============================================================ */
function AuthModal() {
  const acc = useAccount();
  const mode = acc.authMode;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    if (mode) { setName(''); setEmail(''); setPass(''); }
    const onKey = (e) => { if (e.key === 'Escape') acc.closeAuth(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mode]);

  if (!mode) return null;
  const isReg = mode === 'register';

  const submit = (e) => {
    e.preventDefault();
    acc.setUser({ name: name || email.split('@')[0], email });
    acc.closeAuth();
  };

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) acc.closeAuth(); }}>
      <div className="modal modal--auth" role="dialog" aria-modal="true" aria-label={isReg ? 'Rejestracja' : 'Logowanie'}>
        <button className="modal__x" onClick={acc.closeAuth} aria-label="Zamknij"><Icon name="close" size={20} /></button>

        <div className="auth-head">
          <LogoTile className="auth-logo" />
          <h3>{isReg ? 'Załóż konto' : 'Zaloguj się'}</h3>
          <p>{isReg ? 'Szybciej rezerwuj obozy i miej swoje wyjazdy w jednym miejscu.' : 'Witaj z powrotem w górach.'}</p>
        </div>

        <div className="auth-tabs">
          <button className={!isReg ? 'is-on' : ''} onClick={() => acc.openAuth('login')}>Logowanie</button>
          <button className={isReg ? 'is-on' : ''} onClick={() => acc.openAuth('register')}>Rejestracja</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isReg && (
            <label className="field">
              <span>Imię i nazwisko</span>
              <input className="cfg-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Kowalski" required />
            </label>
          )}
          <label className="field">
            <span>Adres e-mail</span>
            <input className="cfg-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@example.com" required />
          </label>
          <label className="field">
            <span>Hasło</span>
            <input className="cfg-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" required minLength={4} />
          </label>

          {!isReg && <a className="auth-forgot" href="#" onClick={(e) => e.preventDefault()}>Nie pamiętasz hasła?</a>}

          <button type="submit" className="btn btn--accent btn--block btn--lg" style={{ marginTop: 6 }}>
            {isReg ? 'Utwórz konto' : 'Zaloguj się'} <Icon name="arrow-right" size={18} />
          </button>

          <p className="auth-alt">
            {isReg ? 'Masz już konto? ' : 'Nie masz konta? '}
            <button type="button" onClick={() => acc.openAuth(isReg ? 'login' : 'register')}>
              {isReg ? 'Zaloguj się' : 'Załóż je'}
            </button>
          </p>
        </form>

        <p className="auth-note"><Icon name="shield" size={14} /> Demonstracja interfejsu — dane nie są nigdzie wysyłane.</p>
      </div>
    </div>
  );
}

/* ============================================================
   Settings & privacy modal
   ============================================================ */
function SettingsModal() {
  const acc = useAccount();
  const { prefs, setPref, setConsent } = acc;
  const me = auraIdentity(acc.seed);
  const activePreset = (() => {
    for (const id of Object.keys(PRESETS)) {
      const pr = PRESETS[id];
      if (Object.keys(pr).every((k) => prefs[k] === pr[k])) return id;
    }
    return null;
  })();

  useEffect(() => {
    if (!acc.settingsOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') acc.closeSettings(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [acc.settingsOpen]);

  if (!acc.settingsOpen) return null;

  const contactHint = {
    auto: 'Na komputerze otworzy się WhatsApp, na telefonie — zwykłe połączenie.',
    phone: 'Kliknięcie w numer zawsze rozpocznie połączenie telefoniczne.',
    whatsapp: 'Kliknięcie w numer zawsze otworzy rozmowę na WhatsApp.',
  }[prefs.contactChannel];

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) acc.closeSettings(); }}>
      <div className="modal modal--settings" role="dialog" aria-modal="true" aria-label="Ustawienia i prywatność">
        <header className="set-head">
          <div>
            <div className="eyebrow">Tylko Ty decydujesz</div>
            <h3>Ustawienia i prywatność</h3>
            <p>Domyślnie nic nie śledzimy i nie ładujemy treści z zewnątrz bez Twojej zgody. Zmiany zapisują się automatycznie.</p>
          </div>
          <button className="modal__x" onClick={acc.closeSettings} aria-label="Zamknij"><Icon name="close" size={20} /></button>
        </header>

        <div className="set-body">
          {/* AURA identity + presets */}
          <div className="set-aura">
            <AuraMark seed={acc.seed} claimed={!!acc.user} size={46} />
            <div className="set-aura__id">
              <b>{acc.user ? (acc.user.name || 'Twoje konto') : me.name}</b>
              <span>{acc.user ? 'Zalogowano · ustawienia zsynchronizowane' : 'Twoja anonimowa obecność · tylko ta przeglądarka'}</span>
            </div>
          </div>
          <div className="set-presets">
            {PRESET_META.map((pst) => {
              const on = activePreset === pst.id;
              return (
                <button key={pst.id} className={'preset ' + (on ? 'is-on' : '')} onClick={() => acc.applyPreset(pst.id)}>
                  <b>{pst.label}</b>
                  <span>{pst.sub}</span>
                </button>
              );
            })}
          </div>
          <p className="set-presets__hint">Nie chcesz wybierać? <b>Równowaga</b> jest już włączona.</p>

          {/* CONTACT */}
          <section className="set-group">
            <div className="set-group__label"><Icon name="phone" size={15} /> Kontakt</div>
            <SettingRow
              icon="whatsapp"
              title="Domyślny kanał kontaktu"
              desc={contactHint}
            >
              <Segmented
                value={prefs.contactChannel}
                onChange={(v) => setPref('contactChannel', v)}
                options={[
                  { value: 'auto', label: 'Automatycznie', icon: 'spark' },
                  { value: 'phone', label: 'Telefon', icon: 'phone' },
                  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
                ]}
              />
            </SettingRow>
          </section>

          {/* EMBEDS */}
          <section className="set-group">
            <div className="set-group__label"><Icon name="external" size={15} /> Treści z zewnątrz</div>
            <SettingRow
              icon="play"
              title="Filmy z YouTube"
              desc={prefs.youtube === 'auto'
                ? 'Odtwarzacze YouTube ładują się od razu na stronie.'
                : 'Zamiast odtwarzacza pokażemy podgląd — film otworzysz w YouTube.'}
            >
              <Segmented
                value={prefs.youtube}
                onChange={(v) => setPref('youtube', v)}
                options={[
                  { value: 'auto', label: 'Ładuj od razu' },
                  { value: 'ask', label: 'Przekieruj do YouTube' },
                ]}
              />
            </SettingRow>
            <SettingRow
              icon="map"
              title="Mapy"
              desc={prefs.maps === 'osm'
                ? 'Mapy OpenStreetMap ładują się bezpośrednio na stronie.'
                : 'Zamiast mapy pokażemy przycisk otwierający Google Maps.'}
            >
              <Segmented
                value={prefs.maps}
                onChange={(v) => setPref('maps', v)}
                options={[
                  { value: 'osm', label: 'OpenStreetMap' },
                  { value: 'google', label: 'Google Maps' },
                ]}
              />
            </SettingRow>
          </section>

          {/* CONSENT (Klaro-style) */}
          <section className="set-group">
            <div className="set-group__label"><Icon name="shield" size={15} /> Prywatność i zgody</div>
            <SettingRow
              icon="sliders"
              title="Statystyki anonimowe"
              desc="Zbiorcze, niepowiązane z osobą dane o ruchu, by ulepszać stronę."
              control={<Toggle checked={prefs.consent.analytics} onChange={(v) => setConsent('analytics', v)} label="Statystyki anonimowe" />}
            />
            <SettingRow
              icon="user"
              title="Personalizacja treści"
              desc="Dopasowanie polecanych obozów do Twoich zainteresowań."
              control={<Toggle checked={prefs.consent.personalization} onChange={(v) => setConsent('personalization', v)} label="Personalizacja treści" />}
            />
            <SettingRow
              icon="spark"
              title="Marketing"
              desc="Zgoda na pliki używane do kampanii i remarketingu."
              control={<Toggle checked={prefs.consent.marketing} onChange={(v) => setConsent('marketing', v)} label="Marketing" />}
            />
          </section>
        </div>

        <footer className="set-foot">
          <button className="set-reset" onClick={acc.resetPrefs}>Przywróć domyślne</button>
          <button className="btn btn--ink" onClick={acc.closeSettings}>Gotowe</button>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   Preference-aware embeds (reusable)
   ============================================================ */
function PrivacyPlaceholder({ icon, kicker, title, desc, action, href }) {
  return (
    <div className="embed-block">
      <div className="embed-block__ic"><Icon name={icon} size={24} /></div>
      {kicker && <div className="embed-block__kicker">{kicker}</div>}
      <h4>{title}</h4>
      <p>{desc}</p>
      <a className="btn btn--ink btn--sm" href={href} target="_blank" rel="noopener noreferrer">
        {action} <Icon name="external" size={16} />
      </a>
    </div>
  );
}

function PrivacyMap({ lat = 49.2992, lng = 19.9496, query = 'Zakopane', label = 'Nasza siedziba', zoom = 0.012, className }) {
  const { prefs } = useAccount();
  if (prefs.maps === 'google') {
    return (
      <div className={`embed-frame ${className || ''}`}>
        <PrivacyPlaceholder
          icon="map"
          kicker="Mapa wyłączona w Twoich ustawieniach"
          title={label}
          desc="Wybrałeś przekierowanie do Google Maps zamiast osadzonej mapy."
          action="Otwórz w Google Maps"
          href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query)}
        />
      </div>
    );
  }
  const bbox = [lng - zoom, lat - zoom * 0.7, lng + zoom, lat + zoom * 0.7].join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className={`embed-frame ${className || ''}`}>
      <iframe
        title={'Mapa — ' + label}
        src={src}
        loading="lazy"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
      />
      <a className="embed-frame__open" href={'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=15/' + lat + '/' + lng} target="_blank" rel="noopener noreferrer">
        Większa mapa <Icon name="external" size={14} />
      </a>
    </div>
  );
}

function PrivacyVideo({ id, title = 'Film', className }) {
  const { prefs } = useAccount();
  const [play, setPlay] = useState(false);
  const url = 'https://www.youtube.com/watch?v=' + id;
  if (prefs.youtube === 'auto' || play) {
    return (
      <div className={`embed-frame ${className || ''}`}>
        <iframe
          title={title}
          src={'https://www.youtube-nocookie.com/embed/' + id + (play ? '?autoplay=1' : '')}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        />
      </div>
    );
  }
  return (
    <div className={`embed-frame ${className || ''}`}>
      <PrivacyPlaceholder
        icon="play"
        kicker="Film wyłączony w Twoich ustawieniach"
        title={title}
        desc="Aby chronić Twoją prywatność, nie ładujemy YouTube automatycznie."
        action="Obejrzyj w YouTube"
        href={url}
      />
      <button className="embed-frame__inline" onClick={() => setPlay(true)}>Załaduj tutaj mimo to</button>
    </div>
  );
}

/* Root-mounted overlays */
function AccountModals() {
  return (
    <React.Fragment>
      <AuthModal />
      <SettingsModal />
    </React.Fragment>
  );
}

Object.assign(window, {
  AccountProvider, AccountMenu, AccountModals, SettingsModal, AuthModal,
  useAccount, useContactLink, PrivacyMap, PrivacyVideo,
});
