export const DEFAULT_POSTER =
  "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg";

export function getEpisodeKey(showId, episodeId) {
  return `${showId}:${episodeId}`;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatEpisodeCode(episode) {
  return `S${pad2(episode.season)}E${pad2(episode.number)}`;
}

export function stripHtmlToText(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export function truncateText(text, maxLen = 220) {
  if (!text) return "";
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}...`;
}

export function safeGenres(genres) {
  if (!Array.isArray(genres)) return [];
  return genres.filter((g) => typeof g === "string");
}

export function formatAirDate(airdate) {
  if (!airdate) return "";
  const d = new Date(airdate);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function normalizeText(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

