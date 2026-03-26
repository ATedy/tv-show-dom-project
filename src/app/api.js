const EPISODES_CACHE = new Map();

export async function fetchEpisodesForShow(showId) {
  const id = Number(showId);
  if (!Number.isFinite(id)) throw new Error("Invalid show id.");

  if (EPISODES_CACHE.has(id)) return EPISODES_CACHE.get(id);

  const url = `https://api.tvmaze.com/shows/${id}/episodes`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch episodes (HTTP ${res.status}).`);
  }

  const data = await res.json();
  EPISODES_CACHE.set(id, data);
  return data;
}

