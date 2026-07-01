/* ============================================================
   Header (desktop + mobile), Mobile menu, Footer
   ============================================================ */
const NAV = [
{ to: '/obozy/biegowe', label: 'Obozy biegowe' },
{ to: '/obozy/skitour', label: 'Skitour' },
{ to: '/obozy/kids', label: 'Kids' },
{ to: '/obozy/junior', label: 'Junior' }];

const TOPNAV = [
{ to: '/zespol', label: 'Zespół' },
{ to: '/partnerzy', label: 'Partnerzy' },
{ to: '/dokumenty', label: 'Pomoc' },
{ sep: true },
{ to: '/blog', label: 'Blog' },
{ to: '/kontakt', label: 'Kontakt' }];

const SOCIALS = [
{ name: 'fb', label: 'Facebook', href: 'https://facebook.com' },
{ name: 'ig', label: 'Instagram', href: 'https://instagram.com' },
{ name: 'yt', label: 'YouTube', href: 'https://youtube.com' }];


function LogoMark({ className }) {
  return <img className={`brand__logo ${className || ''}`} src="assets/logo.webp" alt="Tatra Running" />;
}

function LogoTile({ className }) {
  return (
    <span className={`logo-tile ${className || ''}`}>
      <img src="assets/logo.webp" alt="Tatra Running" />
    </span>);

}

function SocialRow({ className, variant }) {
  return (
    <div className={className}>
      {SOCIALS.map((s) =>
      <a key={s.name} className="social-btn" href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
          <Icon name={s.name} size={variant === 'lg' ? 22 : 18} />
        </a>
      )}
    </div>);

}

