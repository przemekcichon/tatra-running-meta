/* ============================================================
   UI primitives: icons, Img (with placeholder fallback),
   price format, cart context + hook.
   ============================================================ */
const { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } = React;

/* ---------- Icons (simple, standard UI glyphs) ---------- */
function Icon({ name, size = 20, stroke = 2, className, style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round',
    strokeLinejoin: 'round', className, style, 'aria-hidden': true };
  switch (name) {
    case 'menu':return <svg {...p}><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></svg>;
    case 'close':return <svg {...p}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></svg>;
    case 'arrow-right':return <svg {...p}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></svg>;
    case 'arrow-ur':return <svg {...p}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" /></svg>;
    case 'chevron-down':return <svg {...p}><polyline points="6 9 12 15 18 9" /></svg>;
    case 'chevron-right':return <svg {...p}><polyline points="9 6 15 12 9 18" /></svg>;
    case 'pin':return <svg {...p}><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case 'calendar':return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="3" x2="16" y2="6" /></svg>;
    case 'level':return <svg {...p}><polyline points="3 17 9 11 13 15 21 6" /><polyline points="15 6 21 6 21 12" /></svg>;
    case 'clock':return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>;
    case 'check':return <svg {...p}><polyline points="4 12 10 18 20 6" /></svg>;
    case 'bag':return <svg {...p}><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
    case 'gift':return <svg {...p}><rect x="3" y="9" width="18" height="12" rx="1.5" /><path d="M3 13h18M12 9v12" /><path d="M12 9S10 4 7.5 5.2C5.6 6.1 7 9 12 9Zm0 0s2-5 4.5-3.8C18.4 6.1 17 9 12 9Z" /></svg>;
    case 'shield':return <svg {...p}><path d="M12 3l7 3v5c0 5-3.4 8.3-7 10-3.6-1.7-7-5-7-10V6l7-3Z" /><polyline points="9 12 11 14 15 10" /></svg>;
    case 'phone':return <svg {...p}><path d="M5 4h3l2 5-2 1.5a12 12 0 0 0 5 5L18 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
    case 'mail':return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></svg>;
    case 'minus':return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'plus':return <svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'leaf':return <svg {...p}><path d="M5 19s-1-9 7-12c4-1.5 7-1 7-1s.5 3-1 7c-3 8-12 6-12 6Z" /><path d="M5 19c4-6 8-8 11-9" /></svg>;
    case 'users':return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7" /></svg>;
    case 'star':return <svg {...p} fill="currentColor" stroke="none"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z" /></svg>;
    case 'fb':return <svg {...p} fill="currentColor" stroke="none"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.8V14h2.7v8h3Z" /></svg>;
    case 'ig':return <svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>;
    case 'yt':return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="3.5" /><path d="M11 9.5l4 2.5-4 2.5Z" fill="currentColor" stroke="none" /></svg>;
    case 'mountain':return <svg {...p}><path d="M3 20h18L14 7l-3.2 5.5L9 9.5 3 20Z" /></svg>;
    case 'user':return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case 'sliders':return <svg {...p}><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /><circle cx="9" cy="8" r="2.4" fill="var(--paper)" /><circle cx="15" cy="16" r="2.4" fill="var(--paper)" /></svg>;
    case 'lock':return <svg {...p}><rect x="4.5" y="11" width="15" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case 'logout':return <svg {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><polyline points="9 8 4 12 9 16" /><line x1="4" y1="12" x2="15" y2="12" /></svg>;
    case 'spark':return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>;
    case 'whatsapp':return <svg {...p}><path d="M4 20l1.4-4A8 8 0 1 1 9 18.6L4 20Z" /><path d="M9 9.2c.2 2 1.8 3.6 3.8 3.8.5 0 .8-.4 1-.8.3-.5-.6-.8-1.1-1-.4-.2-.6.4-1 .3-.8-.3-1.5-1-1.8-1.8-.1-.4.5-.6.3-1-.2-.5-.5-1.4-1-1.1-.4.2-.8.5-.8 1Z" fill="currentColor" stroke="none" /></svg>;
    case 'play':return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5 3.5-5 3.5Z" fill="currentColor" stroke="none" /></svg>;
    case 'map':return <svg {...p}><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" /><line x1="9" y1="4" x2="9" y2="17" /><line x1="15" y1="6.5" x2="15" y2="19.5" /></svg>;
    case 'external':return <svg {...p}><path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></svg>;
    case 'dice':return <svg {...p}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" /><circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none" /></svg>;
    default:return null;
  }
}

/* ---------- Image with graceful placeholder ---------- */
function Img({ src, alt = '', label, className, style, ratio, imgPos }) {
  const [err, setErr] = useState(false);
  const wrapStyle = { position: 'relative', overflow: 'hidden', ...(ratio ? { aspectRatio: ratio } : {}), ...style };
  if (!src || err) {
    return (
      <div className={`ph ${className || ''}`} style={wrapStyle}>
        <span>{label || 'zdjęcie'}</span>
      </div>);

  }
  return (
    <div className={className} style={wrapStyle}>
      <img src={src} alt={alt} onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgPos || 'center', display: 'block' }} loading="lazy" />
    </div>);

}

/* ---------- helpers ---------- */
const zl = (n) => new Intl.NumberFormat('pl-PL').format(n) + ' zł';
const getCamp = (slug) => (window.CAMPS || []).find((c) => c.slug === slug);
const getTrainer = (slug) => (window.TRAINERS || []).find((t) => t.slug === slug);
const getPost = (slug) => (window.POSTS || []).find((p) => p.slug === slug);
const STATUS = {
  open: { label: 'Wolne miejsca', cls: 'badge--open' },
  few: { label: 'Ostatnie miejsca', cls: 'badge--few' },
  full: { label: 'Wyprzedane', cls: 'badge--full' }
};

/* ---------- Cart context ---------- */
const CartCtx = createContext(null);
const useCart = () => useContext(CartCtx);
const LS_KEY = 'tr_cart_v1';

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {return JSON.parse(localStorage.getItem(LS_KEY)) || [];} catch {return [];}
  });
  const [open, setOpen] = useState(false);
  useEffect(() => {try {localStorage.setItem(LS_KEY, JSON.stringify(items));} catch {}}, [items]);

  const add = useCallback((item) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.key === item.key);
      if (i >= 0) {const next = [...prev];next[i] = { ...next[i], qty: next[i].qty + (item.qty || 1) };return next;}
      return [...prev, { qty: 1, ...item }];
    });
    setOpen(true);
  }, []);
  const remove = useCallback((key) => setItems((p) => p.filter((x) => x.key !== key)), []);
  const setQty = useCallback((key, qty) => setItems((p) => p.map((x) => x.key === key ? { ...x, qty: Math.max(1, qty) } : x)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  const value = { items, add, remove, setQty, clear, count, total, open, setOpen };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

Object.assign(window, { Icon, Img, zl, getCamp, getTrainer, getPost, STATUS, CartProvider, useCart,
  useState, useEffect, useCallback, useMemo, useRef, useContext, createContext });