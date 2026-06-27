/* ============================================================
   DATA — camps, trainers, vouchers, partners
   All Polish copy. Tien-Shan is the fully-detailed reference camp.
   Exported to window for the other babel scripts.
   ============================================================ */

const IMG = {
  homeHero: 'assets/home-hero.webp',
  teamHero: 'assets/team-hero.webp',
  team1: 'assets/team-1.webp',
  team2: 'assets/team-2.webp',
  teamEko: 'assets/team-eko.webp',
};

/* ---- Camp gallery: we reuse the real mountain/trail photos we have
   for cinematic imagery; camps without dedicated shots use a tasteful
   striped placeholder via the <Img> component (src null). ---- */

const CAMPS = [
  {
    slug: 'tien-shan-2026',
    title: 'Tien-Shan Run&Hike Adventure',
    year: '2026',
    price: 6999,
    deposit: 2000,
    location: 'Kirgistan',
    region: 'Azja Centralna',
    dates: '10.07 – 19.07.2026',
    days: 10,
    level: 'Adventure',
    type: 'Adventure',
    status: 'few',          // open | few | full
    spotsLeft: 3,
    featured: true,
    hero: 'assets/team-2.webp',
    lead: 'Biegowo-trekkingowa eskapada w góry Kirgistanu — połączenie zwiedzania i odkrywania przyrody niezwykłego kraju.',
    intro: [
      'Biegowo-trekkingowa eskapada w góry Kirgistanu to połączenie zwiedzania i odkrywania przyrody tego niezwykłego kraju. Będziemy jednak nie tylko w górach, ale też nad urokliwym jeziorem Issyk Kul, na szlaku prehistorycznych petroglifów, czy też gubiąc się w bajecznej dolinie nazywanej — nomen omen — Skazka (ros. bajka).',
      'Naszym przepisem na wyprawę jest trekking z przerwami na podróże i noclegi. Kilka razy zmieniamy lokalizację, eksplorujemy dany region i ruszamy dalej busem. Zaczynamy od Biszkeku — stolicy Kirgistanu. Na spacer po tym post-sowieckim mieście zabierze nas historyk, sowietolog dr Jakub Osiecki. Następnie ruszymy do Parku Narodowego Ala Archa, by wspiąć się na jeden z czterotysięczników, czyli na Uczitiela. Po nocy spędzonej w bazie Ratsek ruszymy w kierunku gór Tien-Szan pod samą granicę z Chinami. Tam czeka nas długa wycieczka doliną Altyn Arszan i piękne polodowcowe jezioro Ala Kul.',
    ],
    included: [
      '9 noclegów ze śniadaniem w hotelach *** lub pensjonatach',
      'Obiadokolacje w restauracjach, przydrożnych barach, górskich kempingach',
      'Opieka naszych trenerów oraz lokalnych kirgiskich przewodników',
      'Wytyczone przez TR wycieczki biegowe w terenie po unikalnych zakątkach Kirgistanu',
      'Treningi wspomagające: rozciąganie wielopłaszczyznowe, core stability, rozruchy siłowe',
      'Wykłady tematyczne dotyczące historii i kultury Kirgizów',
      'Indywidualne konsultacje treningowe',
      'Wieczory integracyjne',
      'Bilety wstępu do zwiedzanych wspólnie muzeów i atrakcji turystycznych',
      'Transfer busem po Kirgistanie',
      'Składki na Turystyczny Fundusz Gwarancyjny i TFP',
      'Ubezpieczenie NNW',
    ],
    excluded: [
      'Przelot do Biszkeku i z powrotem',
      'Ubezpieczenie od kosztów rezygnacji',
      'Wydatki własne i pamiątki',
      'Napiwki dla lokalnej obsługi',
    ],
    plan: [
      { day: 'Dzień 0', title: 'Przylot do Biszkeku', items: ['Spotkanie grupy na lotnisku', 'Transfer do hotelu', 'Kolacja powitalna i odprawa'] },
      { day: 'Dzień 1', title: 'Biszkek z historykiem', items: ['Śniadanie w hotelu', 'Spacer po stolicy z dr. Jakubem Osieckim', 'Lekki rozbieg aklimatyzacyjny', 'Przejazd w stronę Parku Ala Archa'] },
      { day: 'Dzień 2', title: 'Park Narodowy Ala Archa', items: ['Śniadanie w hotelu', 'Przejazd do Parku Ala Archa', 'Wycieczka doliną rzeki Adygene', 'Zakwaterowanie w pensjonacie (Gostinica) w Parku Narodowym Ala Archa', 'Kolacja'] },
      { day: 'Dzień 3–4', title: 'Wejście na Uczitiela (4000+)', items: ['Podejście do bazy Ratsek', 'Atak szczytowy na Uczitiela', 'Regeneracja i schodzenie'] },
      { day: 'Dzień 5', title: 'Dolina Altyn Arszan', items: ['Przejazd w kierunku Tien-Szanu', 'Długa wycieczka doliną Altyn Arszan', 'Nocleg w Yurt Camp Altyn Arszan'] },
      { day: 'Dzień 6', title: 'Jezioro Ala Kul', items: ['Bieg/trekking nad polodowcowe jezioro Ala Kul', 'Sesja zdjęciowa', 'Powrót do jurt'] },
      { day: 'Dzień 7–8', title: 'Issyk Kul i Skazka', items: ['Relaks nad jeziorem Issyk Kul', 'Szlak petroglifów', 'Dolina Skazka', 'Wieczór integracyjny'] },
    ],
    where: 'Naszą ideą podczas tego obozu będzie bieganie i trekking na lekko — z minimum rzeczy potrzebnych na trasie: napoje, batony energetyczne, zapasowa odzież. Reszta wyposażenia będzie w busach lub hotelach. Dzięki temu mamy szansę odkryć więcej Kirgizji i jej wyjątkowych skarbów.',
    sleep: 'Nocujemy w hotelach *** lub jurtach oraz w jednym schronisku wysokogórskim. Yurt Camp Altyn Arszan · Ala Archa Hotel · Smart Hotel.',
    prep: 'Żeby wziąć udział w obozie wystarczy być osobą regularnie biegającą (min. 3× w tygodniu) lub/i zdolną do pokonania dystansu 10 km jednostajnym, spokojnym tempem. Dziennie przemierzać będziemy między 8 a 22 kilometry w zróżnicowanym terenie, z podziałem na grupy — biegową i trekkingową.',
    coachSlugs: ['kuba-osiecki', 'kuba-wisniewski'],
  },
  {
    slug: 'armenia-2026', title: 'Armenia Run&Hike Adventure', year: '2026',
    price: 4999, deposit: 2000, location: 'Armenia', region: 'Kaukaz',
    dates: '05.09 – 12.09.2026', days: 8, level: 'Adventure', type: 'Adventure',
    status: 'open', spotsLeft: 9, hero: 'assets/team-eko.webp',
    lead: 'Klasztory wykute w skale, dzikie wąwozy i biegowe szlaki Kaukazu Południowego.',
    coachSlugs: ['kuba-osiecki', 'magda-derezinska'],
  },
  {
    slug: 'cappadocia-2026', title: 'Cappadocia Running Adventure', year: '2026',
    price: 5999, deposit: 2000, location: 'Turcja', region: 'Anatolia',
    dates: '11.10 – 18.10.2026', days: 8, level: 'Adventure', type: 'Adventure',
    status: 'open', spotsLeft: 11, hero: 'assets/home-hero.webp',
    lead: 'Bieganie wśród księżycowych formacji skalnych i balonów o świcie.',
    coachSlugs: ['kuba-osiecki', 'mariusz-gizynski'],
  },
  {
    slug: 'tatry-basic-camp-2026', title: 'Tatry Basic Camp', year: '2026',
    price: 1899, deposit: 750, location: 'Zakopane, Polska', region: 'Tatry',
    dates: '15.05 – 18.05.2026', days: 4, level: 'Początkujący', type: 'Bieg',
    status: 'few', spotsLeft: 4, hero: 'assets/team-1.webp',
    lead: 'Pierwszy obóz biegowy w górach — od podstaw, w kameralnej grupie.',
    coachSlugs: ['kuba-osiecki', 'kuba-wisniewski'],
  },
  {
    slug: 'tatry-trail-camp-2026', title: 'Tatry Trail Camp', year: '2026',
    price: 2399, deposit: 750, location: 'Zakopane, Polska', region: 'Tatry',
    dates: '12.06 – 16.06.2026', days: 5, level: 'Średniozaawansowany', type: 'Bieg',
    status: 'open', spotsLeft: 8, hero: 'assets/team-hero.webp',
    lead: 'Technika biegu w terenie i długie wybiegania granią Tatr Zachodnich.',
    coachSlugs: ['kuba-wisniewski', 'magda-derezinska'],
  },
  {
    slug: 'tatry-women-camp-2026', title: 'Tatry Women’s Camp', year: '2026',
    price: 2199, deposit: 750, location: 'Zakopane, Polska', region: 'Tatry',
    dates: '26.06 – 29.06.2026', days: 4, level: 'Dla kobiet', type: 'Bieg',
    status: 'open', spotsLeft: 10, hero: 'assets/team-2.webp',
    lead: 'Obóz biegowy stworzony przez kobiety, dla kobiet — w przyjaznej atmosferze.',
    coachSlugs: ['magda-derezinska', 'ania-figura'],
  },
  {
    slug: 'maroko-atlas-2026', title: 'Maroko — Atlas Wysoki', year: '2026',
    price: 4499, deposit: 2000, location: 'Maroko', region: 'Atlas',
    dates: '03.04 – 10.04.2026', days: 8, level: 'Zaawansowany', type: 'Adventure',
    status: 'full', spotsLeft: 0, hero: 'assets/team-eko.webp',
    lead: 'Bieg na dach Afryki Północnej — Jebel Toubkal (4167 m) i berberyjskie wioski.',
    coachSlugs: ['kuba-osiecki', 'mariusz-gizynski'],
  },
  {
    slug: 'pireneje-2026', title: 'Pireneje Trail Week', year: '2026',
    price: 3899, deposit: 2000, location: 'Hiszpania / Francja', region: 'Pireneje',
    dates: '04.07 – 11.07.2026', days: 8, level: 'Zaawansowany', type: 'Bieg',
    status: 'open', spotsLeft: 7, hero: 'assets/home-hero.webp',
    lead: 'Skaliste granie i alpejskie jeziora na granicy dwóch krajów.',
    coachSlugs: ['kuba-wisniewski', 'mariusz-gizynski'],
  },
  {
    slug: 'alpy-skitury-2026', title: 'Alpy — Tydzień Skiturowy', year: '2026',
    price: 4299, deposit: 2000, location: 'Austria', region: 'Alpy',
    dates: '07.02 – 14.02.2026', days: 8, level: 'Zaawansowany', type: 'Skitury',
    status: 'few', spotsLeft: 2, hero: 'assets/team-hero.webp',
    lead: 'Klasyczne podejścia i dziewicze zjazdy pod okiem mistrzów świata.',
    coachSlugs: ['ania-figura', 'magda-derezinska'],
  },
  {
    slug: 'tatry-skitury-2026', title: 'Tatry Skiturowe', year: '2026',
    price: 1699, deposit: 750, location: 'Zakopane, Polska', region: 'Tatry',
    dates: '23.01 – 26.01.2026', days: 4, level: 'Początkujący', type: 'Skitury',
    status: 'open', spotsLeft: 6, hero: 'assets/team-1.webp',
    lead: 'Wejście w świat skiturów: sprzęt, technika i bezpieczeństwo w Tatrach.',
    coachSlugs: ['ania-figura'],
  },
  {
    slug: 'rumunia-fagaras-2026', title: 'Rumunia — Góry Fogaraskie', year: '2026',
    price: 3299, deposit: 2000, location: 'Rumunia', region: 'Karpaty Południowe',
    dates: '22.08 – 29.08.2026', days: 8, level: 'Średniozaawansowany', type: 'Adventure',
    status: 'open', spotsLeft: 12, hero: 'assets/team-2.webp',
    lead: 'Dzika grań Fogaraszy, niedźwiedzie tereny i Transfogarska Szosa.',
    coachSlugs: ['kuba-osiecki', 'kuba-wisniewski'],
  },
];