function Header({ route }) {
  const cart = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  useEffect(() => {
    let last = window.scrollY || 0;
    const onScroll = () => {
      const el = headerRef.current; if (!el) return;
      const y = window.scrollY || 0;
      if (y <= 8) { el.classList.remove('site-header--hidden'); last = y; return; }
      if (y > last + 6) el.classList.add('site-header--hidden');
      else if (y < last - 6) el.classList.remove('site-header--hidden');
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const isActive = (to) => {
    if (to.startsWith('/obozy')) {
      if (route.name !== 'camps') return false;
      const cat = route.params.cat || '';
      const toCat = to.split('/')[2] || '';
      return cat === toCat || cat === '' && toCat === 'biegowe';
    }
    return (
      to === '/zespol' && (route.name === 'team' || route.name === 'trainer') ||
      to === '/partnerzy' && route.name === 'partners' ||
      to === '/dokumenty' && (route.name === 'legalHub' || route.name === 'shopTerms' || route.name === 'newsletterRules' || route.name === 'privacy') ||
      to === '/kontakt' && route.name === 'contact' ||
      to === '/blog' && route.name === 'blog');

  };

  return (
    <header className="site-header" ref={headerRef}>
      {/* black top bar */}
      <div className="topbar">
        <div className="topbar__inner">
          <div className="topbar__left">
            <a className="topbar__item" href="tel:+48500152300"><Icon name="phone" size={15} /> +48 500 152 300</a>
            <a className="topbar__item topbar__item--mail" href="mailto:contact@tatrarunning.pl"><Icon name="mail" size={15} /> contact@tatrarunning.pl</a>
            <span className="topbar__item topbar__item--hours"><Icon name="mountain" size={15} /> 14. sezon w górach</span>
          </div>
          <div className="topbar__right">
            {TOPNAV.map((n, i) =>
            n.sep ?
            <span key={`sep-${i}`} className="topbar__divider" aria-hidden="true" /> :
            <Link key={n.to} to={n.to} className="topbar__link" aria-current={isActive(n.to) ? 'page' : undefined}>{n.label}</Link>
            )}
            <span className="topbar__sep" />
            <div className="topbar__social">
              {SOCIALS.map((s) =>
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}><Icon name={s.name} size={16} /></a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="site-header__main">
        <div className="site-header__bar">
          <Link to="/" className="brand" aria-label="Tatra Running — strona główna"><LogoMark /></Link>

          <nav className="nav-primary" aria-label="Główna nawigacja">
            {NAV.map((n) =>
            <Link key={n.to} to={n.to} className="nav-link" aria-current={isActive(n.to) ? 'page' : undefined}>{n.label}</Link>
            )}
          </nav>

          <div className="header-utils">
            <Link to="/bony" className="btn btn--ghost btn--sm bony-btn" style={{ gap: 8 }}>
              <Icon name="gift" size={18} /> Bony
            </Link>
            <a href="tel:+48500152300" className="phone-btn" aria-label="Zadzwoń +48 500 152 300">
              <Icon name="phone" size={19} />
            </a>
            <div className="acct">
              <Link to="/kontakt" className="acct-btn" aria-label="Konto"><Icon name="user" size={20} /></Link>
            </div>
            <button className="cart-btn" onClick={() => cart.setOpen(true)} aria-label={`Koszyk, ${cart.count} pozycji`}>
              <Icon name="bag" size={20} />
              {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
            </button>
            <button className="burger" onClick={() => setMenuOpen(true)} aria-label="Otwórz menu">
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && <MobileMenu route={route} onClose={() => setMenuOpen(false)} />}
    </header>);

}

function MobileMenu({ onClose }) {
  const cart = useCart();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {document.body.style.overflow = prev;};
  }, []);
  const items = [...NAV, ...TOPNAV.filter((n) => !n.sep), { to: '/bony', label: 'Bony', gift: true }];
  return (
    <div className="mm-overlay" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="mm-top">
        <Link to="/" className="brand" onClick={onClose}><LogoMark /></Link>
        <button className="burger" style={{ display: 'grid' }} onClick={onClose} aria-label="Zamknij menu">
          <Icon name="close" size={24} />
        </button>
      </div>
      <div className="mm-body">
        <nav className="mm-list" aria-label="Menu mobilne">
          {items.map((n) =>
          <Link key={n.to} to={n.to} className="mm-item" onClick={onClose}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                {n.gift && <Icon name="gift" size={26} className="ic" />}
                {n.label}
              </span>
              <Icon name="arrow-ur" size={24} className="ic" />
            </Link>
          )}
        </nav>
        <SocialRow className="mm-social" variant="lg" />
      </div>
      <div className="mm-foot">
        <div className="mm-acct">
          <Link className="btn btn--ghost" to="/kontakt" onClick={onClose}>
            <Icon name="user" size={18} /> Zaloguj się
          </Link>
          <Link className="btn btn--ghost" to="/kontakt" onClick={onClose}>
            <Icon name="sliders" size={18} /> Ustawienia
          </Link>
        </div>
        <button className="btn btn--accent btn--block btn--lg" onClick={() => {onClose();cart.setOpen(true);}}>
          <Icon name="bag" size={20} /> Koszyk {cart.count > 0 ? `(${cart.count})` : ''}
        </button>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Icon name="phone" size={16} /> +48 500 152 300 · contact@tatrarunning.pl
        </p>
      </div>
    </div>);

}

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [modal, setModal] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setModal(true);
  };
  return (
    <div className="footer-news__signup">
      <form className="footer-news__form" onSubmit={submit}>
        <input type="email" placeholder="Twój e-mail" aria-label="E-mail do newslettera"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn btn--accent" type="submit">
          Zapisz się <Icon name="arrow-right" size={18} />
        </button>
      </form>
      <p className="footer-news__legal">
        Przeczytaj nasze <Link to="/zasady-newslettera">zasady wysyłki</Link> newslettera oraz o tym <Link to="/prywatnosc">jak przetwarzamy</Link> Twoje dane.
      </p>
      {modal && <NewsletterConfirmModal email={email} onClose={() => setModal(false)} />}
    </div>
  );
}

