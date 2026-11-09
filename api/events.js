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
    description: "A welcoming weekly life-drawing session. Bring your own materials or borrow from the venue; no tuition is provided.",
    image: WORKSHOP_IMAGES.lifeDrawing,
    ticketUrl: "https://www.eventbrite.co.uk/e/all-the-young-nudes-life-drawing-club-glasgow-tickets-1118778168619",
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
  if (/workshop|masterclass|life.?drawing|pottery|ceramic|art session|drawing club/.test(text)) return "Workshops";
  if (/comedy|stand.?up|comedian|comic|laugh-in|red raw/.test(text)) return "Comedy";
  if (/theatre|theater|musical|pantomime|opera|ballet|\bplays?\b/.test(text)) return "Theatre";
  if (/class\b/.test(text)) return "Workshops";
  if (/club|\bdj\b|rave|techno|house music|dance night|disco/.test(text)) return "Clubs";
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
      category: classify(title),
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

function dateFromText(value) {
  const matches = [...value.matchAll(/\b(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?/g)];
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
      "User-Agent": "CrunchGlasgowEvents/1.0 (+https://crunchglasgow.vercel.app)",
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
