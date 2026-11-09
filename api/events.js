const cheerio = require("cheerio");

const VENUES = [
  {
    name: "King Tut's Wah Wah Hut",
    area: "City Centre",
    url: "https://www.kingtuts.co.uk/",
    parse: parseKingTuts,
  },
  {
    name: "SWG3",
    area: "Finnieston",
    url: "https://swg3.tv/events",
    parse: parseSwg3,
  },
  {
    name: "Barrowland Ballroom",
    area: "Gallowgate",
    url: "https://ballroom.barrowland.co.uk/collections/gig-list",
    parse: parseBarrowland,
  },
  {
    name: "The Garage",
    area: "Sauchiehall Street",
    url: "https://garageglasgow.co.uk/gig-listings/",
    parse: parseGarage,
  },
  {
    name: "Sub Club",
    area: "City Centre",
    url: "https://subclub.co.uk/",
    parse: parseSubClub,
  },
  {
    name: "La Cheetah Club",
    area: "City Centre",
    url: "https://lacheetahclub.co.uk/",
    parse: parseLaCheetah,
  },
  {
    name: "Room 2 Club Listings",
    area: "City Centre",
    url: "https://room-2.co.uk/club-listings/",
    parse: (html) => parseRoom2(html, "Clubs"),
  },
  {
    name: "Room 2 Live Listings",
    area: "City Centre",
    url: "https://room-2.co.uk/live-listings/",
    parse: parseRoom2,
  },
  {
    name: "Òran Mór",
    area: "West End",
    url: "https://oran-mor.co.uk/whats-on/",
    parse: parseOranMor,
  },
  {
    name: "Creative Bloc Glasgow",
    area: "Maryhill",
    url: "https://www.eventbrite.co.uk/o/creative-bloc-92200878713",
    parse: parseCreativeBloc,
  },
  {
    name: "The Stand Comedy Club",
    area: "Woodlands",
    url: "https://www.thestand.co.uk/whats-on/glasgow",
    parse: parseTheStand,
  },
  {
    name: "Theatre Royal Glasgow",
    area: "Cowcaddens",
    url: "https://www.atgtickets.com/venues/theatre-royal-glasgow/whats-on/",
    parse: parseTheatreRoyal,
  },
];

const WORKSHOP_IMAGES = {
  pottery: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1120562863%2F2315308768883%2F1%2Foriginal.20250910-214111?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.0289575289575&fp-y=0.511787066442&s=a1fbdc7867880d014efe737bc23e5be8",
  improv: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1193151509%2F568772578929%2F1%2Foriginal.20260910-113854?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=2d30f397b5ee3135ba9584aaced3d12e",
  lifeDrawing: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1188027416%2F135022850827%2F1%2Foriginal.20260701-191425?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=e9096ec8197e899fa5305dab7ea9ad3f",
  maryhill: "https://static1.squarespace.com/static/4ff41e65e4b03ec22b1153c6/t/66ab96336f72ee2e76e41414/1722521143284/thumbnail.jfif?format=1500w",
  shawlands: "https://static1.squarespace.com/static/68d692d6afb51077feac0ae3/68e92cc911680316efe272d8/6ae0caa96c5caa1f9dafcedb/1793117074482/acuity+squares+2+.png?format=1500w",
  printClan: "https://static1.squarespace.com/static/5bb34e20c2ff6177cedc6853/t/5ff31284dac66e1e16217c9e/1609765513680/BQ6A1898.jpg?format=1500w",
  zineLibrary: "https://images.squarespace-cdn.com/content/v1/60db38ab0859315bfc5bb4f4/1792145255897-Z59ENI8D39WV05S34UE1/Updated+930+x+624.png",
  humanitix: "https://images.humanitix.com/i/c56271ae-db67-4403-9aa9-1f681bd7b18b.png@seo-500.jpg",
  stageToPage: "https://cdn.ticketsource.com/images/promoter/banner/66083-17927500997957-m.png",
  craftFlea: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1195934738%2F299770114170%2F1%2Foriginal.20261016-111040?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=0ab357b5783090ba89f23e8f2367da8c",
  teaGreen: "https://static.wixstatic.com/media/17bf0f_cf65f2c8586940198d2b882e7748d4d5~mv2.png/v1/fill/w_820,h_312,al_c/17bf0f_cf65f2c8586940198d2b882e7748d4d5~mv2.png",
  illustration: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F617023139%2F177341368256%2F1%2Foriginal.20231010-102839?w=2000&auto=format%2Ccompress&q=75&sharp=10&rect=7%2C0%2C812%2C812&s=b332fbafae0be31161144757fcb8552d",
};

