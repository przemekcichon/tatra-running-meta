/* ============================================================
   Shared blocks: SectionHeading, CampCard, Reveal, StatusBadge
   ============================================================ */

function Reveal({ children, as: Tag = 'div', className = '', style, delay = 0 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}

function SectionHeading({ eyebrow, title, children, center, light }) {
  return (
    <div className={`sec-head ${center ? 'sec-head--center' : ''}`}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 style={light ? { color: '#fff' } : undefined}>{title}</h2>
      {children && <p style={light ? { color: 'var(--on-dark-mut)' } : undefined}>{children}</p>}
    </div>
  );
}

function StatusBadge({ status, spotsLeft }) {
  const s = STATUS[status] || STATUS.open;
  const label = status === 'few' && spotsLeft ? `Ostatnie ${spotsLeft} miejsca` : s.label;
  return (
    <span className={`badge ${s.cls}`}>
      {status !== 'full' && <span className="dot" />} {label}
    </span>
  );
}

function CampCard({ camp }) {
  const t = camp;
  return (
    <Link to={`/oboz/${t.slug}`} className={`camp-card ${t.status === 'full' ? 'is-full' : ''}`}>
      <div className="camp-card__media">
        <Img src={t.hero} ratio="4/3" label={`zdjęcie · ${t.location}`} alt={t.title} />
        <div className="camp-card__top">
          <span className="camp-card__type">{t.type}</span>
          <StatusBadge status={t.status} spotsLeft={t.spotsLeft} />
        </div>
      </div>
      <div className="camp-card__body">
        <div className="camp-card__price">{zl(t.price)}</div>
        <h3 className="camp-card__title">{t.title} {t.year}</h3>
        <p className="camp-card__lead">{t.lead}</p>
        <div className="camp-meta">
          <div className="camp-meta__row"><Icon name="pin" size={17} /> {t.location}</div>
          <div className="camp-meta__row"><Icon name="calendar" size={17} /> {t.dates}</div>
          <div className="camp-meta__row"><Icon name="level" size={17} /> {t.level} · {t.days} dni</div>
        </div>
        <div className="camp-card__cta">
          <span className="camp-card__link">Zobacz obóz <Icon name="arrow-right" size={18} /></span>
        </div>
      </div>
    </Link>
  );
}

const VOUCHER_THEMES = {
  warm: { vc: '#F65824', bg: 'assets/home-hero.webp' },
  cool: { vc: '#2f6f9e', bg: 'assets/team-2.webp' },
  folk: { vc: '#c2362b', bg: 'assets/team-1.webp' },
};

function VoucherArt({ theme = 'warm', amount = 500, recipient, custom, style, className }) {
  const t = VOUCHER_THEMES[theme] || VOUCHER_THEMES.warm;
  return (
    <div className={`voucher voucher--cqw ${className || ''}`} style={{ '--vc': t.vc, ...style }}>
      <div className="voucher__bg"><img src={t.bg} alt="" /></div>
      <div className="voucher__shade" />
      <div className="voucher__inner">
        <div className="voucher__top">
          <span className="logo-tile"><img src="assets/logo.webp" alt="Tatra Running" /></span>
          <span className="voucher__kicker">Bon<br/>podarunkowy</span>
        </div>
        <div>
          {recipient ? <div className="voucher__ded">Dla {recipient}</div> : null}
          <div className="voucher__amt" style={{ color: amount ? '#fff' : 'rgba(255,255,255,.6)' }}>
            {custom && !amount ? '— —' : new Intl.NumberFormat('pl-PL').format(amount)}<small>PLN</small>
          </div>
          <div className="voucher__brand">Obozy · Treningi · Skitury</div>
        </div>
      </div>
      <div className="voucher__stripe"><i/></div>
    </div>
  );
}

Object.assign(window, { Reveal, SectionHeading, StatusBadge, CampCard, VoucherArt });
