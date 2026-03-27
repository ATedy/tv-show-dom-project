import {
  DEFAULT_POSTER,
  getEpisodeKey,
  safeGenres,
  stripHtmlToText,
  truncateText,
} from "./utils.js";

const LIBRARY_PREFIX = "streambox:library:v1:";

function libraryKey(username) {
  return `${LIBRARY_PREFIX}${username}`;
}

export function getLibrary(username) {
  const key = libraryKey(username);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        favourites: Array.isArray(parsed?.favourites)
          ? parsed.favourites
          : [],
        watchLater: Array.isArray(parsed?.watchLater) ? parsed.watchLater : [],
      };
    } catch {
      // fallthrough to init
    }
  }

  const initial = { favourites: [], watchLater: [] };
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

function saveLibrary(username, library) {
  localStorage.setItem(libraryKey(username), JSON.stringify(library));
}

export function getFavouriteKeys(library) {
  return new Set((library.favourites || []).map((x) => x.key));
}

export function getWatchLaterKeys(library) {
  return new Set((library.watchLater || []).map((x) => x.key));
}

export function buildEpisodeLibraryItem({ show, episode }) {
  const showImage = show?.image?.medium || DEFAULT_POSTER;
  const episodeImage = episode?.image?.medium || DEFAULT_POSTER;
  const summaryText = truncateText(
    stripHtmlToText(episode?.summary || ""),
    220
  );

  return {
    key: getEpisodeKey(show.id, episode.id),
    showId: show.id,
    showName: show.name,
    showGenres: safeGenres(show.genres),
    showImage,

    episodeId: episode.id,
    episodeName: episode.name,
    episodeUrl: episode.url,
    episodeImage,
    season: episode.season,
    number: episode.number,
    summaryText,
    addedAt: Date.now(),
  };
}

function toggleList(items, itemToToggle) {
  const idx = items.findIndex((x) => x.key === itemToToggle.key);
  if (idx >= 0) {
    return items.filter((x) => x.key !== itemToToggle.key);
  }
  return [{ ...itemToToggle, addedAt: Date.now() }, ...items];
}

export function toggleFavourite(username, item) {
  const library = getLibrary(username);
  const next = {
    ...library,
    favourites: toggleList(library.favourites, item),
  };
  saveLibrary(username, next);
  return next;
}

export function toggleWatchLater(username, item) {
  const library = getLibrary(username);
  const next = {
    ...library,
    watchLater: toggleList(library.watchLater, item),
  };
  saveLibrary(username, next);
  return next;
}