const FEATURED_WORKSHOPS = [
  {
    id: "creative-bloc-pottery-2026-11-14",
    title: "Pottery Wheel Taster Sessions",
    venue: "Creative Bloc Glasgow",
    area: "Maryhill",
    category: "Workshops",
    dateISO: "2026-11-14",
    time: "12:30",
    description: "A beginner-friendly wheel-throwing class with a tutor; one pot is trimmed, glazed and fired for collection.",
    image: WORKSHOP_IMAGES.pottery,
    ticketUrl: "https://www.eventbrite.co.uk/e/pottery-wheel-taster-sessions-tickets-1999175066440",
    source: "Creative Bloc",
  },
  {
    id: "creative-bloc-pottery-2026-11-21",
    title: "Pottery Wheel Taster Sessions",
    venue: "Creative Bloc Glasgow",
    area: "Maryhill",
    category: "Workshops",
    dateISO: "2026-11-21",
    time: "12:30",
    description: "A beginner-friendly wheel-throwing class with a tutor; one pot is trimmed, glazed and fired for collection.",
    image: WORKSHOP_IMAGES.pottery,
    ticketUrl: "https://www.eventbrite.co.uk/e/pottery-wheel-taster-sessions-tickets-1999175066440",
    source: "Creative Bloc",
  },
  {
    id: "creative-bloc-pottery-2026-11-28",
    title: "Pottery Wheel Taster Sessions",
    venue: "Creative Bloc Glasgow",
    area: "Maryhill",
    category: "Workshops",
    dateISO: "2026-11-28",
    time: "12:30",
    description: "A beginner-friendly wheel-throwing class with a tutor; one pot is trimmed, glazed and fired for collection.",
    image: WORKSHOP_IMAGES.pottery,
    ticketUrl: "https://www.eventbrite.co.uk/e/pottery-wheel-taster-sessions-tickets-1999175066440",
    source: "Creative Bloc",
  },
  {
    id: "glasgow-improv-beginners-2026-11-16",
    title: "Beginners Drop-In Improv Comedy Workshop",
    venue: "The Old Hairdresser's",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-16",
    time: "18:30",
    description: "A welcoming taster session covering the basics of improvisation, with practice on stage.",
    image: WORKSHOP_IMAGES.improv,
    ticketUrl: "https://www.eventbrite.co.uk/e/beginners-drop-in-improv-comedy-workshop-nov-tickets-2000402098526",
    source: "Glasgow Improv Theatre",
  },
  {
    id: "atyn-life-drawing-2026-11-23",
    title: "All The Young Nudes · Life Drawing Club",
    venue: "House of Toad",
    area: "Park Circus",
    category: "Workshops",
    dateISO: "2026-11-23",
    time: "19:00",
    description: "An untutored Monday life-drawing session; bring materials or borrow a board and easel at the venue.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://atyn.co.uk/tickets",
    source: "All The Young Nudes",
  },
  {
    id: "maryhill-draw-together-2026-11-10",
    title: "Draw Together · Art Sessions",
    venue: "The Whitehouse",
    area: "Maryhill",
    category: "Workshops",
    dateISO: "2026-11-10",
    time: "12:30",
    description: "Relaxed community drawing sessions for all experience levels, with Doodle and Natter and a still-life session.",
    image: WORKSHOP_IMAGES.maryhill,
    ticketUrl: "https://www.maryhillburghhalls.org.uk/whats-on",
    source: "Maryhill Burgh Halls",
  },
  {
    id: "craft-pottery-corona-2026-11-22",
    title: "Studio Ghibli Pottery Painting",
    venue: "The Corona Bar",
    area: "Shawlands",
    category: "Workshops",
    dateISO: "2026-11-22",
    time: "15:30",
    description: "A Studio Ghibli-themed pottery-painting afternoon with pottery, materials and a drink included.",
    image: WORKSHOP_IMAGES.shawlands,
    ticketUrl: "https://www.thecraftpottery.com/coming-up/corona-bar-glasgow-4zemx-zn4er-ed8mr",
    source: "The Craft Pottery",
  },
  {
    id: "drawing-life-mcneills-2026-11-11",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-11-11",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "atyn-life-drawing-2026-11-16",
    title: "All The Young Nudes · Life Drawing Club",
    venue: "House of Toad",
    area: "Park Circus",
    category: "Workshops",
    dateISO: "2026-11-16",
    time: "19:00",
    description: "An untutored Monday life-drawing session; bring materials or borrow a board and easel at the venue.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://atyn.co.uk/tickets",
    source: "All The Young Nudes",
  },
  {
    id: "drawing-life-cass-art-2026-11-13",
    title: "Friday Lunchtime Life Drawing",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-13",
    time: "12:00",
    description: "A relaxed daytime life-drawing session from Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "print-clan-natural-dye-tote-2026-11-14",
    title: "Screen Printing with Natural Dyes · Sew Your Own Tote Bag",
    venue: "Print Clan",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-14",
    time: "10:00",
    description: "Explore plant-based dyes and sewing in this hands-on textile-printing workshop.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "anyone-can-draw-cass-art-2026-11-14",
    title: "Anyone Can Draw · Illustration Workshop",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-14",
    time: "14:00",
    description: "A welcoming drawing workshop led by illustrator Santiago Taberna; materials are included and ages 9+ are welcome.",
    image: WORKSHOP_IMAGES.illustration,
    ticketUrl: "https://www.eventbrite.co.uk/o/mobile-print-studio-10835388476",
    source: "Mobile Print Studio",
  },
  {
    id: "drawing-life-mcneills-2026-11-18",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-11-18",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "drawing-life-cass-art-2026-11-20",
    title: "Friday Lunchtime Life Drawing",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-20",
    time: "12:00",
    description: "A relaxed daytime life-drawing session from Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "print-clan-textile-november-2026-11-18",
    title: "Beginners Textile Printing Workshop",
    venue: "Print Clan",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-18",
    time: "18:00",
    description: "Try textile screen printing with paper stencils in this two-hour beginner session.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "zine-library-trans-writes-2026-11-10",
    title: "Trans Writes · Creative Writing Group",
    venue: "Glasgow Zine Library",
    area: "Govanhill",
    category: "Workshops",
    dateISO: "2026-11-10",
    time: "18:30",
    description: "A supportive creative-writing group for trans and non-binary writers at every experience level.",
    image: WORKSHOP_IMAGES.zineLibrary,
    ticketUrl: "https://www.glasgowzinelibrary.com/events",
    source: "Glasgow Zine Library",
  },
  {
    id: "zine-library-drop-in-zine-making-2026-11-18",
    title: "Drop-In Zine Making",
    venue: "Glasgow Zine Library",
    area: "Govanhill",
    category: "Workshops",
    dateISO: "2026-11-18",
    time: "16:00",
    description: "Make a zine alongside local artists and makers; all experience levels are welcome.",
    image: WORKSHOP_IMAGES.zineLibrary,
    ticketUrl: "https://www.glasgowzinelibrary.com/events",
    source: "Glasgow Zine Library",
  },
  {
    id: "under-the-rug-actors-directors-2026-11-18",
    title: "Brushin’ Up · Actors & Directors Skills Workshop",
    venue: "Under the Rug Hub",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-18",
    time: "18:00",
    description: "A low-pressure, hands-on theatre session pairing actors and directors to explore play excerpts and build skills.",
    image: WORKSHOP_IMAGES.humanitix,
    ticketUrl: "https://bit.ly/brushinup",
    source: "Under the Rug CIC",
  },
  {
    id: "drawing-life-mcneills-2026-11-25",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-11-25",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "zine-library-communal-typeface-2026-11-24",
    title: "From Hand to Font · Communal Typeface Workshop",
    venue: "Glasgow Zine Library",
    area: "Govanhill",
    category: "Workshops",
    dateISO: "2026-11-24",
    time: "18:30",
    description: "Turn hand-drawn letters into a working digital typeface with artist Jihae Choe.",
    image: WORKSHOP_IMAGES.zineLibrary,
    ticketUrl: "https://www.glasgowzinelibrary.com/events",
    source: "Glasgow Zine Library",
  },
  {
    id: "craft-and-flea-glasgow-2026-11-21",
    title: "Glasgow’s Christmas Craft & Flea Market",
    venue: "The Briggait",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-21",
    time: "11:00",
    description: "Browse handmade goods, independent makers and vintage finds at this city-centre craft fair. Open 11:00–16:00.",
    image: WORKSHOP_IMAGES.craftFlea,
    ticketUrl: "https://www.eventbrite.co.uk/e/glasgows-christmas-craft-flea-market-tickets-2003502506931",
    source: "Craft & Flea",
  },
  {
    id: "sketchbook-stories-burrell-2026-11-21",
    title: "Sketchbook Stories · Drawing Workshop",
    venue: "The Burrell Collection",
    area: "Pollok",
    category: "Workshops",
    dateISO: "2026-11-21",
    time: "11:00",
    description: "A full-day, hands-on drawing workshop exploring observation, tonal shading, mark-making and composition.",
    image: WORKSHOP_IMAGES.illustration,
    ticketUrl: "https://www.glasgowlife.org.uk/whats-on",
    source: "Glasgow Life",
  },
  {
    id: "drawing-life-cass-art-2026-11-27",
    title: "Friday Lunchtime Life Drawing",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-27",
    time: "12:00",
    description: "A relaxed daytime life-drawing session from Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "print-clan-festive-cards-2026-11-23",
    title: "Screen Print Your Own Festive Cards",
    venue: "Print Clan",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-23",
    time: "18:00",
    description: "Design and screen-print a set of one-of-a-kind cards in this festive workshop.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "print-clan-tote-november-2026-11-28",
    title: "Screen Print Your Own Tote Bag",
    venue: "Print Clan Studio",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-28",
    time: "11:00",
    description: "Design and screen-print a tote bag in this entry-level textile workshop.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "potfest-glasgow-2026-11-27",
    title: "Potfest in the City · Ceramics Fair",
    venue: "The Briggait",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-27",
    time: "10:00",
    description: "Meet more than 90 ceramic artists at this three-day fair, running 10:00–16:30 from 27–29 November.",
    ticketUrl: "https://www.potfest.co.uk/",
    source: "Potfest",
  },
  {
    id: "potfest-glasgow-2026-11-28",
    title: "Potfest in the City · Ceramics Fair",
    venue: "The Briggait",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-28",
    time: "10:00",
    description: "Meet more than 90 ceramic artists at this three-day fair, running 10:00–16:30 from 27–29 November.",
    ticketUrl: "https://www.potfest.co.uk/",
    source: "Potfest",
  },
  {
    id: "potfest-glasgow-2026-11-29",
    title: "Potfest in the City · Ceramics Fair",
    venue: "The Briggait",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-11-29",
    time: "10:00",
    description: "Meet more than 90 ceramic artists at this three-day fair, running 10:00–16:30 from 27–29 November.",
    ticketUrl: "https://www.potfest.co.uk/",
    source: "Potfest",
  },
  {
    id: "stage-to-page-november-2026-11-30",
    title: "Stage to Page · Theatre Workshop & Script-in-Hand Reading",
    venue: "Acting Coach Scotland at Govan Workspace",
    area: "Govan",
    category: "Workshops",
    dateISO: "2026-11-30",
    time: "19:00",
    description: "An open workshop with professional actors and a director, followed by a supportive new-writing reading.",
    image: WORKSHOP_IMAGES.stageToPage,
    ticketUrl: "https://www.ticketsource.com/stage-to-page/stage-to-page-november-2026/2026-11-30/19:00/t-qmyzygx",
    source: "Stage to Page",
  },
  {
    id: "atyn-life-drawing-2026-11-30",
    title: "All The Young Nudes · Life Drawing Club",
    venue: "House of Toad",
    area: "Park Circus",
    category: "Workshops",
    dateISO: "2026-11-30",
    time: "19:00",
    description: "An untutored Monday life-drawing session; bring materials or borrow a board and easel at the venue.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://atyn.co.uk/tickets",
    source: "All The Young Nudes",
  },
  {
    id: "under-the-rug-actors-directors-2026-12-02",
    title: "Brushin’ Up · Actors & Directors Skills Workshop",
    venue: "Under the Rug Hub",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-02",
    time: "18:00",
    description: "A low-pressure, hands-on theatre session pairing actors and directors to explore play excerpts and build skills.",
    image: WORKSHOP_IMAGES.humanitix,
    ticketUrl: "https://bit.ly/brushinup",
    source: "Under the Rug CIC",
  },
  {
    id: "zine-library-diy-animation-2026-12-01",
    title: "DIY Animation Club",
    venue: "Glasgow Zine Library",
    area: "Govanhill",
    category: "Workshops",
    dateISO: "2026-12-01",
    time: "18:30",
    description: "Experiment with moving images, sound and handmade animation in this beginner-friendly creative club.",
    image: WORKSHOP_IMAGES.zineLibrary,
    ticketUrl: "https://www.glasgowzinelibrary.com/events",
    source: "Glasgow Zine Library",
  },
  {
    id: "zine-library-fanfiction-workshop-2026-12-03",
    title: "Would You Still Love Me If I Was A Worm? · Fanfiction Workshop",
    venue: "Online",
    area: "Online",
    category: "Workshops",
    dateISO: "2026-12-03",
    time: "18:30",
    description: "An online creative-writing workshop about writing alternate-universe fanfiction while keeping characters recognisable.",
    image: WORKSHOP_IMAGES.zineLibrary,
    ticketUrl: "https://www.glasgowzinelibrary.com/events",
    source: "Glasgow Zine Library",
  },
  {
    id: "drawing-life-cass-art-2026-12-04",
    title: "Friday Lunchtime Life Drawing",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-04",
    time: "12:00",
    description: "A relaxed daytime life-drawing session from Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "tea-green-winter-market-2026-12-05",
    title: "Tea Green Winter Market",
    venue: "Kelvingrove Art Gallery and Museum",
    area: "Kelvingrove",
    category: "Workshops",
    dateISO: "2026-12-05",
    time: "10:00",
    description: "A free makers’ market featuring Scottish illustrators, ceramicists, textile artists and independent designers. Open 10:00–17:00.",
    image: WORKSHOP_IMAGES.teaGreen,
    ticketUrl: "https://teagreen.co.uk/",
    source: "Tea Green Events",
  },
  {
    id: "tea-green-winter-market-2026-12-06",
    title: "Tea Green Winter Market",
    venue: "Kelvingrove Art Gallery and Museum",
    area: "Kelvingrove",
    category: "Workshops",
    dateISO: "2026-12-06",
    time: "11:00",
    description: "A free makers’ market featuring Scottish illustrators, ceramicists, textile artists and independent designers. Open 11:00–17:00.",
    image: WORKSHOP_IMAGES.teaGreen,
    ticketUrl: "https://teagreen.co.uk/",
    source: "Tea Green Events",
  },
  {
    id: "drawing-life-mcneills-2026-12-09",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-12-09",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "print-clan-textile-december-2026-12-09",
    title: "Beginners Textile Printing Workshop",
    venue: "Print Clan",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-09",
    time: "18:00",
    description: "Try textile screen printing with paper stencils in this two-hour beginner session.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "drawing-life-yoga-and-sketch-2026-12-13",
    title: "Stretch & Sketch · Yoga and Life Drawing",
    venue: "Cass Art Central",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-13",
    time: "11:00",
    description: "A gentle yoga and life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "print-clan-tote-december-2026-12-12",
    title: "Screen Print Your Own Tote Bag",
    venue: "Print Clan Studio",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-12",
    time: "11:00",
    description: "Design and screen-print a tote bag in this entry-level textile workshop.",
    image: WORKSHOP_IMAGES.printClan,
    ticketUrl: "https://www.printclan.co.uk/workshops",
    source: "Print Clan",
  },
  {
    id: "drawing-life-mcneills-2026-12-16",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-12-16",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "under-the-rug-actors-directors-2026-12-16",
    title: "Brushin’ Up · Actors & Directors Skills Workshop",
    venue: "Under the Rug Hub",
    area: "City Centre",
    category: "Workshops",
    dateISO: "2026-12-16",
    time: "18:00",
    description: "A low-pressure, hands-on theatre session pairing actors and directors to explore play excerpts and build skills.",
    image: WORKSHOP_IMAGES.humanitix,
    ticketUrl: "https://bit.ly/brushinup",
    source: "Under the Rug CIC",
  },
  {
    id: "drawing-life-mcneills-2026-12-23",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-12-23",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
  {
    id: "drawing-life-mcneills-2026-12-30",
    title: "Wednesday Evening Life Drawing",
    venue: "McNeills Southside",
    area: "Southside",
    category: "Workshops",
    dateISO: "2026-12-30",
    time: "18:30",
    description: "An untutored midweek life-drawing session hosted by Drawing Life CIC.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://bookasession.org/drawing-life-glasgow",
    source: "Drawing Life CIC",
  },
];

const MONTHS = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function toDateISO(day, month, year) {
  const monthNumber = MONTHS[String(month).slice(0, 3).toLowerCase()];
  if (!monthNumber) return null;
  const fullYear = String(year).length === 2 ? `20${year}` : String(year);
  const dateISO = `${fullYear}-${monthNumber}-${String(day).padStart(2, "0")}`;
  return Number.isNaN(Date.parse(`${dateISO}T12:00:00Z`)) ? null : dateISO;
}

function classify(title, details = "", eventType = "") {
  const text = `${title} ${details} ${eventType}`.toLowerCase();
  if (/workshop|masterclass|life.?drawing|pottery|ceramic|art session|drawing club|illustration|animation|(?:art|craft)\s+fair|(?:winter|craft|makers?)\s+market|flea market/.test(text)) return "Workshops";
  if (/comedy|stand.?up|comedian|comic|laugh-in|red raw/.test(text)) return "Comedy";
  if (/theatre|theater|musical|pantomime|opera|ballet|\bplays?\b/.test(text)) return "Theatre";
  if (/class\b/.test(text)) return "Workshops";
  if (/\bclub\b|\bdj\b|rave|techno|house music|dance night|disco|nightlife|night.?club|reggaeton|drum\s*(?:and|&)\s*bass|\bdnb\b|uk garage|after.?party/.test(text)) return "Clubs";
  return "Live Music";
}

function isUpcoming(dateISO) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateISO}T12:00:00`) >= today;
}

function safeUrl(value, base) {
  if (!value) return "";
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function imageFrom($, card, base) {
  const image = $(card).find("img").first();
  const candidates = (image.attr("srcset") || "").split(",").map((candidate) => {
    const [url, width] = candidate.trim().split(/\s+/);
    return { url, width: Number.parseInt(width, 10) || 0 };
  }).filter((candidate) => candidate.url);
  const balancedSource = candidates.sort((a, b) => Math.abs(a.width - 800) - Math.abs(b.width - 800))[0]?.url;
  const source = balancedSource || image.attr("src") || image.attr("data-src");
  return safeUrl(source, base);
}

function parseKingTuts(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $("a[href*='/all-events/']").each((_, element) => {
    const link = $(element);
    const text = link.text().replace(/\s+/g, " ").trim();
    const dateMatch = text.match(/(\d{1,2})\s+([A-Za-z]{3})\s+['’]?(\d{2,4})\b/);
    if (!dateMatch) return;

    const dateISO = toDateISO(dateMatch[1], dateMatch[2], dateMatch[3]);
    const title = text.replace(dateMatch[0], "").replace(/\bNew\b/gi, "").trim();
    const eventUrl = safeUrl(link.attr("href"), "https://www.kingtuts.co.uk/");
    if (!dateISO || !title || !eventUrl || seen.has(eventUrl) || !isUpcoming(dateISO)) return;
    seen.add(eventUrl);

    const image = imageFrom($, link, "https://www.kingtuts.co.uk/");
    events.push({
      id: `kingtuts-${eventUrl.split("/").filter(Boolean).pop()}`,
      title,
      venue: "King Tut's Wah Wah Hut",
      area: "City Centre",
      category: classify(title),
      dateISO,
      time: "",
      description: "",
      image,
      ticketUrl: eventUrl,
      source: "King Tut's",
    });
  });

  return events;
}

function parseSwg3(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $("article.card--event").each((_, element) => {
    const card = $(element);
    const title = card.find(".info h4").first().text().replace(/\s+/g, " ").trim();
    const day = card.find(".date h5").first().text().trim();
    const monthYear = card.find(".date .month-year .mt").first().text().trim();
    const monthMatch = monthYear.match(/([A-Za-z]{3})\s+['’]?(\d{2,4})/);
    if (!title || !day || !monthMatch) return;

    const dateISO = toDateISO(day, monthMatch[1], monthMatch[2]);
    if (!dateISO || !isUpcoming(dateISO)) return;

    const detailHref = card.find(".info h4").first().closest("a").attr("href") || card.find(".card__header a").first().attr("href");
    const ticketHref = card.find(".info__ctas a").filter((__, link) => /tickets/i.test($(link).text())).first().attr("href");
    const time = card.find(".info__location .time").first().text().trim();
    const venue = card.find(".info__location .space").first().text().trim() || "SWG3";
    const eventUrl = safeUrl(detailHref, "https://swg3.tv/");
    const key = `${dateISO}|${title.toLowerCase()}|${venue.toLowerCase()}`;
    if (!eventUrl || seen.has(key)) return;
    seen.add(key);

    events.push({
      id: `swg3-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue,
      area: "Finnieston",
      category: /^(?:FLY\b|Sasha\b|SCDD\b|Strictly Bangerz\b|Hardbeat Department\b|WAXXXMAS\b)/i.test(title) ? "Clubs" : classify(title),
      dateISO,
      time,
      description: "",
      image: imageFrom($, card, "https://swg3.tv/"),
      ticketUrl: safeUrl(ticketHref, "https://swg3.tv/") || eventUrl,
      source: "SWG3",
    });
  });

  return events;
}

