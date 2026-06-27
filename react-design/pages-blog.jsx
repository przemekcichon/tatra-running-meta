/* ============================================================
   BLOG — archive (list) + single (post)
   ============================================================ */

const PL_MONTHS = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${PL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function PostMeta({ post, light }) {
  const a = getTrainer(post.author);
  return (
    <div className={`post-meta ${light ? 'post-meta--light' : ''}`}>
      {a && (a.photo
        ? <img className="post-meta__ava" src={a.photo} alt={a.name} />
        : <span className="post-meta__ava post-meta__ava--txt">{initials(a.name)}</span>)}
      <div className="post-meta__txt">
        {a && <span className="post-meta__name">{a.name}</span>}
        <span className="post-meta__sub">{fmtDate(post.date)} · {post.readMin} min czytania</span>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="post-card">
      <div className="post-card__media">
        <Img src={post.cover} imgPos={post.coverPos} ratio="3/2" label={`zdjęcie · ${post.cat}`} alt={post.title} />
        <span className="post-card__cat">{post.cat}</span>
      </div>
      <div className="post-card__body">
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <PostMeta post={post} />
      </div>
    </Link>
  );
}

function BlogPage() {
  const posts = window.POSTS || [];
  const cats = ['Wszystkie', ...Array.from(new Set(posts.map((p) => p.cat)))];
  const [cat, setCat] = useState('Wszystkie');

  const featured = posts.find((p) => p.feature) || posts[0];
  const rest = posts.filter((p) => p !== featured);
  const filtered = cat === 'Wszystkie' ? rest : rest.filter((p) => p.cat === cat);
  const showFeatured = cat === 'Wszystkie';

  return (
    <main>
      <PageHero eyebrow="Z gór" title="Blog"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Blog' }]}>
        Relacje z wypraw, porady treningowe i historie zebrane na szlakach. Wiedza, którą na co dzień przekazujemy uczestnikom naszych obozów.
      </PageHero>

      {/* featured */}
      {showFeatured && featured && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 'clamp(32px,4vw,56px)' }}>
          <div className="wrap wrap--wide">
            <Link to={`/blog/${featured.slug}`} className="blog-feat">
              <div className="blog-feat__media">
                <Img src={featured.cover} imgPos={featured.coverPos} label={`zdjęcie · ${featured.cat}`} alt={featured.title} style={{ height: '100%' }} />
                <span className="post-card__cat">{featured.cat}</span>
              </div>
              <div className="blog-feat__body">
                <div className="eyebrow eyebrow--mut">Polecane</div>
                <h2 className="blog-feat__title">{featured.title}</h2>
                <p className="blog-feat__excerpt">{featured.excerpt}</p>
                <PostMeta post={featured} />
                <span className="blog-feat__link">Czytaj artykuł <Icon name="arrow-right" size={18} /></span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* filters + grid */}
      <section className="section" style={{ paddingTop: showFeatured ? 0 : 8 }}>
        <div className="wrap wrap--wide">
          <div className="blog-cats">
            {cats.map((c) => (
              <button key={c} className={`cat-pill ${cat === c ? 'is-active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="blog-grid">
            {filtered.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function ArticleBlock({ block }) {
  switch (block.type) {
    case 'h2': return <h2>{block.text}</h2>;
    case 'quote': return <blockquote className="blog-quote">{block.text}</blockquote>;
    case 'list': return <ul className="blog-list">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
    default: return <p>{block.text}</p>;
  }
}

function BlogPost({ slug }) {
  const post = getPost(slug);
  if (!post) return <SimplePage title="Nie znaleziono wpisu" eyebrow="Ups" lead="Ten artykuł nie istnieje lub został przeniesiony." />;
  const author = getTrainer(post.author);
  const related = (window.POSTS || []).filter((p) => p.slug !== slug && p.cat === post.cat).slice(0, 3);
  const fallback = (window.POSTS || []).filter((p) => p.slug !== slug).slice(0, 3);
  const more = related.length ? related : fallback;

  return (
    <main className="blog-article">
      <section className="section" style={{ paddingBottom: 'clamp(24px,3vw,36px)' }}>
        <div className="wrap">
          <div className="breadcrumb" style={{ marginBottom: 26 }}>
            <Link to="/">Home</Link><Icon name="chevron-right" size={14} />
            <Link to="/blog">Blog</Link><Icon name="chevron-right" size={14} />
            <span>{post.cat}</span>
          </div>
          <div className="article-head">
            <span className="post-card__cat post-card__cat--static">{post.cat}</span>
            <h1>{post.title}</h1>
            <p className="article-lead">{post.excerpt}</p>
            <PostMeta post={post} />
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(36px,5vw,56px)' }}>
        <div className="wrap wrap--wide">
          <div className="article-cover">
            <Img src={post.cover} imgPos={post.coverPos} label={`zdjęcie · ${post.cat}`} alt={post.title} style={{ height: '100%' }} />
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'clamp(40px,6vw,72px)' }}>
        <div className="wrap">
          <article className="blog-prose">
            {post.body.map((b, i) => <ArticleBlock key={i} block={b} />)}
          </article>

          {author && (
            <div className="author-card">
              {author.photo
                ? <img className="author-card__ava" src={author.photo} alt={author.name} />
                : <span className="author-card__ava author-card__ava--txt">{initials(author.name)}</span>}
              <div>
                <div className="eyebrow eyebrow--mut">Autor</div>
                <h3>{author.name}</h3>
                <p className="author-card__role">{author.role}</p>
                <p className="author-card__bio">{author.short}</p>
                <Link to={`/trener/${author.slug}`} className="author-card__link">Poznaj {author.name.split(' ')[0]}a <Icon name="arrow-right" size={16} /></Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {more.length > 0 && (
        <section className="section band-dark" style={{ paddingBlock: 'clamp(44px,6vw,80px)' }}>
          <div className="wrap wrap--wide">
            <SectionHeading light eyebrow="Czytaj dalej" title="Z tej samej grani" />
            <div className="blog-grid blog-grid--dark" style={{ marginTop: 36 }}>
              {more.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

Object.assign(window, { BlogPage, BlogPost });
