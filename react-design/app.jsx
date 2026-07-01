/* ============================================================
   APP SHELL — route switch + mount
   ============================================================ */
function App() {
  const route = useRoute();
  let page;
  switch (route.name) {
    case 'home': page = <HomePage />; break;
    case 'camps': page = <CampsPage cat={route.params.cat} />; break;
    case 'camp': page = <CampDetail slug={route.params.slug} />; break;
    case 'team': page = <TeamPage />; break;
    case 'trainer': page = <TrainerDetail slug={route.params.slug} />; break;
    case 'partners': page = <PartnersPage />; break;
    case 'vouchers': page = <BonyPage />; break;
    case 'checkout': page = <CheckoutPage />; break;
    case 'contact': page = <ContactPage />; break;
    case 'newsletterThanks': page = <NewsletterThanksPage />; break;
    case 'shopTerms': page = <ShopTermsPage />; break;
    case 'newsletterRules': page = <NewsletterRulesPage />; break;
    case 'privacy': page = <PrivacyPage />; break;
    case 'legalHub': page = <LegalHubPage />; break;
    case 'blog': page = route.params.slug ? <BlogPost slug={route.params.slug} /> : <BlogPage />; break;
    default: page = <HomePage />;
  }
  return (
    <CartProvider>
      <Header route={route} />
      <ScrollKey k={route.name + (route.params.slug || '')}>{page}</ScrollKey>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}

/* remount wrapper so each route animates in + scrolls to top */
function ScrollKey({ k, children }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, [k]);
  return <div key={k} className="fade-in">{children}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
