/* ============================================================
   BONY (voucher e-commerce), CART DRAWER, CHECKOUT
   ============================================================ */

/* ---------------- BONY CONFIGURATOR ---------------- */
function BonyPage() {
  const cart = useCart();
  const amounts = window.VOUCHER_AMOUNTS || [150, 300, 500, 1000];
  const templates = window.VOUCHER_TEMPLATES || [];
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState('');
  const [tpl, setTpl] = useState('warm');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [delivery, setDelivery] = useState('digital');

  const isCustom = amount === 'custom';
  const value = isCustom ? Math.max(0, parseInt(custom || '0', 10)) : amount;
  const valid = value >= 50;

  const addVoucher = (goCheckout) => {
    if (!valid) return;
    cart.add({
      key: `voucher-${tpl}-${value}-${delivery}-${recipient || 'x'}-${Date.now()}`,
      type: 'voucher',
      title: `Bon podarunkowy — ${zl(value)}`,
      sub: `${delivery === 'digital' ? 'Wersja cyfrowa (PDF)' : 'Wersja fizyczna (karta)'}${recipient ? ` · dla ${recipient}` : ''}`,
      price: value, qty: 1, voucherTheme: tpl,
    });
    if (goCheckout) go('/kasa');
  };

  return (
    <main>
      {/* hero */}
      <section className="cd-hero" style={{ height: 'clamp(300px,42vh,460px)' }}>
        <Img src="assets/team-2.webp" alt="Bony podarunkowe Tatra Running" />
        <div className="cd-hero__grad" style={{ background: 'linear-gradient(to top, rgba(15,14,11,.86), rgba(15,14,11,.2) 60%)' }} />
        <div className="cd-hero__badges">
          <div className="wrap wrap--wide">
            <div className="eyebrow" style={{ color: '#fff', opacity: .85 }}>Bony podarunkowe</div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(36px,6vw,68px)', marginTop: 10 }}>Podaruj górską przygodę</h1>
            <p style={{ color: 'rgba(255,255,255,.9)', maxWidth: '52ch', marginTop: 14, fontSize: 18 }}>
              Spraw prezent znajomym, bliskim, najbliższym — jeszcze niebiegającym albo już biegającym z nami.
            </p>
          </div>
        </div>
      </section>

      {/* configurator */}
      <section className="section">
        <div className="wrap wrap--wide">
          <div className="cfg-grid">
            <div>
              {/* amount */}
              <div className="cfg-step">
                <div className="cfg-step__label"><span className="cfg-step__num">1</span> Wybierz kwotę bonu</div>
                <div className="amt-grid">
                  {amounts.map((a) => (
                    <button key={a} className={`amt-btn ${amount === a ? 'sel' : ''}`} onClick={() => setAmount(a)}>
                      {new Intl.NumberFormat('pl-PL').format(a)} zł
                    </button>
                  ))}
                  <button className={`amt-btn ${isCustom ? 'sel' : ''}`} style={{ gridColumn: 'span 4' }} onClick={() => setAmount('custom')}>
                    Własna kwota <small>dowolna wartość od 50 zł</small>
                  </button>
                </div>
                {isCustom && (
                  <div className="cfg-custom">
                    <input className="cfg-input" type="number" min="50" step="50" placeholder="np. 750"
                      value={custom} onChange={(e) => setCustom(e.target.value)} style={{ marginTop: 10 }} />
                  </div>
                )}
              </div>

              {/* template */}
              <div className="cfg-step">
                <div className="cfg-step__label"><span className="cfg-step__num">2</span> Wybierz szablon</div>
                <div className="tpl-grid">
                  {templates.map((t) => (
                    <div key={t.id} className={`tpl-btn ${tpl === t.theme ? 'sel' : ''}`} onClick={() => setTpl(t.theme)}>
                      <div className="tpl-swatch" style={{ background: t.accent }} />
                      <b>{t.name}</b>
                    </div>
                  ))}
                </div>
              </div>

              {/* personalize */}
              <div className="cfg-step">
                <div className="cfg-step__label"><span className="cfg-step__num">3</span> Spersonalizuj dedykację</div>
                <div className="cfg-row2">
                  <div className="field">
                    <label>Dla kogo? (opcjonalnie)</label>
                    <input className="cfg-input" placeholder="np. Zosia" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 4 }}>
                  <label>Wiadomość na bonie (opcjonalnie)</label>
                  <textarea className="cfg-textarea" maxLength={120} placeholder="Biegnij po marzenia! Do zobaczenia w górach ❤" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
              </div>

              {/* delivery */}
              <div className="cfg-step">
                <div className="cfg-step__label"><span className="cfg-step__num">4</span> Forma bonu</div>
                <div className="seg">
                  <button className={delivery === 'digital' ? 'sel' : ''} onClick={() => setDelivery('digital')}>Cyfrowy (PDF)</button>
                  <button className={delivery === 'physical' ? 'sel' : ''} onClick={() => setDelivery('physical')}>Fizyczny (karta)</button>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 10 }}>
                  {delivery === 'digital'
                    ? 'Bon w formacie PDF wyślemy na e-mail od razu po zakupie — gotowy do wydruku lub przesłania dalej.'
                    : 'Elegancką kartę podarunkową wyślemy kurierem (1–2 dni robocze). Koszt wysyłki gratis.'}
                </p>
              </div>
            </div>

            {/* live preview */}
            <div className="cfg-preview">
              <div className="cfg-preview__card">
                <VoucherArt theme={tpl} amount={value || 0} recipient={recipient} custom={isCustom && !value} />
                {message && <p className="voucher-msg" style={{ fontFamily: 'var(--script)', fontSize: 20, color: 'var(--body)', marginTop: 14, textAlign: 'center' }}>„{message}"</p>}
                <div className="cfg-summary">
                  <span style={{ color: 'var(--muted)' }}>Wartość bonu</span>
                  <span className="total">{valid ? zl(value) : '—'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn--accent btn--block btn--lg" disabled={!valid} onClick={() => addVoucher(true)} style={!valid ? { opacity: .5, cursor: 'not-allowed' } : null}>
                    Kup teraz {valid ? `— ${zl(value)}` : ''}
                  </button>
                  <button className="btn btn--ghost btn--block" disabled={!valid} onClick={() => addVoucher(false)} style={!valid ? { opacity: .5, cursor: 'not-allowed' } : null}>
                    <Icon name="bag" size={18} /> Dodaj do koszyka
                  </button>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 14, textAlign: 'center' }}>Bon ważny 12 miesięcy · do wykorzystania na dowolny obóz lub trening</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* benefits */}
      <section className="section band-dark">
        <div className="wrap wrap--wide">
          <SectionHeading center light eyebrow="Dlaczego warto" title="Prezent, który zostaje na lata" />
          <div className="benefits" style={{ marginTop: 44 }}>
            {[
              { ic: 'gift', h: 'Dowolne przeznaczenie', p: 'Do wykorzystania na każdy obóz biegowy, skiturowy lub indywidualny trening.' },
              { ic: 'clock', h: 'Ważny 12 miesięcy', p: 'Obdarowany sam wybierze termin i kierunek wyprawy.' },
              { ic: 'mail', h: 'Cyfrowy od ręki', p: 'Wersję PDF wysyłamy na e-mail od razu po zakupie. Zdążysz na ostatnią chwilę.' },
              { ic: 'star', h: 'Personalizacja', p: 'Dodaj imię i dedykację — bon nabierze osobistego charakteru.' },
            ].map((b) => (
              <div className="benefit" key={b.h} style={{ background: 'var(--dark-2)', border: '1px solid var(--line-dark)' }}>
                <div className="benefit__ic"><Icon name={b.ic} size={22} /></div>
                <h3 style={{ color: '#fff' }}>{b.h}</h3>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- CART DRAWER ---------------- */
function CartDrawer() {
  const cart = useCart();
  if (!cart.open) return null;
  return (
    <React.Fragment>
      <div className="drawer-scrim" onClick={() => cart.setOpen(false)} />
      <aside className="drawer" role="dialog" aria-label="Koszyk">
        <div className="drawer__head">
          <h3>Koszyk {cart.count > 0 && `(${cart.count})`}</h3>
          <button className="drawer__close" onClick={() => cart.setOpen(false)} aria-label="Zamknij koszyk"><Icon name="close" size={20} /></button>
        </div>

        {cart.items.length === 0 ? (
          <div className="drawer__body">
            <div className="drawer__empty">
              <div className="ic"><Icon name="bag" size={28} /></div>
              <p style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Twój koszyk jest pusty</p>
              <p style={{ fontSize: 14 }}>Dodaj obóz lub bon podarunkowy, by kontynuować.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
                <Link to="/obozy" className="btn btn--ink btn--block" onClick={() => cart.setOpen(false)}>Przeglądaj obozy</Link>
                <Link to="/bony" className="btn btn--ghost btn--block" onClick={() => cart.setOpen(false)}><Icon name="gift" size={18} /> Kup bon</Link>
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="drawer__body">
              {cart.items.map((it) => (
                <div className="line-item" key={it.key}>
                  <div className="line-item__media">
                    {it.type === 'voucher'
                      ? <VoucherArt theme={it.voucherTheme} amount={it.price} style={{ aspectRatio: 'auto', height: '100%', borderRadius: 10 }} />
                      : <Img src={it.image} label="obóz" alt="" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</b>
                    {it.sub && <div className="sub">{it.sub}</div>}
                    <div className="line-item__bottom">
                      <div className="line-qty">
                        <button onClick={() => cart.setQty(it.key, it.qty - 1)} aria-label="Mniej"><Icon name="minus" size={15} /></button>
                        <span>{it.qty}</span>
                        <button onClick={() => cart.setQty(it.key, it.qty + 1)} aria-label="Więcej"><Icon name="plus" size={15} /></button>
                      </div>
                      <span className="line-price">{zl(it.price * it.qty)}</span>
                    </div>
                    <button className="line-remove" onClick={() => cart.remove(it.key)}>Usuń</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer__foot">
              <div className="drawer__total"><span style={{ color: 'var(--muted)' }}>Razem</span><span className="t">{zl(cart.total)}</span></div>
              <button className="btn btn--accent btn--block btn--lg" onClick={() => { cart.setOpen(false); go('/kasa'); }}>
                Przejdź do kasy <Icon name="arrow-right" size={18} />
              </button>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 12 }}>Bezpieczna płatność · BLIK · Przelewy24</p>
            </div>
          </React.Fragment>
        )}
      </aside>
    </React.Fragment>
  );
}

/* ---------------- CHECKOUT ---------------- */
function CheckoutPage() {
  const cart = useCart();
  const [pay, setPay] = useState('blik');
  const [placed, setPlaced] = useState(null);

  const PAY = [
    { id: 'blik', name: 'BLIK', badges: ['BLIK'] },
    { id: 'p24', name: 'Przelewy24', badges: ['P24', 'VISA', 'MC'] },
    { id: 'transfer', name: 'Przelew tradycyjny', badges: ['IBAN'] },
  ];

  const submit = (e) => {
    e.preventDefault();
    const order = 'TR-' + Math.floor(100000 + Math.random() * 899999);
    setPlaced({ order, total: cart.total, pay });
    cart.clear();
    window.scrollTo({ top: 0 });
  };

  if (placed) {
    return (
      <main>
        <div className="wrap">
          <div className="success">
            <div className="success__check"><Icon name="check" size={44} stroke={2.5} /></div>
            <div className="eyebrow" style={{ textAlign: 'center' }}>Dziękujemy!</div>
            <h1 style={{ marginTop: 12 }}>Zamówienie przyjęte</h1>
            <p className="lead" style={{ marginTop: 16 }}>
              Potwierdzenie wysłaliśmy na Twój e-mail. {placed.pay === 'transfer' ? 'Dane do przelewu znajdziesz w wiadomości.' : 'Płatność została zrealizowana.'}
            </p>
            <div className="order-box">
              <div className="summary-line"><span>Numer zamówienia</span><b style={{ color: 'var(--ink)' }}>{placed.order}</b></div>
              <div className="summary-line"><span>Kwota</span><b style={{ color: 'var(--ink)' }}>{zl(placed.total)}</b></div>
              <div className="summary-line"><span>Metoda płatności</span><b style={{ color: 'var(--ink)' }}>{PAY.find((p) => p.id === placed.pay).name}</b></div>
            </div>
            <Link to="/" className="btn btn--ink btn--lg">Wróć na stronę główną</Link>
          </div>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main>
        <div className="wrap">
          <div className="success">
            <div className="drawer__empty" style={{ padding: '60px 0' }}>
              <div className="ic" style={{ margin: '0 auto 18px' }}><Icon name="bag" size={28} /></div>
              <h1 style={{ fontSize: 32 }}>Koszyk jest pusty</h1>
              <p style={{ marginTop: 12 }}>Dodaj obóz lub bon, aby przejść do kasy.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <Link to="/obozy" className="btn btn--ink">Przeglądaj obozy</Link>
                <Link to="/bony" className="btn btn--ghost"><Icon name="gift" size={18} /> Kup bon</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero eyebrow="Kasa" title="Finalizacja zamówienia" crumbs={[{ label: 'Home', to: '/' }, { label: 'Koszyk' }, { label: 'Kasa' }]} />
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="wrap wrap--wide">
          <form className="co-grid" onSubmit={submit}>
            <div>
              <div className="co-card">
                <h3>Dane kontaktowe</h3>
                <p className="hint">Na ten adres wyślemy potwierdzenie i ewentualny bon w PDF.</p>
                <div className="cfg-row2">
                  <div className="field"><label>Imię</label><input className="cfg-input" required placeholder="Jan" /></div>
                  <div className="field"><label>Nazwisko</label><input className="cfg-input" required placeholder="Kowalski" /></div>
                </div>
                <div className="cfg-row2">
                  <div className="field"><label>E-mail</label><input className="cfg-input" type="email" required placeholder="jan@example.com" /></div>
                  <div className="field"><label>Telefon</label><input className="cfg-input" required placeholder="500 100 200" /></div>
                </div>
              </div>

              <div className="co-card">
                <h3>Metoda płatności</h3>
                <p className="hint">Płatność obsługiwana przez bezpieczną bramkę.</p>
                {PAY.map((p) => (
                  <label className={`pay-opt ${pay === p.id ? 'sel' : ''}`} key={p.id}>
                    <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                    <span className="pay-name">{p.name}</span>
                    <span className="pay-logo">{p.badges.map((b) => <span className="pay-badge" key={b}>{b}</span>)}</span>
                  </label>
                ))}
                {pay === 'transfer' && (
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', marginTop: 8, fontSize: 14 }}>
                    <div style={{ color: 'var(--muted)' }}>Numer konta:</div>
                    <b style={{ color: 'var(--ink)', letterSpacing: '.02em' }}>86 1050 1445 1000 0090 9778 4764</b>
                  </div>
                )}
              </div>
            </div>

            <aside className="co-aside">
              <div className="co-card" style={{ marginBottom: 0 }}>
                <h3 style={{ marginBottom: 16 }}>Twoje zamówienie</h3>
                {cart.items.map((it) => (
                  <div className="summary-line" key={it.key}>
                    <span style={{ maxWidth: '70%' }}>{it.qty}× {it.title}</span>
                    <b style={{ color: 'var(--ink)' }}>{zl(it.price * it.qty)}</b>
                  </div>
                ))}
                <div className="summary-line"><span>Dostawa</span><b style={{ color: 'var(--ink)' }}>0 zł</b></div>
                <div className="summary-total"><span>Razem</span><span>{zl(cart.total)}</span></div>
                <button type="submit" className="btn btn--accent btn--block btn--lg" style={{ marginTop: 18 }}>
                  <Icon name="shield" size={18} /> Zapłać {zl(cart.total)}
                </button>
                <div className="trust-row" style={{ justifyContent: 'center', marginTop: 14 }}>
                  <span><Icon name="shield" size={14} /> Bezpieczna płatność</span>
                  <span><Icon name="check" size={14} /> Faktura VAT</span>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { BonyPage, CartDrawer, CheckoutPage });