function parseSubClub(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();
  const venueUrl = "https://subclub.co.uk/";

  $(".event-grid.full .event-item-link").each((_, element) => {
    const link = $(element);
    const text = link.text().replace(/\s+/g, " ").trim();
    const dateISO = dateFromText(text);
    const title = text.replace(/^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+)?\d{1,2}\s+[A-Za-z]{3,9}(?:,?\s+\d{4})?\s*/i, "").trim();
    const eventUrl = safeUrl(link.attr("href"), venueUrl);
    const key = eventUrl || `${dateISO}|${title.toLowerCase()}`;
    if (!title || !dateISO || !isUpcoming(dateISO) || !eventUrl || seen.has(key)) return;
    seen.add(key);

    events.push({
      id: `subclub-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue: "Sub Club",
      area: "City Centre",
      category: "Clubs",
      dateISO,
      time: text.match(/\b(\d{1,2}:\d{2})\b/)?.[1] || "",
      description: "",
      image: imageFrom($, link, venueUrl),
      ticketUrl: eventUrl,
      source: "Sub Club",
    });
  });

  return events;
}

function parseLaCheetah(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();
  const venueUrl = "https://lacheetahclub.co.uk/";

  $(".dem_grid_style2_container").each((_, element) => {
    const card = $(element);
    const title = card.find(".dem_grid_title").first().text().replace(/\s+/g, " ").trim();
    const details = card.find(".dem_grid_style2_event_date_time_venue").first().text().replace(/\s+/g, " ").trim();
    const dateISO = dateFromText(details);
    const href = card.find(".dem_grid_title a").first().attr("href") || card.find("a[href*='ra.co/events/']").first().attr("href");
    const eventUrl = safeUrl(href, venueUrl);
    if (!title || !dateISO || !isUpcoming(dateISO) || !eventUrl || seen.has(eventUrl)) return;
    seen.add(eventUrl);

    events.push({
      id: `lacheetah-${eventUrl.split("/").filter(Boolean).pop()}`,
      title,
      venue: "La Cheetah Club",
      area: "City Centre",
      category: "Clubs",
      dateISO,
      time: details.match(/\bat\s+(\d{1,2}:\d{2})\b/i)?.[1] || "",
      description: card.find(".dem_grid_style2_event_text").first().text().replace(/\s+/g, " ").trim(),
      image: imageFrom($, card, venueUrl),
      ticketUrl: eventUrl,
      source: "La Cheetah Club",
    });
  });

  return events;
}

function parseRoom2(html, forcedCategory = "") {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();
  const venueUrl = "https://room-2.co.uk/";

  $(".columns.events").each((_, element) => {
    const card = $(element);
    const heading = card.find(".text-block h4").first();
    const title = heading.clone().children("p").remove().end().text().replace(/\s+/g, " ").trim();
    const cardText = card.text().replace(/\s+/g, " ").trim();
    const dateText = cardText.replace(/\b(\d{1,2})(?:st|nd|rd|th)\b/gi, "$1");
    const dateISO = dateFromText(dateText);
    const href = card.find("a[href*='/events/']").first().attr("href");
    const eventUrl = safeUrl(href, venueUrl);
    if (!title || !dateISO || !isUpcoming(dateISO) || !eventUrl || seen.has(eventUrl)) return;
    seen.add(eventUrl);

    events.push({
      id: `room2-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue: "Room 2",
      area: "City Centre",
      category: forcedCategory || classify(title, cardText),
      dateISO,
      time: cardText.match(/\b(\d{1,2}:\d{2})\b/)?.[1] || "",
      description: "",
      image: imageFrom($, card, venueUrl),
      ticketUrl: eventUrl,
      source: "Room 2",
    });
  });

  return events;
}

