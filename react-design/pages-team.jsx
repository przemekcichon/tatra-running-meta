/* ============================================================
   TEAM HUB + TRAINER DETAIL
   ============================================================ */
function TeamPage() {
  const trainers = window.TRAINERS || [];
  return (
    <main>
      {/* hero band (dark cinematic) */}
      <section className="cd-hero" style={{ height: 'min(82vh, 760px)' }}>
        <Img src="assets/team-hero.webp" alt="Zespół Tatra Running w górach" imgPos="center 32%" />
        <div className="cd-hero__grad" style={{ background: 'linear-gradient(to top, rgba(15,14,11,.85), rgba(15,14,11,.15) 60%)' }} />
        <div className="cd-hero__badges">
          <div className="wrap wrap--wide">
            <div className="eyebrow" style={{ color: '#fff', opacity: .85 }}>Tatra Running Team</div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(38px,6vw,72px)', marginTop: 10 }}>Z nami wzbijesz się<br/>na wyższy poziom</h1>
          </div>
        </div>
      </section>

      {/* philosophy */}
      <section className="section">
        <div className="wrap wrap--wide">
          <div className="split">
            <div>
              <SectionHeading eyebrow="O zespole" title="Team — nasi instruktorzy biegania po górach">
                Dzięki Tatra Running Camps bieganie, uprawianie skiturów oraz świadome podnoszenie poziomu sportowego staje się efektywniejsze i bardziej przystępne. Jesteśmy zgranym zespołem instruktorów, którzy połączyli pasje, wiedzę i wieloletnie doświadczenie.
              </SectionHeading>
              <p style={{ marginTop: 20, color: 'var(--body)' }}>
                Kluczem do sukcesu naszych obozów jest to, że prowadzą je wyczynowi zawodnicy z wieloletnim stażem i osiągnięciami — w biegach długich, ultra, górskich, triathlonie i skialpinizmie. Lubimy pracować z kameralną grupą maks. kilkunastu uczestników, by dawać im maksimum zindywidualizowanych wskazówek.
              </p>
            </div>
            <div className="split__media"><Img src="assets/team-1.webp" alt="Zespół Tatra Running" ratio="5/4" /></div>
          </div>
        </div>
      </section>

      {/* trainer grid */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap wrap--wide">
          <SectionHeading eyebrow="Trenerzy" title="Poznaj naszą kadrę">
            Podczas swoich karier sportowych zdobyliśmy niejeden szczyt. Teraz chcemy podzielić się z Wami doświadczeniem.
          </SectionHeading>
          <div className="team-grid" style={{ marginTop: 40 }}>
            {trainers.map((t) => (
              <Link to={`/trener/${t.slug}`} className="tcard" key={t.slug}>
                <img src={t.photo} alt={t.name} />
                <div className="tcard__grad" />
                <div className="tcard__arrow"><Icon name="arrow-ur" size={18} /></div>
                <div className="tcard__body">
                  <div className="tcard__tags">{t.tags.slice(0, 2).map((tag) => <span className="tcard__tag" key={tag}>{tag}</span>)}</div>
                  <div className="tcard__name">{t.name}</div>
                  <div className="tcard__role">{t.role}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* eco band */}
      <section className="section band-dark">
        <div className="wrap wrap--wide">
          <div className="split">
            <div className="split__media"><Img src="assets/team-eko.webp" alt="Edukacja ekologiczna" ratio="5/4" /></div>
            <div>
              <SectionHeading eyebrow="Eko" title="Edukacja ekologiczna" light>
                Bardzo ważnym elementem naszej misji jest edukacja ekologiczna obozowiczów. Zależy nam, by trenując na terenie Tatrzańskiego Parku Narodowego, byli wrażliwi na florę i faunę Tatr i świadomi wpływu, jaki ich obecność wywiera na środowisko.
              </SectionHeading>
              <p style={{ marginTop: 18, color: 'var(--on-dark-mut)' }}>
                Dlatego w programie każdego obozu biegowego znajdują się warsztaty ekologiczne prowadzone przez pracowników naukowych Tatrzańskiego Parku Narodowego.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrainerDetail({ slug }) {
  const t = getTrainer(slug);
  if (!t) return <SimplePage title="Nie znaleziono trenera" eyebrow="Ups" lead="Ten profil nie istnieje." />;
  const camps = (window.CAMPS || []).filter((c) => (c.coachSlugs || []).includes(slug));
  return (
    <main>
      <section className="section" style={{ paddingBottom: 'clamp(40px,6vw,72px)' }}>
        <div className="wrap wrap--wide">
          <div className="breadcrumb" style={{ marginBottom: 28 }}>
            <Link to="/">Home</Link><Icon name="chevron-right" size={14} />
            <Link to="/zespol">Zespół</Link><Icon name="chevron-right" size={14} />
            <span>{t.name}</span>
          </div>
          <div className="td-grid">
            <div className="td-photo"><img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            <div>
              <div className="eyebrow">Cześć, jestem</div>
              <h1 style={{ fontSize: 'clamp(34px,5vw,58px)', marginTop: 10 }}>{t.name}</h1>
              <p className="lead" style={{ marginTop: 12, color: 'var(--accent-ink)', fontWeight: 600 }}>{t.role}</p>

              <div className="td-medals">
                {t.medals.map((m) => <div className="td-medal" key={m}><b>{m}</b></div>)}
              </div>

              <div className="td-bio cd-prose">
                {t.bio.map((p, i) => <p key={i}>{p}</p>)}
              </div>

              <div className="td-contact">
                <a href={`tel:+48${t.phone.replace(/\s/g, '')}`} className="btn btn--ink"><Icon name="phone" size={18} /> {t.phone}</a>
                <a href="mailto:contact@tatrarunning.pl" className="btn btn--ghost"><Icon name="mail" size={18} /> contact@tatrarunning.pl</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {camps.length > 0 && (
        <section className="section band-dark" style={{ paddingBlock: 'clamp(44px,6vw,80px)' }}>
          <div className="wrap wrap--wide">
            <SectionHeading light eyebrow="Wyprawy" title={`Obozy z ${t.name.split(' ')[0]}${t.name.split(' ')[0].endsWith('a') ? '' : 'em'}`} />
            <div className="camp-grid" style={{ marginTop: 36 }}>
              {camps.slice(0, 3).map((c) => <CampCard key={c.slug} camp={c} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

Object.assign(window, { TeamPage, TrainerDetail });
