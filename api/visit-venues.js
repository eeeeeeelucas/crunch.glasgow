const { lookupVisitGlasgowVenue } = require("./events");

const MAX_VENUE_LOOKUPS = 15;

function isVisitGlasgowEventUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "www.visitglasgow.com"
      && !url.port
      && !url.username
      && !url.password;
  } catch {
    return false;
  }
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const requestedUrls = request.body?.urls;
  if (!Array.isArray(requestedUrls) || requestedUrls.length > MAX_VENUE_LOOKUPS) {
    return response.status(400).json({ error: "Provide up to 15 event URLs." });
  }

  if (requestedUrls.some((url) => !isVisitGlasgowEventUrl(url))) {
    return response.status(400).json({ error: "Only Visit Glasgow event URLs are supported." });
  }

  const urls = [...new Set(requestedUrls)];
  const entries = await Promise.all(urls.map(async (url) => [url, await lookupVisitGlasgowVenue(url)]));
  const venues = Object.fromEntries(entries.filter(([, venue]) => venue));
  return response.status(200).json({ venues });
};