const TRAINERS = [
  {
    slug: 'magda-derezinska', name: 'Magda Derezińska-Osiecka',
    role: 'Trasy · technika biegu · skitury', photo: 'assets/trener-magda.webp',
    tags: ['Skialpinizm', 'Biegi górskie', 'Przewodnik tatrzański'],
    short: 'V-ce Mistrzyni Świata i Mistrzyni Europy Środkowej w skialpinizmie. Tatry to jej dom.',
    bio: [
      'Jej żywioł to połączenie gór i dyscyplin wytrzymałościowych. W butach biegowych, na nartach czy w rakach pokonała w życiu ogromne przewyższenia, zostając v-ce Mistrzynią Świata, brązową medalistką Pucharu Świata, Mistrzynią Europy Środkowej, wielokrotną Mistrzynią Polski w skialpinizmie, Młodzieżową Mistrzynią Polski w biegach górskich.',
      'Stawała na wierzchołkach takich jak Pik Lenina (7134 m), Pico Orizaba (5700 m) i Mt. Aragac (4095 m). W 2012 zajęła 7. — najlepsze jak dotąd miejsce Polaków — w najtrudniejszych zawodach skialpinistycznych świata, Pierra Menta w Alpach. Tatry to jej dom, po którym oprowadza jako przewodnik tatrzański.',
      'W Tatra Running odpowiada za trasy, technikę biegu w terenie oraz prowadzenie szkoleń i wyjazdów skiturowych. Prywatnie żona Kuby i mama trójki dzieci.',
    ],
    medals: ['V-ce Mistrzyni Świata', 'Mistrzyni Europy Środkowej', 'Pik Lenina 7134 m'],
    phone: '505 104 062',
  },
  {
    slug: 'kuba-osiecki', name: 'Kuba Osiecki',
    role: 'Obozy Adventure · organizacja', photo: 'assets/trener-kuba-o.webp',
    tags: ['Instruktor PZLA', 'Historyk', 'Adventure'],
    short: 'Instruktor PZLA, doktor armenistyki, od 15 lat eksploruje Tatry i Kaukaz.',
    bio: [
      'Instruktor PZLA, w przeszłości zawodnik startujący na średnich i długich dystansach (Vactra Włocławek, KS Cracovia), od 15 lat eksploruje Tatry i Kaukaz.',
      'Z wykształcenia historyk, doktor armenistyki i pracownik Polskiej Akademii Umiejętności w Krakowie. Organizator obozów cyklu Tatra Running Adventure. Prywatnie mąż Magdaleny Derezińskiej.',
    ],
    medals: ['Instruktor PZLA', 'Dr armenistyki', '15 lat w górach'],
    phone: '500 152 300',
  },
  {
    slug: 'kuba-wisniewski', name: 'Kuba Wiśniewski',
    role: 'Wytrzymałość · szybkość · technika', photo: 'assets/trener-kuba-w.webp',
    tags: ['Medalista MP', 'Trener LA', 'Runner’s World'],
    short: 'Wielokrotny medalista Mistrzostw Polski Seniorów i trener lekkiej atletyki.',
    bio: [
      'Bieganie nie ma przed nim żadnych tajemnic. Jest wielokrotnym medalistą Mistrzostw Polski Seniorów oraz trenerem lekkiej atletyki. Po górach, na przełaj, po ulicy lub na bieżni — trenował już w różnych zakątkach świata. W parze z Przemkiem Sobczykiem ustanowił rekord Biegu Rzeźnika.',
      'Jest organizatorem największych w Polsce imprez biegowych, komentatorem i dziennikarzem sportowym — m.in. redaktorem miesięcznika Runner’s World oraz redaktorem naczelnym bieganie.pl. W przeszłości współtwórca programów biegowych Nike. W Tatra Running zajmuje się treningiem wytrzymałościowym, szybkościowym oraz techniką biegu.',
    ],
    medals: ['Medalista MP Seniorów', 'Rekord Biegu Rzeźnika', 'Red. nacz. bieganie.pl'],
    phone: '500 152 300',
  },
  {
    slug: 'mariusz-gizynski', name: 'Mariusz Giżyński',
    role: 'Indywidualne konsultacje trenerskie', photo: 'assets/trener-mariusz.webp',
    tags: ['13× medalista MP', 'Maratończyk', 'Ambasador Nike'],
    short: '13-krotny medalista Mistrzostw Polski i uczestnik Mistrzostw Europy w maratonie.',
    bio: [
      'Zawsze gotowy do biegu, o którym wie prawie wszystko. Człowiek o żelaznej kondycji i dużym doświadczeniu trenerskim oraz organizatorskim. Jest 13-krotnym medalistą Mistrzostw Polski i uczestnikiem Mistrzostw Europy w maratonie.',
      'Propagator zdrowego trybu życia i racjonalnego treningu… w ciągłym biegu. Współorganizator ogólnopolskiego programu Ścieżek Biegowych oraz Ambasador Nike. Podczas naszych obozów udziela indywidualnych konsultacji trenerskich.',
    ],
    medals: ['13× medalista MP', 'ME w maratonie', 'Ambasador Nike'],
    phone: '500 152 300',
  },
  {
    slug: 'ania-figura', name: 'Ania Figura',
    role: 'Obozy skiturowe · narciarstwo', photo: 'assets/trener-ania.webp',
    tags: ['Mistrzyni Świata', 'Przewodnik tatrzański', 'Autorka „Skitury”'],
    short: 'Mistrzyni Świata i Europy w narciarstwie wysokogórskim w sprincie.',
    bio: [
      'Przewodnik tatrzański, instruktorka narciarstwa. Mistrzyni Świata i Europy w narciarstwie wysokogórskim w sprincie, wielokrotna medalistka Pucharu Świata oraz Mistrzostw Polski. W naszym teamie odpowiada za obozy skiturowe.',
      'Autorka jedynego w Polsce, kompleksowego przewodnika skiturowego „Skitury”. Od dziecka związana z ukochanymi Tatrami. Biegaczka górska, zwyciężczyni Biegu Ultra Granią Tatr 2015 oraz ekstremalnego biegu Elbrus Race. Ustanowiła kobiecy rekord wejścia na Mont Blanc (4810 m) — 5 godz. 17 min.',
    ],
    medals: ['Mistrzyni Świata', 'Rekord na Mont Blanc 5:17', 'Autorka „Skitury”'],
    phone: '500 152 300',
  },
];

