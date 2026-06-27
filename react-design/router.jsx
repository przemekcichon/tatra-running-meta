/* ============================================================
   Tiny hash router: useRoute(), go(path), <Link>
   Routes:
     #/                       home
     #/obozy                  camp list
     #/oboz/:slug             camp detail
     #/zespol                 team hub
     #/trener/:slug           trainer detail
     #/partnerzy              partners
     #/bony                   vouchers e-commerce
     #/kasa                   checkout (also via cart drawer)
   ============================================================ */
const { useState: _useState, useEffect: _useEffect } = React;

function parseHash() {
  let h = window.location.hash.replace(/^#/, '');
  if (!h || h === '/') return { name: 'home', params: {} };
  const parts = h.split('/').filter(Boolean);
  const [a, b] = parts;
  switch (a) {
    case 'obozy': return { name: 'camps', params: { cat: b || '' } };
    case 'oboz': return { name: 'camp', params: { slug: b } };
    case 'zespol': return { name: 'team', params: {} };
    case 'trener': return { name: 'trainer', params: { slug: b } };
    case 'partnerzy': return { name: 'partners', params: {} };
    case 'bony': return { name: 'vouchers', params: {} };
    case 'kontakt': return { name: 'contact', params: {} };
    case 'blog': return { name: 'blog', params: { slug: b || '' } };
    case 'kasa': return { name: 'checkout', params: {} };
    case 'newsletter': return { name: 'newsletterThanks', params: {} };
    case 'regulamin': return { name: 'shopTerms', params: {} };
    case 'zasady-newslettera': return { name: 'newsletterRules', params: {} };
    case 'prywatnosc': return { name: 'privacy', params: {} };
    case 'dokumenty': return { name: 'legalHub', params: {} };
    default: return { name: 'home', params: {} };
  }
}

function go(path) {
  window.location.hash = path;
  // scroll handled by route effect
}

function useRoute() {
  const [route, setRoute] = _useState(parseHash());
  _useEffect(() => {
    const on = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

function Link({ to, className, style, children, onClick, ...rest }) {
  const handle = (e) => {
    if (onClick) onClick(e);
  };
  return (
    <a href={'#' + to} className={className} style={style} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

Object.assign(window, { useRoute, go, Link });
