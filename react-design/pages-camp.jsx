/* ============================================================
   CAMP DETAIL PAGE
   ============================================================ */
const GALLERY_POOL = ['assets/team-2.webp', 'assets/team-eko.webp', 'assets/team-1.webp', 'assets/home-hero.webp', 'assets/team-hero.webp'];

const REVIEWS = [
  { text: 'Najlepiej zorganizowany wyjazd, na jakim byłam. Trenerzy ogarniają wszystko, a tempo dopasowane do grupy. Wróciłam silniejsza i z głową pełną widoków.', who: 'Karolina M.', camp: 'Uczestniczka obozu w Kirgistanie' },
  { text: 'Kameralna grupa robi robotę — czujesz, że trener naprawdę patrzy na Twój bieg. Poziom organizacji i bezpieczeństwa premium.', who: 'Tomek R.', camp: 'Uczestnik obozu Adventure' },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(2); // dzień 2 open like screenshot
  return (
    <div className="acc">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className={`acc__item ${isOpen ? 'open' : ''}`} key={i}>
            <button className="acc__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
              <span className="titles">
                <span className="day">{it.day}</span>
                <span>{it.title}</span>
              </span>
              <Icon name="chevron-down" size={22} className="acc__chev" />
            </button>
            <div className="acc__panel" style={{ maxHeight: isOpen ? `${(it.items.length * 36) + 40}px` : 0 }}>
              <ul>{it.items.map((x, j) => <li key={j}>{x}</li>)}</ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingCard({ camp }) {
  const cart = useCart();
  const contactLink = useContactLink();
  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const on = () => { setIsMobile(mq.matches); if (!mq.matches) setExpanded(false); };
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const unit = camp.deposit;
  const rest = camp.price - camp.deposit;
  const sold = camp.status === 'full';

  const addToCart = () => {
    cart.add({
      key: `camp-${camp.slug}-deposit`,
      type: 'camp',
      title: `${camp.title} ${camp.year}`,
      sub: `Zaliczka · ${camp.dates}`,
      price: unit, qty, image: camp.hero, meta: camp.location,
    });
    setExpanded(false);
  };

  const sheet = (
    <React.Fragment>
      {isMobile && expanded && <div className="booking__scrim" onClick={() => setExpanded(false)} />}
      <aside className={`booking ${sold ? '' : 'booking--sheet'} ${expanded ? 'is-open' : ''}`}>
        {/* mobile-only grab handle + pull-up hint */}
        {!sold && (
          <button className="booking__grab" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} aria-label="Szczegóły rezerwacji">
            <span className="booking__grabbar" />
            <span className="booking__hint">
              <Icon name="chevron-down" size={15} className="booking__hint-chev" />
              {expanded ? 'Zwiń szczegóły' : 'Przeciągnij, aby zobaczyć szczegóły'}
            </span>
          </button>
        )}

        <div className="booking__scroll">
          <div className="booking__head">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div className="booking__price">{zl(camp.price)} <small>/ os.</small></div>
              <StatusBadge status={camp.status} spotsLeft={camp.spotsLeft} />
            </div>
          </div>
          <div className="booking__body">
            {!sold && (
              <React.Fragment>
                <div className="qty" role="group" aria-label="Liczba osób">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Mniej"><Icon name="minus" size={18} /></button>
                  <span>{qty} {qty === 1 ? 'osoba' : 'osoby'}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Więcej"><Icon name="plus" size={18} /></button>
                </div>

                <div className="book-deposit">
                  <div className="book-deposit__row">
                    <span>Zaliczka teraz</span>
                    <b>{zl(camp.deposit * qty)}</b>
                  </div>
                  <div className="book-deposit__row book-deposit__row--mut">
                    <span>Reszta na miejscu</span>
                    <span>{zl(rest * qty)}</span>
                  </div>
                  <p className="book-deposit__note">Rezerwujesz miejsce zaliczką — pozostałą kwotę rozliczasz gotówką na miejscu, na starcie obozu.</p>
                </div>

                <button className="btn btn--accent btn--block btn--lg booking__cta-desktop" onClick={addToCart}>
                  Zarezerwuj — zaliczka {zl(unit * qty)}
                </button>
              </React.Fragment>
            )}

            {sold && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', marginBottom: 14 }}>Ten obóz jest wyprzedany. Zapisz się na listę rezerwową.</p>
                <a href="mailto:contact@tatrarunning.pl" className="btn btn--ink btn--block btn--lg"><Icon name="mail" size={18} /> Lista rezerwowa</a>
              </div>
            )}

            <div className="trust-row">
              <span><Icon name="shield" size={15} /> Ubezpieczenie NNW</span>
              <span><Icon name="check" size={15} /> Składki TFG i TFP</span>
            </div>

            <a className="btn btn--ghost btn--block booking__call" {...contactLink}>
              <Icon name="phone" size={17} /> Masz pytania? +48 500 152 300
            </a>
          </div>
        </div>

        {/* mobile-only collapsed action bar: price left, Zarezerwuj right */}
        {!sold && (
          <div className="booking__action">
            <div className="booking__action-price">{zl(camp.price)}<small>/ os.</small></div>
            <button className="btn btn--accent" onClick={addToCart}>Zarezerwuj</button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );

  if (isMobile && !sold) return cart.open ? null : ReactDOM.createPortal(sheet, document.body);
  return sheet;
}

function CampDetail({ slug }) {
  const camp = getCamp(slug);
  if (!camp) return <SimplePage title="Nie znaleziono obozu" eyebrow="Ups" lead="Ten obóz nie istnieje lub został przeniesiony." />;
  const trainers = (camp.coachSlugs || []).map(getTrainer).filter(Boolean);
  const intro = camp.intro || [camp.lead];

  return (
    <main className="cd-page">
      <div className="cd-hero">
        <Img src={camp.hero} label={`panorama · ${camp.location}`} alt={camp.title} />
        <div className="cd-hero__grad" />
      </div>

      <div className="wrap wrap--wide">
        <div className="cd-titlebar">
          <div className="breadcrumb">
            <Link to="/">Home</Link><Icon name="chevron-right" size={14} />
            <Link to="/obozy">Obozy</Link><Icon name="chevron-right" size={14} />
            <span>{camp.title}</span>
          </div>
          <div className="price">{zl(camp.price)}</div>
          <h1>{camp.title} {camp.year}</h1>
          <div className="cd-chips">
            <span className="pill"><Icon name="pin" size={16} /> {camp.location}</span>
            <span className="pill"><Icon name="calendar" size={16} /> {camp.dates}</span>
            <span className="pill"><Icon name="level" size={16} /> {camp.level}</span>
            <span className="pill"><Icon name="clock" size={16} /> {camp.days} dni</span>
          </div>
        </div>

        <div className="cd-grid">
          <div className="cd-main">
            <section className="cd-prose">
              {intro.map((p, i) => <p key={i}>{p}</p>)}
            </section>

            {camp.included && (
              <section>
                <h2>Co jest w cenie?</h2>
                <div className="incl-grid">
                  <ul className="incl-list incl-yes">
                    {camp.included.map((x, i) => <li key={i}><span className="ic"><Icon name="check" size={14} /></span> {x}</li>)}
                  </ul>
                  {camp.excluded && (
                    <ul className="incl-list incl-no">
                      <li style={{ fontWeight: 700, color: 'var(--ink)', paddingBottom: 4 }}>Czego cena nie obejmuje:</li>
                      {camp.excluded.map((x, i) => <li key={i}><span className="ic"><Icon name="close" size={13} /></span> {x}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {camp.plan && (
              <section>
                <h2>Ramowy plan obozu</h2>
                <Accordion items={camp.plan} />
              </section>
            )}

            {camp.where && (
              <section>
                <h2><span className="eyebrow">Trening</span>Gdzie biegamy?</h2>
                <div className="cd-prose"><p>{camp.where}</p></div>
                <div className="gallery" style={{ marginTop: 22 }}>
                  {GALLERY_POOL.slice(0, 5).map((g, i) => <Img key={i} src={g} label="zdjęcie z trasy" alt="" />)}
                </div>
              </section>
            )}

            {camp.sleep && (
              <section>
                <h2><span className="eyebrow">Regeneracja</span>Gdzie nocujemy?</h2>
                <div className="cd-prose"><p>{camp.sleep}</p></div>
              </section>
            )}

            {camp.prep && (
              <section>
                <h2>Jak przygotować się na obóz?</h2>
                <div className="cd-prose"><p>{camp.prep}</p></div>
              </section>
            )}

            {trainers.length > 0 && (
              <section>
                <h2>Prowadzący trenerzy</h2>
                <div className="mini-trainers">
                  {trainers.map((t) => (
                    <Link to={`/trener/${t.slug}`} className="mini-trainer" key={t.slug}>
                      <img src={t.photo} alt={t.name} />
                      <span><b>{t.name}</b><span>{t.role}</span></span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2>Opinie uczestników</h2>
              <div className="reviews">
                {REVIEWS.map((r, i) => (
                  <div className="review" key={i}>
                    <div className="review__stars">{[0,1,2,3,4].map((s) => <Icon key={s} name="star" size={16} />)}</div>
                    <p>„{r.text}"</p>
                    <div className="review__who">{r.who}<span>{r.camp}</span></div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>Zasady dotyczące rezerwacji</h2>
              <div className="cd-prose" style={{ color: 'var(--body)' }}>
                <p>Aby zarezerwować miejsce na obozie, dodaj go do koszyka i opłać pełną kwotę lub zaliczkę za dany obóz.</p>
                <p>Bezpłatna rezygnacja i zwrot wpłaconej raty przysługuje przy rezygnacji do 60 dni przed rozpoczęciem szkolenia, bez względu na powód. Przy rezygnacji na mniej niż 60 dni przed terminem rozpoczęcia obozu nie mamy obowiązku zwrotu wpłaconej raty.</p>
                <p>Kwota opłaty rezerwacyjnej na wszystkie obozy w Polsce i na Słowacji wynosi 750 zł, a na pozostałe obozy zagraniczne 2000 zł.</p>
              </div>
            </section>
          </div>

          <BookingCard camp={camp} />
        </div>
      </div>

      <div style={{ height: 'clamp(48px,7vw,96px)' }} />
    </main>
  );
}

Object.assign(window, { CampDetail });
