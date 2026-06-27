/* ============================================================
   LEGAL / POLICY PAGES
   - LEGAL_DOCS: shared registry (icon, route, labels) used by the
     hub, the header chips and each document title.
   - LegalDoc: reusable layout — header with icon-in-title + chips to
     sibling docs, body on the left, sticky TOC on the RIGHT with
     "last updated" + previous-version links, scrollspy highlighting.
   - LegalHubPage: section landing with icon/text boxes.
   Focus is on FORM (how a policy reads), not on the placeholder copy.
   ============================================================ */

const LEGAL_DOCS = [
  { id: 'shopTerms', route: '/regulamin', icon: 'bag',
    label: 'Regulamin sklepu', chip: 'Regulamin sklepu',
    desc: 'Zasady składania zamówień, płatności, dostawy i zwrotów w sklepie.' },
  { id: 'newsletterRules', route: '/zasady-newslettera', icon: 'mail',
    label: 'Zasady wysyłki newslettera', chip: 'Zasady newslettera',
    desc: 'Jak działa newsletter, co i jak często wysyłamy oraz jak zrezygnować.' },
  { id: 'privacy', route: '/prywatnosc', icon: 'shield',
    label: 'Informacja o przetwarzaniu danych', chip: 'Przetwarzanie danych',
    desc: 'Kto i w jakim celu przetwarza Twoje dane oraz jakie masz prawa.' },
];

