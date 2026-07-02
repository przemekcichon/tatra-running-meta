/* ============================================================
   AUTH (konto) — logowanie / rejestracja (mock, front-only)
   Samodzielny moduł konta (mock, front-only).
   Docelowo: WooCommerce My Account.
   ============================================================ */
const AUTH_USER_KEY = 'tr_user_v1';

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY)) || null; } catch (e) { return null; }
  });
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'

  useEffect(() => {
    try { user ? localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)) : localStorage.removeItem(AUTH_USER_KEY); } catch (e) {}
  }, [user]);

  const value = {
    user, setUser,
    authMode, openAuth: (m) => setAuthMode(m), closeAuth: () => setAuthMode(null),
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

function AuthModal() {
  const acc = useAuth();
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

Object.assign(window, { AuthProvider, AuthModal, useAuth });