function NewsletterConfirmModal({ email, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal--news" role="dialog" aria-modal="true" aria-label="Potwierdź zapis do newslettera">
        <button className="modal__x" onClick={onClose} aria-label="Zamknij"><Icon name="close" size={20} /></button>
        <div className="news-modal">
          <div className="news-modal__ic"><Icon name="mail" size={30} /></div>
          <div className="eyebrow" style={{ justifyContent: 'center' }}>Jeszcze jeden krok</div>
          <h3>Sprawdź swoją skrzynkę</h3>
          <p>
            Wysłaliśmy wiadomość na adres{email ? <> <strong>{email}</strong></> : ' Twój e-mail'}. Aby dokończyć zapis,
            <strong> kliknij link potwierdzający</strong> w tym mailu — dzięki temu mamy pewność, że to naprawdę Ty.
          </p>
          <p className="news-modal__hint">
            Nie widzisz wiadomości? Zajrzyj do folderu „Oferty" lub „Spam". Link jest ważny przez 24 godziny.
          </p>
          <button className="btn btn--ink btn--block btn--lg" onClick={onClose} style={{ marginTop: 6 }}>Rozumiem</button>
          <p className="news-modal__note"><Icon name="shield" size={14} /> Demonstracja interfejsu — dane nie są nigdzie wysyłane.</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap wrap--wide">
        <div className="footer-news">
          <div className="footer-news__text">
            <div className="eyebrow">Newsletter</div>
            <h3>Nie przegap kolejnej wyprawy</h3>
            <p>Nowe obozy, wolne miejsca i historie z gór — prosto na Twój e-mail. Bez spamu, kilka razy w sezonie.</p>
          </div>
          <NewsletterSignup />
        </div>
        <div className="footer-divider" />
        <div className="footer-top">
          <div className="footer-col footer-brand">
            <div className="footer-logo-frame">
              <span className="logo-tile logo-tile--card">
                <img src="assets/logo.webp" alt="Tatra Running" />
                <span className="logo-tile__tagline">Bieganie. Skitury. Obozy. Treningi. Czternasty rok wypraw biegowych i skiturowych w góry świata.</span>
              </span>
            </div>
          </div>
          <div className="footer-col">
            <h4>Wyprawy</h4>
            <Link to="/obozy">Wszystkie obozy</Link>
            <Link to="/obozy/biegowe">Obozy biegowe</Link>
            <Link to="/obozy/skitour">Obozy skiturowe</Link>
            <Link to="/obozy/kids">Kids</Link>
            <Link to="/obozy/junior">Junior</Link>
            <Link to="/bony">Bony podarunkowe</Link>
          </div>
          <div className="footer-col">
            <h4>Tatra Running</h4>
            <Link to="/zespol">Zespół</Link>
            <Link to="/partnerzy">Partnerzy</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/kontakt">Kontakt</Link>
          </div>
          <div className="footer-col">
            <h4>Pomoc</h4>
            <Link to="/dokumenty">Dokumenty prawne</Link>
            <Link to="/regulamin">Regulamin sklepu</Link>
            <Link to="/zasady-newslettera">Zasady newslettera</Link>
            <Link to="/prywatnosc">Przetwarzanie danych</Link>
          </div>
          <div className="footer-col">
            <h4>Kontakt</h4>
            <a href="tel:+48500152300">+48 500 152 300</a>
            <a href="mailto:contact@tatrarunning.pl">contact@tatrarunning.pl</a>
            <p style={{ color: 'var(--on-dark-mut)', fontSize: 14, marginTop: 12 }}>
              Organizator turystyki wpisany do Rejestru Organizatorów Turystyki Marszałka Województwa Małopolskiego.
            </p>
          </div>
        </div>
      </div>
      <div className="wrap wrap--wide">
        <div className="footer-bottom">
          <span>© 2026 Tatra Running</span>
          <SocialRow className="footer-social" />
        </div>
      </div>
    </footer>);

}

Object.assign(window, { Header, Footer, LogoTile, LogoMark, SocialRow, NAV });