function parseCreativeBloc(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();
  const venueUrl = "https://www.eventbrite.co.uk/";

  $("section.discover-vertical-event-card").each((_, element) => {
    const card = $(element);
    const eventLink = card.find("a[href*='/e/']").filter((__, link) => $(link).text().trim()).first();
    const title = eventLink.text().replace(/\s+/g, " ").trim();
    const cardText = card.text().replace(/\s+/g, " ").trim();
    const dateISO = dateFromText(cardText);
    const eventUrl = safeUrl(eventLink.attr("href"), venueUrl);
    if (!title || !dateISO || !isUpcoming(dateISO) || !eventUrl || seen.has(eventUrl)) return;
    seen.add(eventUrl);

    events.push({
      id: `creative-bloc-${eventUrl.match(/tickets-(\d+)/)?.[1] || `${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}`,
      title,
      venue: "Creative Bloc Glasgow",
      area: "Maryhill",
      category: "Workshops",
      dateISO,
      time: cardText.match(/\b(\d{1,2}:\d{2})(?!\d)/)?.[1] || "",
      description: "",
      image: imageFrom($, card, venueUrl),
      ticketUrl: eventUrl,
      source: "Creative Bloc",
    });
  });

  return events;
}

function parseOranMor(html) {
  const $ = cheerio.load(html);
  const structuredEvents = [];
  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;

    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    if (types.some((type) => /event/i.test(String(type || "")))) structuredEvents.push(value);
    Object.values(value).forEach(visit);
  };

  $("script[type='application/ld+json']").each((_, element) => {
    try {
      visit(JSON.parse($(element).html()));
    } catch {
      return;
    }
  });

  const events = [];
  const seen = new Set();
  const venueUrl = "https://oran-mor.co.uk/";
  structuredEvents.forEach((item) => {
    const title = cheerio.load(`<div>${String(item.name || "")}</div>`).text().replace(/\s+/g, " ").trim();
    const startDate = String(item.startDate || "");
    const dateISO = startDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";
    const eventUrl = safeUrl(item.url, venueUrl);
    const key = eventUrl || `${dateISO}|${title.toLowerCase()}`;
    if (!title || !dateISO || !isUpcoming(dateISO) || !eventUrl || seen.has(key)) return;
    seen.add(key);

    const description = cheerio.load(`<div>${String(item.description || "")}</div>`).text().replace(/\s+/g, " ").trim();
    const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
    const image = Array.isArray(item.image) ? item.image[0] : item.image;
    const imageUrl = typeof image === "string" ? image : image?.url;

    events.push({
      id: `oranmor-${eventUrl.split("/").filter(Boolean).pop()}`,
      title,
      venue: "Òran Mór",
      area: "West End",
      category: classify(title, description),
      dateISO,
      time: startDate.match(/T(\d{2}:\d{2})/)?.[1] || "",
      description,
      image: safeUrl(imageUrl, venueUrl),
      ticketUrl: safeUrl(offer?.url, venueUrl) || eventUrl,
      source: "Òran Mór",
    });
  });

  return events;
}

function dateFromText(value) {
  const matches = [...value.matchAll(/\b(\d{1,2})\s+([A-Za-z]{3,9})(?:,?\s+(\d{4}))?/g)];
  if (!matches.length) return null;

  const start = matches[0];
  const endWithYear = matches.find((match) => match[3]);
  const year = Number(start[3] || endWithYear?.[3] || new Date().getFullYear());
  const startMonth = Number(MONTHS[String(start[2]).slice(0, 3).toLowerCase()]);
  const endMonth = endWithYear && Number(MONTHS[String(endWithYear[2]).slice(0, 3).toLowerCase()]);
  const startYear = !start[3] && endMonth && startMonth > endMonth ? year - 1 : year;
  return toDateISO(start[1], start[2], startYear);
}

function parseBarrowland(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $(".card-wrapper").each((_, element) => {
    const card = $(element);
    const title = card.find(".card__heading").first().text().replace(/\s+/g, " ").trim();
    const text = card.text().replace(/\s+/g, " ").trim();
    const dateISO = dateFromText(text);
    const key = `${dateISO}|${title.toLowerCase()}`;
    if (!title || !dateISO || !isUpcoming(dateISO) || seen.has(key)) return;
    seen.add(key);

    const ticketHref = card.find("a.hc-ticket-redirect").first().attr("href");
    const doorTime = text.match(/DOORS:?\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    const hour = doorTime ? Number(doorTime[1]) % 12 + (doorTime[3].toUpperCase() === "PM" ? 12 : 0) : null;
    const time = doorTime ? `${String(hour).padStart(2, "0")}:${doorTime[2] || "00"}` : "";
    const venueUrl = "https://ballroom.barrowland.co.uk/collections/gig-list";

    events.push({
      id: `barrowland-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue: "Barrowland Ballroom",
      area: "Gallowgate",
      category: classify(title, text),
      dateISO,
      time,
      description: "",
      image: imageFrom($, card, venueUrl),
      ticketUrl: safeUrl(ticketHref, venueUrl) || venueUrl,
      source: "Barrowland Ballroom",
    });
  });

  return events;
}