/* Voucher product templates (visual styles) */
const VOUCHER_TEMPLATES = [
  { id: 'summit',  name: 'Szczyt',   sub: 'Letnia grań', accent: '#F65824', theme: 'warm' },
  { id: 'winter',  name: 'Skitury',  sub: 'Zimowy stok', accent: '#2f6f9e', theme: 'cool' },
  { id: 'classic', name: 'Klasyk',   sub: 'Góralski wzór', accent: '#c2362b', theme: 'folk' },
];
const VOUCHER_AMOUNTS = [150, 300, 500, 1000];

const PARTNERS = {
  strategic: [
    { name: 'On Running', tag: 'Partner techniczny obuwia' },
    { name: 'Salomon', tag: 'Sprzęt trailowy' },
    { name: 'Tatrzański Park Narodowy', tag: 'Edukacja ekologiczna' },
  ],
  technical: [
    { name: "Runner's World" }, { name: 'bieganie.pl' }, { name: 'Suunto' },
    { name: 'Garmin' }, { name: 'Buff' }, { name: 'Dynafit' },
    { name: 'Polskie Radio' }, { name: 'PZLA' }, { name: 'TFG' },
    { name: 'Decathlon' }, { name: 'Maurten' }, { name: 'Naturalnie' },
  ],
};

