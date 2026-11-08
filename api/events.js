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
    area: "West End",
    url: "https://swg3.tv/events",
    parse: parseSwg3,
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

function classify(title) {
  if (/comedy|stand.?up|comic/i.test(title)) return "Comedy";
  if (/theatre|theater|musical|pantomime/i.test(title)) return "Theatre";
  if (/workshop|masterclass/i.test(title)) return "Workshops";
  if (/club|\bdj\b|rave|techno|house music|dance night|disco/i.test(title)) return "Clubs";
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
      area: "West End",
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
  const events = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const sources = VENUES.map((venue, index) => ({
    name: venue.name,
    available: results[index].status === "fulfilled",
    eventCount: results[index].status === "fulfilled" ? results[index].value.length : 0,
  }));

  if (results.every((result) => result.status === "rejected")) {
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
