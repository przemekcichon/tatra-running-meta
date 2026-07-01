/* ============================================================
   Camp list, Partners, Contact, Blog (light), 404
   ============================================================ */
function PageHero({ eyebrow, title, children, crumbs }) {
  return (
    <section className="page-hero">
      <div className="wrap wrap--wide">
        {crumbs && (
          <div className="breadcrumb">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={14} />}
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </section>
  );
}

const CAMP_CATS = {
  biegowe: {
    title: 'Obozy biegowe',
    intro: 'Treningi biegowe w górach — od pierwszego obozu w kameralnej grupie, po wymagające biegowo-trekkingowe eskapady Adventure w góry świata.',
    match: (c) => c.type === 'Bieg' || c.type === 'Adventure',
  },
  skitour: {
    title: 'Obozy skiturowe',
    intro: 'Górska turystyka zimowa na nartach — klasyczne podejścia i dziewicze zjazdy pod okiem mistrzów świata, od pierwszych kroków po zaawansowane wyjazdy.',
    match: (c) => c.type === 'Skitury',
  },
  kids: {
    title: 'Obozy Kids',
    intro: 'Górskie przygody dla najmłodszych — zabawa, ruch i pierwsze szlaki w bezpiecznej, opiekuńczej atmosferze.',
    match: (c) => c.audience === 'kids',
  },
  junior: {
    title: 'Obozy Junior',
    intro: 'Trening i rywalizacja dla młodzieży — biegowe i skiturowe wyjazdy dopasowane do młodych zawodników.',
    match: (c) => c.audience === 'junior',
  },
};

function CampsPage({ cat }) {
  const all = window.CAMPS || [];
  const def = CAMP_CATS[cat];
  const camps = def ? all.filter(def.match) : all;
  const title = def ? def.title : 'Obozy biegowe i skiturowe';
  const intro = def ? def.intro
    : 'Organizujemy różne typy wyjazdów — od obozów Basic Camp dla początkujących, po obozy Adventure dla bardziej zaawansowanych. Mamy też ofertę przeznaczoną stricte dla kobiet. Każdy znajdzie tu coś dla siebie.';
  return (
    <main>
      <PageHero eyebrow="Oferta 2026" title={title}
        crumbs={[{ label: 'Home', to: '/' }, { label: def ? def.title : 'Obozy' }]}>
        {intro}
      </PageHero>
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <div className="row-between" style={{ marginBottom: 28 }}>
            <span className="pill"><Icon name="mountain" size={16} /> {camps.length} {camps.length === 1 ? 'wyprawa' : 'wypraw'} w sezonie 2026</span>
          </div>
          {camps.length > 0 ? (
            <div className="camp-grid">
              {camps.map((c) => <CampCard key={c.slug} camp={c} />)}
            </div>
          ) : (
            <div className="camps-empty">
              <Icon name="mountain" size={32} />
              <h3>Terminy w przygotowaniu</h3>
              <p>Pracujemy nad nowymi wyjazdami z tej kategorii. Zapisz się do newslettera, a damy znać, gdy ruszą zapisy.</p>
              <Link to="/obozy" className="btn btn--ink">Zobacz wszystkie obozy</Link>
            </div>
          )}
        </div>
      </section>

      {/* reassurance band */}
      <section className="section band-dark" style={{ paddingBlock: 'clamp(40px,6vw,72px)' }}>
        <div className="wrap wrap--wide">
          <div className="values" style={{ marginTop: 0 }}>
            {[
              { ic: 'shield', h: 'Bezpieczeństwo', p: 'Ubezpieczenie NNW, składki TFG i TFP, lokalni przewodnicy i doświadczona kadra.' },
              { ic: 'clock', h: 'Elastyczna rezerwacja', p: 'Bezpłatna rezygnacja i zwrot raty do 60 dni przed startem obozu, bez względu na powód.' },
              { ic: 'users', h: 'Organizator turystyki', p: 'Działamy legalnie — wpis do Rejestru Organizatorów Turystyki Marszałka Województwa Małopolskiego.' },
            ].map((v) => (
              <div className="value" key={v.h}>
                <div className="value__ic"><Icon name={v.ic} size={24} /></div>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PartnersPage() {
  const P = window.PARTNERS || { strategic: [], technical: [] };
  const tech = [...P.technical, ...P.technical];
  return (
    <main>
      <PageHero eyebrow="Partnerzy" title="Razem w górach"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Partnerzy' }]}>
        Marki i instytucje, które wspierają nasze wyprawy sprzętowo, merytorycznie i medialnie. Dziękujemy, że jesteście z nami na trasie.
      </PageHero>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <div className="eyebrow eyebrow--mut" style={{ marginBottom: 22 }}>Partnerzy strategiczni</div>
          <div className="partner-strat">
            {P.strategic.map((p) => (
              <div className="partner-card" key={p.name}>
                <div className="partner-logo">{p.name.split(' ').map((w) => w[0]).join('').slice(0, 3)}</div>
                <h3>{p.name}</h3>
                <p>{p.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap wrap--wide">
          <div className="eyebrow eyebrow--mut" style={{ marginBottom: 22 }}>Partnerzy techniczni i medialni</div>
        </div>
        <div className="marquee">
          <div className="marquee__track">
            {tech.map((p, i) => <div className="logo-chip" key={i}>{p.name}</div>)}
          </div>
        </div>
      </section>

      <section className="section band-dark" style={{ paddingBlock: 'clamp(44px,6vw,80px)' }}>
        <div className="wrap wrap--wide" style={{ textAlign: 'center' }}>
          <SectionHeading center light eyebrow="Współpraca" title="Chcesz zostać partnerem?">
            Jesteśmy otwarci na współpracę z markami outdoorowymi, mediami i instytucjami. Napisz do nas — opowiemy o naszych wyprawach i zasięgach.
          </SectionHeading>
          <div className="center-cta">
            <a href="mailto:contact@tatrarunning.pl" className="btn btn--accent btn--lg"><Icon name="mail" size={20} /> Napisz do nas</a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <main>
      <PageHero eyebrow="Jesteśmy tu dla Ciebie" title="Skontaktuj się z nami"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Kontakt' }]}>
        Wyślij nam wiadomość, a postaramy się odpowiedzieć do końca następnego dnia roboczego. Chętnie doradzimy w wyborze obozu i odpowiemy na każde pytanie.
      </PageHero>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <div className="ct-grid">
            {/* form / success */}
            {sent ? (
              <div className="ct-success">
                <div className="ic"><Icon name="check" size={30} /></div>
                <h2 style={{ fontSize: 'clamp(26px,3.4vw,38px)' }}>Dziękujemy za wiadomość!</h2>
                <p style={{ marginTop: 14, color: 'var(--body)', maxWidth: '46ch', marginInline: 'auto' }}>
                  Odezwiemy się do Ciebie najpóźniej do końca następnego dnia roboczego. W pilnych sprawach zadzwoń pod jeden z numerów obok.
                </p>
                <div className="center-cta" style={{ marginTop: 24 }}>
                  <button className="btn btn--ink" onClick={() => setSent(false)}>Wyślij kolejną wiadomość</button>
                </div>
              </div>
            ) : (
              <form className="ct-form-card" onSubmit={submit}>
                <div className="eyebrow">Formularz kontaktowy</div>
                <h2>Napisz do nas</h2>
                <p className="lead">Uzupełnij poniższe pola — im więcej szczegółów, tym lepiej dobierzemy odpowiedź.</p>

                <div className="ct-form">
                  <div className="cfg-row2">
                    <div className="field"><label>Imię</label><input className="cfg-input" required placeholder="Jan" /></div>
                    <div className="field"><label>Nazwisko</label><input className="cfg-input" required placeholder="Kowalski" /></div>
                  </div>
                  <div className="cfg-row2">
                    <div className="field"><label>Adres e-mail</label><input className="cfg-input" type="email" required placeholder="jan@example.com" /></div>
                    <div className="field"><label>Telefon</label><input className="cfg-input" placeholder="500 100 200" /></div>
                  </div>
                  <div className="field"><label>Temat wiadomości</label><input className="cfg-input" required placeholder="np. Pytanie o Tatry Trail Camp" /></div>
                  <div className="field" style={{ marginBottom: 0 }}><label>Treść wiadomości</label><textarea className="cfg-textarea" required rows={6} placeholder="W czym możemy pomóc?" /></div>

                  <button type="submit" className="btn btn--accent btn--block btn--lg" style={{ marginTop: 20 }}>
                    <Icon name="mail" size={18} /> Wyślij wiadomość
                  </button>
                  <div className="ct-priv"><Icon name="shield" size={15} /> Szanujemy Twoją prywatność. Nie dzielimy się Twoimi danymi.</div>
                </div>
              </form>
            )}

            {/* info column */}
            <aside className="ct-info">
              <div className="ct-card">
                <div className="ct-card__head"><div className="ct-card__ic"><Icon name="pin" size={20} /></div><h3>Nasza siedziba</h3></div>
                <p>ul. Kościelna 21, lok. 14<br/>34-500 Zakopane</p>
                <div className="embed-frame ct-map">
                  <iframe
                    title="Mapa — Tatra Running, Zakopane"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=19.9376%2C49.2908%2C19.9616%2C49.3076&layer=mapnik&marker=49.2992%2C19.9496"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                  />
                  <a className="embed-frame__open" href="https://www.openstreetmap.org/?mlat=49.2992&mlon=19.9496#map=15/49.2992/19.9496" target="_blank" rel="noopener noreferrer">
                    Większa mapa <Icon name="external" size={14} />
                  </a>
                </div>
              </div>

              <div className="ct-card">
                <div className="ct-card__head"><div className="ct-card__ic"><Icon name="mail" size={20} /></div><h3>Adres e-mail</h3></div>
                <a className="ct-link" href="mailto:contact@tatrarunning.pl">contact@tatrarunning.pl</a>
              </div>

              <div className="ct-card">
                <div className="ct-card__head"><div className="ct-card__ic"><Icon name="phone" size={20} /></div><h3>Nasze numery</h3></div>
                <div className="ct-num"><span>Kuba Osiecki</span><a href="tel:+48500152300">+48 500 152 300</a></div>
                <div className="ct-num"><span>Magda Derezińska-Osiecka</span><a href="tel:+48505104062">+48 505 104 062</a></div>
              </div>

              <div className="ct-card">
                <div className="ct-card__head"><div className="ct-card__ic"><Icon name="check" size={20} /></div><h3>Numer konta</h3></div>
                <p className="ct-acct">86 1050 1445 1000 0090 9778 4764</p>
              </div>

              <div className="ct-card">
                <div className="ct-card__head"><div className="ct-card__ic"><Icon name="users" size={20} /></div><h3>Social media</h3></div>
                <SocialRow className="ct-socials" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function NewsletterThanksPage() {
  const benefits = [
    { ic: 'mountain', t: 'Nowe obozy i terminy', d: 'Pierwsi dowiadujecie się, gdy ruszają zapisy na biegowe i skiturowe wyprawy w góry świata.' },
    { ic: 'check', t: 'Ostatnie wolne miejsca', d: 'Informacja o dogrywkach i miejscach, które zwolniły się na pełnych już wyjazdach.' },
    { ic: 'gift', t: 'Historie z gór i porady', d: 'Relacje z tras, treningowe wskazówki i inspiracje — kilka razy w sezonie, bez spamu.' },
  ];
  return (
    <main>
      <PageHero eyebrow="Witaj na pokładzie" title="Dziękujemy za zapis do newslettera"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Newsletter' }]}>
        Twój adres jest już na naszej liście. Sprawdź skrzynkę i kliknij link potwierdzający, aby dokończyć zapis — dopiero wtedy zaczniemy wysyłać Ci wiadomości.
      </PageHero>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="news-thanks__confirm">
            <div className="news-thanks__ic"><Icon name="mail" size={26} /></div>
            <div>
              <h2>Potwierdź swój adres e-mail</h2>
              <p>Wysłaliśmy do Ciebie wiadomość z linkiem aktywacyjnym. Kliknij go w ciągu 24 godzin, aby aktywować subskrypcję. Jeśli nie widzisz maila, zajrzyj do folderu „Oferty" lub „Spam".</p>
            </div>
          </div>

          <div className="news-thanks__head">
            <div className="eyebrow">Co będziemy wysyłać</div>
            <h2>Oto, co znajdziesz w swojej skrzynce</h2>
          </div>
          <div className="news-thanks__grid">
            {benefits.map((b, i) => (
              <div className="news-thanks__card" key={i}>
                <div className="news-thanks__card-ic"><Icon name={b.ic} size={22} /></div>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>

          <div className="center-cta" style={{ marginTop: 36 }}>
            <Link to="/obozy" className="btn btn--ink btn--lg">Zobacz nadchodzące obozy <Icon name="arrow-right" size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SimplePage({ title, eyebrow, lead }) {
  return (
    <main>
      <PageHero eyebrow={eyebrow} title={title} crumbs={[{ label: 'Home', to: '/' }, { label: title }]}>{lead}</PageHero>
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="ph" style={{ minHeight: 280, borderRadius: 'var(--r-lg)' }}>
            sekcja „{title}" — poza zakresem tego prototypu
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PageHero, CampsPage, PartnersPage, ContactPage, SimplePage, NewsletterThanksPage });