/* ============================================================
   BLOG — editorial posts. Authors reference TRAINERS by slug.
   body: array of blocks { type: 'p'|'h2'|'quote'|'list', text?, items? }
   ============================================================ */
const POSTS = [
  {
    slug: 'pierwszy-sezon-w-gorach',
    title: 'Pierwszy sezon w górach: jak zacząć biegać po szlakach',
    cat: 'Trening',
    author: 'magda-derezinska',
    date: '2026-06-12', readMin: 7,
    cover: 'assets/team-hero.webp', coverPos: 'center 35%',
    feature: true,
    excerpt: 'Bieganie w terenie rządzi się własnymi prawami. Zanim ruszysz w góry, warto oswoić kilka rzeczy — od techniki podejść po dobór tempa.',
    body: [
      { type: 'p', text: 'Przejście z asfaltu na górski szlak bywa szokiem — nawet dla doświadczonych biegaczy. Zmienne podłoże, przewyższenia i wysokość sprawiają, że tempo z płaskiej trasy przestaje cokolwiek znaczyć. Zamiast kilometrów liczą się metry w pionie, a zamiast średniego pace’u — to, jak czujesz się na podejściu.' },
      { type: 'h2', text: 'Zwolnij na podejściach, idź gdy trzeba' },
      { type: 'p', text: 'Najczęstszy błąd początkujących to próba wbiegania na każde wzniesienie. W górach marsz to nie porażka — to technika. Sprawne, energiczne podejście marszowe z rękami opartymi na udach potrafi być szybsze i tańsze energetycznie niż trucht na granicy zadyszki.' },
      { type: 'quote', text: 'W terenie nie ścigasz się z zegarkiem. Ścigasz się z własną cierpliwością.' },
      { type: 'h2', text: 'Patrz trzy kroki przed siebie' },
      { type: 'p', text: 'Wzrok prowadzi nogi. Na technicznym zejściu nie patrz pod buty — skanuj szlak kilka kroków do przodu, a stopy same znajdą stabilne punkty. Krótszy, częstszy krok daje więcej kontroli niż długie, ostrożne stąpanie.' },
      { type: 'list', items: [
        'Zacznij od tras, które znasz — poznawaj teren stopniowo.',
        'Buty z agresywnym bieżnikiem to inwestycja w bezpieczeństwo.',
        'Zabierz warstwę przeciwwiatrową — pogoda w górach zmienia się w minuty.',
        'Woda i coś słodkiego na każde wyjście dłuższe niż godzina.',
      ] },
      { type: 'p', text: 'Reszta przyjdzie z kilometrami. Najważniejsze, żeby pierwsze wyjścia były przyjemnością, a nie walką — wtedy wrócisz po więcej.' },
    ],
  },
  {
    slug: 'skitury-od-zera',
    title: 'Skitury od zera: pierwszy sezon na fokach',
    cat: 'Skitury',
    author: 'ania-figura',
    date: '2026-02-04', readMin: 6,
    cover: 'assets/trener-ania.webp', coverPos: 'center 30%',
    excerpt: 'Cisza, dziewiczy śnieg i własny rytm oddechu. Skitury to najpiękniejszy sposób na zimowe góry — i wcale nie tak trudny, jak się wydaje.',
    body: [
      { type: 'p', text: 'Skitury łączą podejście na nartach z foką przyklejoną do ślizgu i zjazd poza przygotowanym stokiem. Brzmi poważnie, ale pierwsze kroki możesz postawić na łagodnym, znanym terenie — bez ekspozycji i bez tłumów.' },
      { type: 'h2', text: 'Sprzęt: lekko, ale z głową' },
      { type: 'p', text: 'Zestaw turowy jest lżejszy od zjazdowego, bo każdy gram odczujesz na podejściu. Wiązania z trybem marszu, buty z funkcją chodzenia i foki dopasowane do nart to absolutne minimum. Lawinowe ABC — detektor, sonda, łopata — to nie dodatek, tylko warunek wyjścia w teren.' },
      { type: 'quote', text: 'W górach zimą wiedza waży mniej niż łopata, a ratuje życie częściej.' },
      { type: 'h2', text: 'Rytm ważniejszy od tempa' },
      { type: 'p', text: 'Na podejściu szukasz oddechu, który utrzymasz godzinami. Krok krótki, równy, biodro pracuje, narta sunie po śniegu zamiast być podnoszona. Naucz się konwersji kierunku w zakosach — to ona decyduje, czy podejście jest płynne, czy męczące.' },
      { type: 'p', text: 'A potem jest nagroda: pierwszy ślad w nietkniętym śniegu, który zostawiasz tylko dla siebie.' },
    ],
  },
  {
    slug: 'tien-shan-dziennik',
    title: 'Tien-Shan: dziennik z wyprawy w serce Azji',
    cat: 'Adventure',
    author: 'kuba-osiecki',
    date: '2025-08-20', readMin: 9,
    cover: 'assets/team-1.webp', coverPos: 'center 45%',
    excerpt: 'Dziewięć dni biegu i trekkingu przez Kirgistan — od poradzieckiego Biszkeku po polodowcowe jezioro Ala Kul pod granicą z Chinami.',
    body: [
      { type: 'p', text: 'Kirgistan to kraj, który w 90% składa się z gór. Zaczynamy w Biszkeku — mieście pełnym sowieckich pomników i ulicznych bazarów — by już następnego dnia wjechać w Park Narodowy Ala Archa i poczuć pierwszy oddech wysokości.' },
      { type: 'h2', text: 'Dolina Altyn Arszan' },
      { type: 'p', text: 'Długie podejście doliną prowadzi do gorących źródeł i bazy, w której nocujemy w jurtach. Wieczorem niebo jest tak gęste od gwiazd, że trudno odróżnić horyzont od nieba. Rano ruszamy w stronę Ala Kul — jeziora, którego kolor zmienia się od turkusu po stalową szarość zależnie od chmur.' },
      { type: 'quote', text: 'Kirgizi są jednym z najbardziej uśmiechniętych narodów, jakie spotkałem — mimo że żyją skromnie.' },
      { type: 'h2', text: 'Lekko znaczy dalej' },
      { type: 'p', text: 'Filozofia tej wyprawy to bieg „na lekko” — na trasie tylko napoje, batony i warstwa zapasowa. Reszta jedzie busem. Dzięki temu pokonujemy dziennie od 8 do 22 kilometrów w terenie, który zmienia się z każdą doliną.' },
      { type: 'p', text: 'Wracamy zmęczeni i pełni — to rodzaj zmęczenia, za którym tęskni się potem przez cały rok.' },
    ],
  },
  {
    slug: 'baza-wytrzymalosciowa-zima',
    title: 'Budowanie bazy: dlaczego zima decyduje o letniej formie',
    cat: 'Trening',
    author: 'kuba-wisniewski',
    date: '2026-01-15', readMin: 5,
    cover: 'assets/team-2.webp', coverPos: 'center 50%',
    excerpt: 'Formę na letnie starty buduje się w styczniu. O tym, czym jest baza tlenowa i jak nie spalić jej zbyt szybkim tempem.',
    body: [
      { type: 'p', text: 'Sezon startowy wygrywa się zimą. To wtedy, w spokojnych, długich wybieganiach, buduje się baza tlenowa — fundament, na którym później dokłada się szybkość. Bez niej każdy plan szybko trafia na ścianę.' },
      { type: 'h2', text: 'Wolniej, niż myślisz' },
      { type: 'p', text: 'Większość biegaczy trenuje za szybko w dni „lekkie” i za wolno w dni „mocne”. Baza powstaje w pierwszej strefie — w tempie, w którym swobodnie prowadzisz rozmowę. To nudne. To działa.' },
      { type: 'quote', text: 'Cierpliwość zimą to prędkość latem.' },
      { type: 'h2', text: 'Objętość przed intensywnością' },
      { type: 'p', text: 'Najpierw zwiększaj liczbę godzin spędzonych w ruchu, a dopiero potem dokładaj akcenty. Skoki, podbiegi i tempówki mają sens, gdy organizm jest na nie gotowy — nie wcześniej.' },
    ],
  },
  {
    slug: 'ekologia-w-gorach',
    title: 'Biegać, nie szkodząc: ekologia tatrzańskiego szlaku',
    cat: 'Eko',
    author: 'magda-derezinska',
    date: '2025-09-30', readMin: 6,
    cover: 'assets/team-eko.webp', coverPos: 'center 50%',
    excerpt: 'Tatrzański Park Narodowy to nie tor treningowy, tylko żywy ekosystem. Kilka zasad, dzięki którym nasza obecność zostawia mniej śladu.',
    body: [
      { type: 'p', text: 'Trenując na terenie parku narodowego jesteśmy gośćmi w domu kozic, świstaków i niedźwiedzi. Świadomość tego, jak nasza obecność wpływa na florę i faunę, jest częścią naszej misji — i programu każdego obozu.' },
      { type: 'h2', text: 'Zostań na szlaku' },
      { type: 'p', text: 'Skracanie zakosów i wydeptywanie „skrótów” to najszybsza droga do erozji stoku. Roślinność wysokogórska odrasta latami. Jeden ślad obok ścieżki potrafi zostać na dekadę.' },
      { type: 'quote', text: 'Zabieramy ze sobą tylko zdjęcia. Zostawiamy tylko ślady butów — na szlaku.' },
      { type: 'h2', text: 'Cisza to też ochrona' },
      { type: 'p', text: 'Hałas płoszy zwierzęta i zmienia ich zachowania. W górach warto mówić ciszej, nie puszczać muzyki z głośnika i dać przyrodzie przestrzeń. W programie naszych obozów warsztaty ekologiczne prowadzą pracownicy naukowi TPN.' },
    ],
  },
  {
    slug: 'co-spakowac-na-adventure',
    title: 'Co spakować na obóz Adventure (i czego nie brać)',
    cat: 'Sprzęt',
    author: 'kuba-osiecki',
    date: '2026-03-18', readMin: 5,
    cover: null,
    excerpt: 'Lista, która powstała na bazie kilkunastu wypraw. Mniej znaczy więcej — zwłaszcza gdy plecak nosisz na własnych plecach.',
    body: [
      { type: 'p', text: 'Pakowanie na wyprawę adventure to ćwiczenie z pokory. Za pierwszym razem bierzesz za dużo, za drugim — wciąż za dużo. Po latach zostaje lista, która naprawdę działa.' },
      { type: 'h2', text: 'Warstwy, nie sztuki' },
      { type: 'p', text: 'Zamiast pięciu koszulek — system warstw: oddychająca baza, warstwa ocieplająca i wiatro-/wodoodporna skorupa. Tak ubierzesz się na upał w dolinie i na wiatr na przełęczy z tego samego plecaka.' },
      { type: 'list', items: [
        'Buty trailowe + lekkie buty na wieczór.',
        'Kurtka przeciwdeszczowa — zawsze, bez wyjątków.',
        'Czołówka i powerbank.',
        'Apteczka osobista i leki, które bierzesz na co dzień.',
        'Bidon składany — mniej waży, gdy pusty.',
      ] },
      { type: 'quote', text: 'Każdy gram, który zabierasz, niesiesz na własnych plecach przez całą wyprawę.' },
      { type: 'p', text: 'Resztę — namioty, wyżywienie, transport — bierzemy na siebie. Ty masz po prostu biec i patrzeć.' },
    ],
  },
];

Object.assign(window, { IMG, CAMPS, TRAINERS, VOUCHER_TEMPLATES, VOUCHER_AMOUNTS, PARTNERS, POSTS });