function LegalDoc({ id, eyebrow, title, updated, intro, sections, versions }) {
  const [active, setActive] = useState(sections[0] && sections[0].id);
  const meta = LEGAL_DOCS.find((d) => d.id === id) || {};
  const others = LEGAL_DOCS.filter((d) => d.id !== id);
  const vers = versions || ['12 marca 2026', '4 listopada 2025', '20 czerwca 2025'];

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const jump = (e, sid) => {
    e.preventDefault();
    const el = document.getElementById(sid);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 104;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <main>
      <section className="page-hero legal-hero">
        <div className="wrap wrap--wide">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <Icon name="chevron-right" size={14} />
            <Link to="/dokumenty">Dokumenty</Link>
            <Icon name="chevron-right" size={14} />
            <span>{title}</span>
          </div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="legal-hero__title">
            <span className="legal-hero__icon"><Icon name={meta.icon} size={26} /></span>
            {title}
          </h1>
          <p className="legal-hero__intro">{intro}</p>
          <div className="legal-hero__chips">
            <span className="legal-hero__chips-label">Pozostałe dokumenty</span>
            {others.map((d) => (
              <Link key={d.id} to={d.route} className="legal-chip">
                <Icon name={d.icon} size={15} /> {d.chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section legal" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <div className="legal__grid">
            <div className="legal__body">
              {sections.map((s, i) => (
                <section className="legal__section" id={s.id} key={s.id}>
                  <div className="legal__section-head">
                    <span className="legal__section-num">{String(i + 1).padStart(2, '0')}</span>
                    <h2>{s.title}</h2>
                  </div>
                  {s.blocks.map((b, j) => {
                    if (b.type === 'p') return <p key={j}>{b.text}</p>;
                    if (b.type === 'list') return (
                      <ul className="legal__list" key={j}>
                        {b.items.map((it, k) => <li key={k}>{it}</li>)}
                      </ul>
                    );
                    if (b.type === 'callout') return (
                      <div className="legal__callout" key={j}>
                        <Icon name={b.icon || 'shield'} size={18} />
                        <p>{b.text}</p>
                      </div>
                    );
                    if (b.type === 'sub') return <h3 className="legal__sub" key={j}>{b.text}</h3>;
                    return null;
                  })}
                </section>
              ))}

              <div className="legal__foot">
                <p>Masz pytania dotyczące tego dokumentu?</p>
                <Link to="/kontakt" className="btn btn--ink">Napisz do nas <Icon name="arrow-right" size={18} /></Link>
              </div>
            </div>

            <aside className="legal__aside">
              <div className="legal__toc">
                <div className="legal__toc-head">
                  <span className="legal__toc-ic"><Icon name={meta.icon} size={16} /></span>
                  <span className="legal__toc-label">Spis treści</span>
                </div>
                <nav>
                  <ol>
                    {sections.map((s, i) => (
                      <li key={s.id}>
                        <a href={'#' + s.id}
                          className={active === s.id ? 'is-active' : ''}
                          onClick={(e) => jump(e, s.id)}>
                          <span className="legal__toc-num">{String(i + 1).padStart(2, '0')}</span>
                          <span>{s.title}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
                <div className="legal__meta">
                  <Icon name="shield" size={14} />
                  <span>Aktualizacja: {updated}</span>
                </div>
                <div className="legal__versions">
                  <div className="legal__versions-label">Poprzednie wersje</div>
                  {vers.map((v, i) => (
                    <a key={i} href="#" className="legal__version" onClick={(e) => e.preventDefault()}>
                      <Icon name="chevron-right" size={13} /> {v}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Hub / section landing ---------------- */
function LegalHubPage() {
  return (
    <main>
      <PageHero eyebrow="Centrum pomocy" title="Dokumenty prawne"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Dokumenty' }]}>
        Wszystkie zasady korzystania z serwisu Tatra Running w jednym miejscu — przejrzyste, podzielone na sekcje i zawsze aktualne.
      </PageHero>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <div className="legal-hub__grid">
            {LEGAL_DOCS.map((d) => (
              <Link key={d.id} to={d.route} className="legal-hub__card">
                <div className="legal-hub__ic"><Icon name={d.icon} size={24} /></div>
                <div className="legal-hub__txt">
                  <h2>{d.label}</h2>
                  <p>{d.desc}</p>
                </div>
                <span className="legal-hub__arrow"><Icon name="arrow-right" size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---- placeholder copy (focus is layout, not content) ---- */
const LOREM = 'Treść w przygotowaniu — poniższy zapis jest przykładowy i służy prezentacji układu strony. Postanowienia zostaną uzupełnione finalną treścią prawną przed publikacją.';
const LOREM2 = 'Korzystając z serwisu, użytkownik akceptuje warunki opisane w tym dokumencie. W kwestiach nieuregulowanych stosuje się powszechnie obowiązujące przepisy prawa polskiego.';

function ShopTermsPage() {
  return (
    <LegalDoc
      id="shopTerms"
      eyebrow="Dokument"
      title="Regulamin sklepu"
      updated="14 czerwca 2026"
      intro="Zasady składania zamówień, płatności, dostawy oraz zwrotów w sklepie Tatra Running. Dokument określa prawa i obowiązki kupującego oraz sprzedawcy."
      sections={[
        { id: 'rs-postanowienia', title: 'Postanowienia ogólne', blocks: [
          { type: 'p', text: LOREM },
          { type: 'p', text: LOREM2 },
        ] },
        { id: 'rs-zamowienia', title: 'Składanie zamówień', blocks: [
          { type: 'p', text: LOREM },
          { type: 'list', items: ['Wybór produktu lub bonu podarunkowego.', 'Dodanie pozycji do koszyka.', 'Uzupełnienie danych do realizacji.', 'Potwierdzenie i opłacenie zamówienia.'] },
        ] },
        { id: 'rs-platnosci', title: 'Płatności', blocks: [
          { type: 'sub', text: 'Dostępne metody' },
          { type: 'p', text: LOREM },
          { type: 'callout', icon: 'shield', text: 'Płatności obsługiwane są przez certyfikowanego operatora. Nie przechowujemy danych kart płatniczych.' },
        ] },
        { id: 'rs-dostawa', title: 'Dostawa i realizacja', blocks: [
          { type: 'p', text: LOREM },
          { type: 'list', items: ['Bony cyfrowe — natychmiast po zaksięgowaniu wpłaty.', 'Bony drukowane — w ciągu 3 dni roboczych.', 'Realizacja obozów — zgodnie z terminem wyjazdu.'] },
        ] },
        { id: 'rs-zwroty', title: 'Odstąpienie i zwroty', blocks: [
          { type: 'p', text: LOREM2 },
          { type: 'p', text: LOREM },
        ] },
        { id: 'rs-reklamacje', title: 'Reklamacje', blocks: [
          { type: 'p', text: LOREM },
        ] },
      ]}
    />
  );
}

function NewsletterRulesPage() {
  return (
    <LegalDoc
      id="newsletterRules"
      eyebrow="Dokument"
      title="Zasady wysyłki newslettera"
      updated="14 czerwca 2026"
      intro="W jaki sposób prowadzimy newsletter Tatra Running: jak się zapisać, co i jak często wysyłamy oraz jak w każdej chwili zrezygnować."
      sections={[
        { id: 'zn-zapis', title: 'Zapis i potwierdzenie', blocks: [
          { type: 'p', text: 'Newsletter działa w modelu podwójnej zgody (double opt-in). Po podaniu adresu e-mail wysyłamy wiadomość z linkiem potwierdzającym.' },
          { type: 'callout', icon: 'mail', text: 'Subskrypcja jest aktywna dopiero po kliknięciu linku potwierdzającego. Link jest ważny przez 24 godziny.' },
        ] },
        { id: 'zn-tresc', title: 'Co wysyłamy', blocks: [
          { type: 'list', items: ['Informacje o nowych obozach i terminach.', 'Ostatnie wolne miejsca i dogrywki.', 'Historie z gór, porady treningowe i inspiracje.'] },
        ] },
        { id: 'zn-czestotliwosc', title: 'Częstotliwość', blocks: [
          { type: 'p', text: 'Wiadomości wysyłamy kilka razy w sezonie — bez spamu. W szczycie zapisów częstotliwość może być nieco wyższa.' },
        ] },
        { id: 'zn-rezygnacja', title: 'Rezygnacja', blocks: [
          { type: 'p', text: 'Z newslettera można zrezygnować w dowolnym momencie, klikając link na końcu każdej wiadomości lub kontaktując się z nami.' },
          { type: 'p', text: LOREM2 },
        ] },
        { id: 'zn-dane', title: 'Dane subskrybenta', blocks: [
          { type: 'p', text: 'Do wysyłki newslettera przetwarzamy wyłącznie adres e-mail. Szczegóły opisuje Informacja o przetwarzaniu danych.' },
        ] },
      ]}
    />
  );
}

function PrivacyPage() {
  return (
    <LegalDoc
      id="privacy"
      eyebrow="Dokument"
      title="Informacja o przetwarzaniu danych"
      updated="14 czerwca 2026"
      intro="Kto jest administratorem Twoich danych, w jakim celu i na jakiej podstawie je przetwarzamy oraz jakie prawa Ci przysługują."
      sections={[
        { id: 'po-administrator', title: 'Administrator danych', blocks: [
          { type: 'p', text: 'Administratorem danych jest Tatra Running z siedzibą w Zakopanem. Kontakt: contact@tatrarunning.pl.' },
        ] },
        { id: 'po-cele', title: 'Cele i podstawy przetwarzania', blocks: [
          { type: 'list', items: ['Realizacja zamówień i umów (art. 6 ust. 1 lit. b RODO).', 'Wysyłka newslettera na podstawie zgody (art. 6 ust. 1 lit. a RODO).', 'Obowiązki prawne, np. rozliczenia (art. 6 ust. 1 lit. c RODO).'] },
        ] },
        { id: 'po-zakres', title: 'Zakres danych', blocks: [
          { type: 'p', text: LOREM },
        ] },
        { id: 'po-odbiorcy', title: 'Odbiorcy danych', blocks: [
          { type: 'p', text: 'Dane mogą być powierzane zaufanym dostawcom usług (hosting, płatności, wysyłka e-mail) wyłącznie w niezbędnym zakresie.' },
        ] },
        { id: 'po-okres', title: 'Okres przechowywania', blocks: [
          { type: 'p', text: LOREM2 },
        ] },
        { id: 'po-prawa', title: 'Twoje prawa', blocks: [
          { type: 'list', items: ['Dostęp do danych i ich kopii.', 'Sprostowanie i usunięcie danych.', 'Ograniczenie i sprzeciw wobec przetwarzania.', 'Wycofanie zgody w dowolnym momencie.', 'Skarga do Prezesa UODO.'] },
          { type: 'callout', icon: 'shield', text: 'Domyślnie nic nie śledzimy i nie ładujemy treści z zewnątrz bez Twojej zgody.' },
        ] },
      ]}
    />
  );
}

Object.assign(window, { LEGAL_DOCS, LegalDoc, LegalHubPage, ShopTermsPage, NewsletterRulesPage, PrivacyPage });