function parseGarage(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $("article.garage-gig-grid-v2-card").each((_, element) => {
    const card = $(element);
    const title = card.find("h3").first().text().replace(/\s+/g, " ").trim();
    const detailLink = card.find("h3 a").first().attr("href") || card.find("a").first().attr("href");
    const dateISO = card.find("time[datetime]").first().attr("datetime")?.slice(0, 10);
    const description = card.find(".garage-gig-grid-v2-description").first().text().replace(/\s+/g, " ").trim();
    const eventType = card.find(".garage-gig-grid-v2-meta span").first().text().trim();
    const key = `${dateISO}|${title.toLowerCase()}`;
    if (!title || !dateISO || !isUpcoming(dateISO) || !detailLink || seen.has(key)) return;
    seen.add(key);

    const ticketHref = card.find("a").filter((__, link) => /tickets/i.test($(link).text())).first().attr("href");
    const timeMatch = card.text().match(/\b(\d{1,2}:?\d{0,2}\s*(?:AM|PM))\b/i);
    const venue = card.find(".garage-gig-grid-v2-room").first().text().replace(/\s+/g, " ").trim() || "The Garage";
    const venueUrl = "https://garageglasgow.co.uk/";

    events.push({
      id: `garage-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue,
      area: "Sauchiehall Street",
      category: classify(title, description, eventType),
      dateISO,
      time: timeMatch?.[1]?.replace(/\s+/g, " ").trim() || "",
      description,
      image: imageFrom($, card, venueUrl),
      ticketUrl: safeUrl(ticketHref, venueUrl) || safeUrl(detailLink, venueUrl),
      source: "The Garage",
    });
  });

  return events;
}

function parseTheStand(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $("article.new-start-show-card").each((_, element) => {
    const card = $(element);
    const link = card.find("a[href^='/performance/']").first();
    const href = link.attr("href");
    const dateMatch = href?.match(/\/(\d{4})(\d{2})(\d{2})\/glasgow(?:\/|$)/);
    const dateISO = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null;
    const title = card.find("h3").first().text().replace(/\s+/g, " ").trim();
    const key = href || `${dateISO}|${title}`;
    if (!title || !dateISO || !isUpcoming(dateISO) || seen.has(key)) return;
    seen.add(key);

    const text = card.text().replace(/\s+/g, " ").trim();
    const time = text.match(/Starts:?\s*(\d{1,2}:\d{2})/i)?.[1] || "";
    const venueUrl = "https://www.thestand.co.uk/whats-on/glasgow";

    events.push({
      id: `stand-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue: "The Stand Comedy Club",
      area: "Woodlands",
      category: "Comedy",
      dateISO,
      time,
      description: "",
      image: imageFrom($, card, venueUrl),
      ticketUrl: safeUrl(href, "https://www.thestand.co.uk/"),
      source: "The Stand",
    });
  });

  return events;
}

