import { bookmarkIcon, heartIcon, playIcon } from "./icons.js";
import {
  DEFAULT_POSTER,
  formatAirDate,
  formatEpisodeCode,
  stripHtmlToText,
  truncateText,
} from "../app/utils.js";

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    node.setAttribute(k, String(v));
  }
  return node;
}

function badge(text, className) {
  const node = el("span", `inline-flex items-center rounded-full px-2 py-1 text-xs ${className}`);
  node.textContent = text;
  return node;
}

export function renderEmptyState(message, submessage) {
  const wrap = el(
    "div",
    "rounded-2xl border border-zinc-200/60 bg-white/80 p-6 dark:border-white/10 dark:bg-white/5"
  );
  wrap.appendChild(
    el("div", "text-base font-semibold text-zinc-900 dark:text-white", { "data-testid": "empty-title" })
  );
  wrap.firstChild.textContent = message;
  if (submessage) {
    const p = el("p", "mt-2 text-sm text-zinc-600/90 dark:text-zinc-300/90");
    p.textContent = submessage;
    wrap.appendChild(p);
  }
  return wrap;
}

export function renderShowGrid({ shows, onOpenShow }) {
  const grid = el("div", "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3");
  shows.forEach((show) => {
    const card = el(
      "div",
      "group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    );

    const img = el("img", "h-56 w-full object-cover opacity-90 group-hover:opacity-100", {
      src: show.image?.medium || DEFAULT_POSTER,
      alt: show.name,
      loading: "lazy",
    });
    card.appendChild(img);

    const overlay = el("div", "absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent");
    card.appendChild(overlay);

    const content = el("div", "absolute inset-x-0 bottom-0 p-4");
    const title = el("h3", "text-base font-semibold text-white");
    title.textContent = show.name;
    content.appendChild(title);

    const meta = el("div", "mt-2 flex items-center gap-2");
    if (show.rating?.average) {
      meta.appendChild(
        badge(
          `★ ${show.rating.average.toFixed(1)}`,
          "bg-amber-400/10 text-amber-900 border border-amber-400/20 dark:text-amber-200"
        )
      );
    }
    const genreText = Array.isArray(show.genres) ? show.genres.slice(0, 2).join(" • ") : "";
    if (genreText) {
      meta.appendChild(
        badge(
          genreText,
          "bg-white/5 text-white border border-white/10"
        )
      );
    }
    content.appendChild(meta);

    const btn = el(
      "button",
      "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
    );
    btn.type = "button";
    btn.textContent = "View episodes";
    btn.addEventListener("click", () => onOpenShow(show.id));
    content.appendChild(btn);

    card.appendChild(content);
    grid.appendChild(card);
  });
  return grid;
}

function episodeCardCommonLayout({ showImage, episodeImage, title, summaryText, metaRow }) {
  const card = el(
    "div",
    "flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
  );

  const top = el("div", "relative");
  const poster = el("img", "h-36 w-full object-cover opacity-95", {
    src: episodeImage || showImage,
    alt: title,
    loading: "lazy",
  });
  top.appendChild(poster);

  const tint = el("div", "absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent");
  top.appendChild(tint);

  const titleWrap = el("div", "absolute inset-x-0 bottom-0 p-3");
  titleWrap.appendChild(el("div", "text-sm font-semibold text-white"));
  titleWrap.firstChild.textContent = title;
  titleWrap.appendChild(metaRow);
  top.appendChild(titleWrap);

  card.appendChild(top);

  const body = el("div", "p-3");
  body.appendChild(el("p", "mt-1 text-sm text-zinc-600/90 dark:text-zinc-300/90"));
  body.lastChild.textContent = summaryText || "";
  card.appendChild(body);

  return card;
}

export function renderEpisodeGrid({
  show,
  episodes,
  favouriteKeys,
  laterKeys,
  onToggleFavourite,
  onToggleLater,
  onWatch,
}) {
  if (!episodes || episodes.length === 0) {
    return renderEmptyState("No episodes found", "Try a different search.");
  }

  const grid = el("div", "grid grid-cols-1 gap-4 lg:grid-cols-2");
  episodes.forEach((episode) => {
    const isFavourite = favouriteKeys?.has(String(episode.id)) || false;
    const isLater = laterKeys?.has(String(episode.id)) || false;

    const summaryText = truncateText(stripHtmlToText(episode.summary || ""), 180);

    const metaRow = el("div", "mt-2 flex items-center gap-2");
    const code = el("span", "rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-200 border border-white/10");
    code.textContent = `${formatEpisodeCode(episode)}`;
    metaRow.appendChild(code);

    const air = episode.airdate ? el("span", "text-xs text-zinc-200/80") : null;
    if (air) {
      air.textContent = formatAirDate(episode.airdate);
      metaRow.appendChild(air);
    }

    const card = episodeCardCommonLayout({
      showImage: show?.image?.medium || DEFAULT_POSTER,
      episodeImage: episode?.image?.medium || DEFAULT_POSTER,
      title: episode.name,
      summaryText,
      metaRow,
    });

    const actions = el("div", "mt-3 flex items-center gap-2");

    const favBtn = el(
      "button",
      isFavourite
        ? "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-rose-700 ring-1 ring-rose-400/30 hover:bg-rose-500/20 dark:text-rose-300"
        : "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-white/10 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10",
      { type: "button" }
    );
    favBtn.innerHTML = heartIcon({ filled: isFavourite });
    favBtn.addEventListener("click", () => onToggleFavourite(episode));

    const laterBtn = el(
      "button",
      isLater
        ? "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400/15 px-3 py-2 text-cyan-800 ring-1 ring-cyan-400/30 hover:bg-cyan-400/20 dark:text-cyan-200"
        : "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-white/10 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10",
      { type: "button" }
    );
    laterBtn.innerHTML = bookmarkIcon({ filled: isLater });
    laterBtn.addEventListener("click", () => onToggleLater(episode));

    const watchBtn = el(
      "a",
      "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-emerald-900 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20 dark:text-emerald-200",
      { href: episode.url, target: "_blank", rel: "noopener noreferrer" }
    );
    watchBtn.innerHTML = playIcon();
    watchBtn.addEventListener("click", (e) => {
      // If not logged in, let main show login modal on toggle actions only.
      // This stays as a simple "open in new tab".
    });

    actions.appendChild(favBtn);
    actions.appendChild(laterBtn);
    actions.appendChild(watchBtn);
    card.appendChild(actions);

    grid.appendChild(card);
  });

  return grid;
}

export function renderEpisodeList({
  show,
  episodes,
  favouriteKeys,
  laterKeys,
  onToggleFavourite,
  onToggleLater,
}) {
  if (!episodes || episodes.length === 0) {
    return renderEmptyState("No episodes found", "Try a different search.");
  }

  const listWrap = el("div", "space-y-3");

  episodes.forEach((episode) => {
    const isFavourite = favouriteKeys?.has(String(episode.id)) || false;
    const isLater = laterKeys?.has(String(episode.id)) || false;

    const summaryText = truncateText(stripHtmlToText(episode.summary || ""), 180);

    const row = el(
      "div",
      "flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5"
    );

    const left = el("div", "flex min-w-0 items-start gap-3");
    const thumb = el("img", "h-16 w-16 flex-none rounded-xl object-cover", {
      src:
        episode?.image?.medium || show?.image?.medium || DEFAULT_POSTER,
      alt: episode.name,
      loading: "lazy",
    });
    left.appendChild(thumb);

    const mid = el("div", "min-w-0");
    const titleLine = el("div", "flex flex-wrap items-center gap-2");
    const code = el(
      "span",
      "rounded-full bg-zinc-900/5 px-2 py-1 text-xs text-zinc-800 ring-1 ring-zinc-900/10 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10"
    );
    code.textContent = formatEpisodeCode(episode);
    titleLine.appendChild(code);

    const name = el("div", "min-w-[10rem] text-sm font-semibold text-zinc-900 dark:text-white");
    name.textContent = episode.name;
    titleLine.appendChild(name);

    mid.appendChild(titleLine);

    const summary = el(
      "p",
      "mt-2 text-sm text-zinc-600/90 dark:text-zinc-300/90"
    );
    summary.textContent = summaryText;
    mid.appendChild(summary);

    left.appendChild(mid);
    row.appendChild(left);

    const actions = el("div", "flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center");

    const favBtn = el(
      "button",
      isFavourite
        ? "rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-400/30 hover:bg-rose-500/20 dark:text-rose-300"
        : "rounded-xl bg-zinc-900/5 px-3 py-2 text-sm font-medium text-zinc-800 ring-1 ring-zinc-900/10 hover:bg-zinc-900/10 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10",
      { type: "button" }
    );
    favBtn.innerHTML = heartIcon({ filled: isFavourite });
    favBtn.addEventListener("click", () => onToggleFavourite(episode));

    const laterBtn = el(
      "button",
      isLater
        ? "rounded-xl bg-cyan-400/15 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-400/30 hover:bg-cyan-400/20 dark:text-cyan-200"
        : "rounded-xl bg-zinc-900/5 px-3 py-2 text-sm font-medium text-zinc-800 ring-1 ring-zinc-900/10 hover:bg-zinc-900/10 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10",
      { type: "button" }
    );
    laterBtn.innerHTML = bookmarkIcon({ filled: isLater });
    laterBtn.addEventListener("click", () => onToggleLater(episode));

    const watchBtn = el(
      "a",
      "rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-900 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20 dark:text-emerald-200",
      { href: episode.url, target: "_blank", rel: "noopener noreferrer" }
    );
    watchBtn.innerHTML = playIcon();

    actions.appendChild(favBtn);
    actions.appendChild(laterBtn);
    actions.appendChild(watchBtn);
    row.appendChild(actions);

    listWrap.appendChild(row);
  });

  return listWrap;
}

export function renderLibraryEpisodeGrid({
  title,
  subtitle,
  items,
  favouriteKeys,
  laterKeys,
  onToggleFavouriteByKey,
  onToggleLaterByKey,
  onWatchByKey,
}) {
  if (!items || items.length === 0) {
    return renderEmptyState(title, subtitle);
  }

  const grid = el("div", "grid grid-cols-1 gap-4 lg:grid-cols-2");

  items.forEach((item) => {
    const isFavourite = favouriteKeys?.has(item.key) || false;
    const isLater = laterKeys?.has(item.key) || false;

    const metaRow = el("div", "mt-2 flex items-center gap-2");
    const code = el(
      "span",
      "rounded-full bg-zinc-900/5 px-2 py-1 text-xs text-zinc-800 border border-zinc-900/10 dark:bg-white/5 dark:text-zinc-200 dark:border-white/10"
    );
    code.textContent = `S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")}`;
    metaRow.appendChild(code);

    const card = episodeCardCommonLayout({
      showImage: item.showImage || DEFAULT_POSTER,
      episodeImage: item.episodeImage || DEFAULT_POSTER,
      title: item.episodeName,
      summaryText: item.summaryText,
      metaRow,
    });

    const actions = el("div", "mt-3 flex items-center gap-2");

    const favBtn = el(
      "button",
      isFavourite
        ? "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/15 px-3 py-2 text-rose-700 ring-1 ring-rose-400/30 hover:bg-rose-500/20 dark:text-rose-300"
        : "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-white/10 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10",
      { type: "button" }
    );
    favBtn.innerHTML = heartIcon({ filled: isFavourite });
    favBtn.addEventListener("click", () => onToggleFavouriteByKey(item.key));

    const laterBtn = el(
      "button",
      isLater
        ? "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400/15 px-3 py-2 text-cyan-800 ring-1 ring-cyan-400/30 hover:bg-cyan-400/20 dark:text-cyan-200"
        : "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-white/10 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10",
      { type: "button" }
    );
    laterBtn.innerHTML = bookmarkIcon({ filled: isLater });
    laterBtn.addEventListener("click", () => onToggleLaterByKey(item.key));

    const watchBtn = el(
      "a",
      "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-emerald-900 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20 dark:text-emerald-200",
      { href: item.episodeUrl, target: "_blank", rel: "noopener noreferrer" }
    );
    watchBtn.innerHTML = playIcon();
    watchBtn.addEventListener("click", () => onWatchByKey(item.key));

    actions.appendChild(favBtn);
    actions.appendChild(laterBtn);
    actions.appendChild(watchBtn);

    card.appendChild(actions);
    grid.appendChild(card);
  });

  const wrap = el("div", "space-y-4");
  wrap.appendChild(grid);
  return wrap;
}

export function renderSectionHeader({ title, description }) {
  const wrap = el("div", "mb-4 flex flex-col gap-1");
  const h2 = el("h2", "text-2xl font-semibold tracking-tight");
  h2.textContent = title;
  wrap.appendChild(h2);
  if (description) {
    const p = el("p", "text-sm text-zinc-600/90 dark:text-zinc-300/90");
    p.textContent = description;
    wrap.appendChild(p);
  }
  return wrap;
}

export function renderSuggestionsGrid({ shows, onOpenShow, headerText }) {
  const wrap = el("div", "space-y-4");
  if (headerText) {
    const h = el(
      "div",
      "text-lg font-semibold text-zinc-900 dark:text-white",
      { "data-testid": "suggestions-header" }
    );
    h.textContent = headerText;
    wrap.appendChild(h);
  }
  wrap.appendChild(
    renderShowGrid({
      shows,
      onOpenShow,
    })
  );
  return wrap;
}

