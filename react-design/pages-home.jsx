/* ============================================================
   HOME PAGE
   ============================================================ */
function HomePage() {
  const camps = window.CAMPS || [];
  const featured = camps.slice(0, 3);
  const stats = [
    { num: '14.', lab: 'sezon wypraw' },
    { num: '500+', lab: 'zadowolonych uczestników' },
    { num: '3', lab: 'kontynenty obozów' },
    { num: 'max 14', lab: 'osób w kameralnej grupie' },
  ];
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg"><img src="assets/home-hero.webp" alt="Grupa biegaczy w górach z trenerami Tatra Running" /></div>
        <div className="hero__overlay" />
        <div className="hero__inner">
          <div className="wrap wrap--wide">
            <div style={{ maxWidth: 760 }}>
              <div className="eyebrow hero__eyebrow">14. sezon w górach · 2026</div>
              <h1 className="hero__title display">Tatra<br/>Running</h1>
              <p className="hero__sub">Bieganie. Skitury. Obozy. Treningi.</p>
              <div className="hero__cta">
                <Link to="/obozy" className="btn btn--accent btn--lg">Zobacz obozy 2026 <Icon name="arrow-right" size={20} /></Link>
                <Link to="/bony" className="btn btn--ghost-dark btn--lg"><Icon name="gift" size={20} /> Podaruj bon</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="wrap wrap--wide" style={{ position: 'relative', zIndex: 2, marginTop: -80 }}>
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div className="hero-stats__cell" key={i}>
              <div className="hero-stats__num">{s.num}</div>
              <div className="hero-stats__lab">{s.lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NAJBLIŻSZE OBOZY */}
      <section className="section">
        <div className="wrap wrap--wide">
          <Reveal className="row-between">
            <SectionHeading eyebrow="Najbliższe obozy" title="Wyjazdy skiturowe i obozy biegowe na 2026">
              Już czternasty rok z kolei zapraszamy Was na wyjazdy skiturowe i obozy biegowe! Tatry, Kaukaz, Pireneje, Alpy, a może Maroko czy góry Rumunii.
            </SectionHeading>
            <Link to="/obozy" className="btn btn--ghost" style={{ flex: '0 0 auto' }}>Wszystkie obozy <Icon name="arrow-right" size={18} /></Link>
          </Reveal>
          <Reveal className="camp-grid" style={{ marginTop: 48 }}>
            {featured.map((c) => <CampCard key={c.slug} camp={c} />)}
          </Reveal>
        </div>
      </section>

      {/* TEAM TEASER */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap wrap--wide">
          <Reveal className="split">
            <div className="split__media"><Img src="assets/team-1.webp" alt="Zespół Tatra Running" ratio="5/4" /></div>
            <div>
              <SectionHeading eyebrow="O nas" title="Instruktorzy biegania po górach">
                Na co dzień jesteśmy czynnymi instruktorami biegania w Tatrach, którzy połączyli pasje, wiedzę i wieloletnie doświadczenie, aby pomóc podopiecznym osiągać maksimum możliwości sportowych i górskich. Ponad dziesięć lat doświadczenia w organizacji obozów biegowych i skiturowych.
              </SectionHeading>
              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/zespol" className="btn btn--ink">Poznaj zespół <Icon name="arrow-right" size={18} /></Link>
                <Link to="/obozy" className="btn btn--ghost">Oferta obozów</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DARK VALUE BAND */}
      <section className="section band-dark">
        <div className="wrap wrap--wide">
          <Reveal>
            <SectionHeading eyebrow="Dlaczego Tatra Running" title="Wyczynowi zawodnicy. Kameralne grupy. Prawdziwe góry." light>
              Nasze obozy prowadzą zawodnicy z wieloletnim stażem i medalami — w biegach długich, ultra, górskich, triathlonie i skialpinizmie.
            </SectionHeading>
          </Reveal>
          <Reveal className="values">
            {[
              { ic: 'users', h: 'Kameralne grupy', p: 'Pracujemy z grupą maks. kilkunastu uczestników, by dawać maksimum zindywidualizowanych wskazówek.' },
              { ic: 'star', h: 'Mistrzowska kadra', p: 'Mistrzowie świata i Europy, medaliści MP. Praktyczne doświadczenie i umiejętność dzielenia się wiedzą.' },
              { ic: 'leaf', h: 'Edukacja ekologiczna', p: 'Warsztaty ekologiczne prowadzone przez pracowników naukowych Tatrzańskiego Parku Narodowego.' },
            ].map((v) => (
              <div className="value" key={v.h}>
                <div className="value__ic"><Icon name={v.ic} size={24} /></div>
                <h3>{v.h}</h3>
                <p>{v.p}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* VOUCHER PROMO */}
      <section className="section">
        <div className="wrap wrap--wide">
          <Reveal className="promo">
            <div className="promo__grid">
              <div className="promo__text">
                <div className="eyebrow">Bony podarunkowe</div>
                <h2 style={{ marginTop: 14 }}>Podaruj górską przygodę</h2>
                <p>Spraw prezent znajomym, bliskim, najbliższym — jeszcze niebiegającym albo już biegającym z nami. Wybierz kwotę, spersonalizuj dedykację i wyślij bon w kilka minut.</p>
                <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/bony" className="btn btn--accent btn--lg">Kup bon <Icon name="arrow-right" size={20} /></Link>
                </div>
              </div>
              <div className="promo__media">
                <div className="vchip" style={{ padding: 28 }}>
                  <VoucherArt theme="warm" amount={500} recipient="Zosi" style={{ width: '100%', maxWidth: 380, transform: 'rotate(-3deg)' }} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
Object.assign(window, { HomePage });