function parseTheatreRoyal(html) {
  const $ = cheerio.load(html);
  const events = [];
  const seen = new Set();

  $("div.MuiCard-root").each((_, element) => {
    const card = $(element);
    const eventLink = card.find("a[href*='/shows/']").filter((__, link) => !($(link).attr("href") || "").includes("/calendar/")).first();
    const href = eventLink.attr("href");
    if (!href) return;

    const title = card.find("h2, h3, h4").first().text().replace(/\s+/g, " ").trim() || eventLink.text().replace(/More information about|More info/gi, "").trim();
    const text = card.text().replace(/\s+/g, " ").trim();
    const dateISO = dateFromText(text);
    const key = href;
    if (!title || !dateISO || !isUpcoming(dateISO) || seen.has(key)) return;
    seen.add(key);

    const ticketHref = card.find("a[href*='/calendar/']").first().attr("href");
    const type = card.find(".MuiCardContent-root").text();
    const venueUrl = "https://www.atgtickets.com/venues/theatre-royal-glasgow/whats-on/";

    events.push({
      id: `theatre-royal-${dateISO}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      venue: "Theatre Royal Glasgow",
      area: "Cowcaddens",
      category: classify(title, type),
      dateISO,
      time: "",
      description: "",
      image: imageFrom($, card, venueUrl),
      ticketUrl: safeUrl(ticketHref, "https://www.atgtickets.com/") || safeUrl(href, "https://www.atgtickets.com/"),
      source: "Theatre Royal Glasgow",
    });
  });

  return events;
}

async function fetchVenue(venue) {
  const response = await fetch(venue.url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "GlasgowCoolEvents/1.0 (+https://www.glasgow.cool)",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Venue returned ${response.status}`);

  const html = await response.text();
  if (html.length > 5_000_000) throw new Error("Venue page exceeded the size limit");
  return venue.parse(html).map((event) => ({ ...event, area: event.area || venue.area }));
}

module.exports = async function handler(_request, response) {
  response.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const results = await Promise.allSettled(VENUES.map(fetchVenue));
  const featuredWorkshops = FEATURED_WORKSHOPS.filter((event) => isUpcoming(event.dateISO));
  const events = [
    ...results.flatMap((result) => result.status === "fulfilled" ? result.value : []),
    ...featuredWorkshops,
  ];
  const sources = [
    ...VENUES.map((venue, index) => ({
      name: venue.name,
      available: results[index].status === "fulfilled",
      eventCount: results[index].status === "fulfilled" ? results[index].value.length : 0,
    })),
    { name: "Featured workshops", available: featuredWorkshops.length > 0, eventCount: featuredWorkshops.length },
  ];

  if (results.every((result) => result.status === "rejected") && !featuredWorkshops.length) {
    return response.status(502).json({
      error: "The venue event pages could not be reached right now.",
      events: [],
      sources,
    });
  }

  events.sort((a, b) => `${a.dateISO} ${a.time || ""}`.localeCompare(`${b.dateISO} ${b.time || ""}`));
  return response.status(200).json({
    events,
    sources,
    message: events.length ? undefined : "The venue pages loaded, but no upcoming events were found.",
  });
};
