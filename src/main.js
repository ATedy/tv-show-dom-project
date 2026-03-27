import {
  getSessionUsername,
  signIn,
  signOut,
  signUp,
} from "./app/auth.js";
import {
  buildEpisodeLibraryItem,
  getFavouriteKeys,
  getLibrary,
  getWatchLaterKeys,
  toggleFavourite,
  toggleWatchLater,
} from "./app/library.js";
import { fetchEpisodesForShow } from "./app/api.js";
import {
  normalizeText,
  safeGenres,
  stripHtmlToText,
} from "./app/utils.js";
import {
  renderEpisodeGrid,
  renderEpisodeList,
  renderLibraryEpisodeGrid,
  renderShowGrid,
  renderSuggestionsGrid,
  renderSectionHeader,
  renderEmptyState,
} from "./ui/views.js";

const appEl = document.getElementById("app");
const searchAreaEl = document.getElementById("searchArea");

const loginBtn = document.getElementById("loginBtn");
const userStatusEl = document.getElementById("userStatus");
const usernamePillEl = document.getElementById("usernamePill");
const logoutBtn = document.getElementById("logoutBtn");

const loginModalEl = document.getElementById("loginModal");
const closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
const cancelLoginBtn = document.getElementById("cancelLoginBtn");
const loginFormEl = document.getElementById("loginForm");
const loginUsernameEl = document.getElementById("loginUsername");
const loginPasswordEl = document.getElementById("loginPassword");
const loginErrorEl = document.getElementById("loginError");

const favCountEl = document.getElementById("favCount");
const laterCountEl = document.getElementById("laterCount");

const navButtons = Array.from(document.querySelectorAll("[data-nav]"));

const themeToggleBtn = document.getElementById("themeToggle");

const loginTitleEl = document.getElementById("loginTitle");
const loginHelpTextEl = document.getElementById("loginHelpText");
const authSubmitTextEl = document.getElementById("authSubmitText");

const tabSignInBtn = document.getElementById("tabSignInBtn");
const tabSignUpBtn = document.getElementById("tabSignUpBtn");

const allShows = window.getAllShows(); // provided by shows.js (loaded before this module)

const state = {
  username: getSessionUsername(),
  library: null,

  currentRoute: null,
  currentShowId: null,
  episodesForCurrentShow: [],

  browseQuery: "",
  episodeQuery: "",

  librarySortMode: {
    favourites: "newest",
    "watch-later": "newest",
  },

  authMode: "signin",
};

let pendingAction = null;

function setLoginUI() {
  if (state.username) {
    userStatusEl.classList.remove("hidden");
    loginBtn.classList.add("hidden");
    usernamePillEl.textContent = state.username;
  } else {
    userStatusEl.classList.add("hidden");
    loginBtn.classList.remove("hidden");
  }
}

function setNavActive(routeName) {
  navButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-nav") === routeName;
    btn.classList.toggle("active", isActive);
  });
}

function setThemeUI(theme) {
  // Tailwind uses `dark` class to switch variants.
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDark ? "Day mode" : "Dark mode";
  }
  try {
    localStorage.setItem("streambox:theme:v1", theme);
  } catch {
    // ignore storage errors
  }
}

function initTheme() {
  const saved = (() => {
    try {
      return localStorage.getItem("streambox:theme:v1");
    } catch {
      return null;
    }
  })();

  const isDarkSystem =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "dark" || saved === "light" ? saved : isDarkSystem ? "dark" : "light";
  setThemeUI(theme);
}

function setAuthModeUI(mode) {
  state.authMode = mode;

  const isSignIn = mode === "signin";
  if (loginTitleEl) loginTitleEl.textContent = isSignIn ? "Sign in" : "Sign up";

  if (loginHelpTextEl) {
    loginHelpTextEl.textContent = isSignIn
      ? "Sign in to save favourites and watch later."
      : "Create an account (stored locally in your browser).";
  }

  if (authSubmitTextEl) {
    authSubmitTextEl.textContent = isSignIn ? "Sign In" : "Create Account";
  }

  const signInActive = isSignIn;
  if (tabSignInBtn) {
    tabSignInBtn.classList.toggle("bg-zinc-900/10", signInActive);
    tabSignInBtn.classList.toggle("dark:bg-white/10", signInActive);
    tabSignInBtn.classList.toggle("ring-1", signInActive);
    tabSignInBtn.classList.toggle("ring-zinc-900/10", signInActive);
    tabSignInBtn.classList.toggle("dark:ring-white/10", signInActive);
  }
  if (tabSignUpBtn) {
    tabSignUpBtn.classList.toggle("bg-zinc-900/10", !signInActive);
    tabSignUpBtn.classList.toggle("dark:bg-white/10", !signInActive);
    tabSignUpBtn.classList.toggle("ring-1", !signInActive);
    tabSignUpBtn.classList.toggle("ring-zinc-900/10", !signInActive);
    tabSignUpBtn.classList.toggle("dark:ring-white/10", !signInActive);
  }
}

function openLoginModal() {
  loginErrorEl.classList.add("hidden");
  loginModalEl.classList.remove("hidden");
  loginModalEl.classList.add("flex");
  setAuthModeUI(state.authMode || "signin");
  loginUsernameEl.focus();
}

function closeLoginModal() {
  loginModalEl.classList.add("hidden");
  loginModalEl.classList.remove("flex");
}

function updateCounts() {
  if (!state.library) return;
  const fav = state.library.favourites.length;
  const later = state.library.watchLater.length;
  favCountEl.textContent = `(${fav})`;
  laterCountEl.textContent = `(${later})`;
}

function requireAuth(action) {
  if (state.username) return action();
  pendingAction = action;
  openLoginModal();
}

function parseRoute() {
  const hash = (location.hash || "#browse").replace(/^#/, "");
  if (!hash || hash === "browse") return { name: "browse" };
  if (hash === "suggestions") return { name: "suggestions" };
  if (hash === "favourites") return { name: "favourites" };
  if (hash === "watch-later") return { name: "watch-later" };

  const showMatch = hash.match(/^show\/(\d+)$/);
  if (showMatch) return { name: "show", showId: Number(showMatch[1]) };

  return { name: "browse" };
}

function getShowById(showId) {
  return allShows.find((s) => Number(s.id) === Number(showId)) || null;
}

function computeEpisodeIdSetForShow(libraryItems, showId) {
  const ids = new Set();
  libraryItems
    .filter((x) => Number(x.showId) === Number(showId))
    .forEach((x) => ids.add(String(x.episodeId)));
  return ids;
}

function resetSearchArea() {
  searchAreaEl.innerHTML = "";
}

function renderBrowseSearch() {
  resetSearchArea();
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-3";

  const input = document.createElement("input");
  input.value = state.browseQuery;
  input.placeholder = "Search shows by name, genre, or summary...";
  input.className =
    "h-11 flex-1 rounded-2xl bg-white/70 px-4 text-sm text-zinc-900 outline-none ring-1 ring-zinc-900/10 focus:ring-emerald-500/40 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10";
  input.addEventListener("input", () => {
    state.browseQuery = input.value;
    render();
  });

  wrap.appendChild(input);
  searchAreaEl.appendChild(wrap);
}

function renderEpisodeSearch() {
  resetSearchArea();
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-3";

  const input = document.createElement("input");
  input.value = state.episodeQuery;
  input.placeholder = "Search episodes by title or summary...";
  input.className =
    "h-11 flex-1 rounded-2xl bg-white/70 px-4 text-sm text-zinc-900 outline-none ring-1 ring-zinc-900/10 focus:ring-emerald-500/40 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10";
  input.addEventListener("input", () => {
    state.episodeQuery = input.value;
    render();
  });

  wrap.appendChild(input);
  searchAreaEl.appendChild(wrap);
}

function filterShows(query) {
  const q = normalizeText(query);
  if (!q) return allShows;

  return allShows.filter((show) => {
    const name = normalizeText(show.name);
    const summary = normalizeText(stripHtmlToText(show.summary || ""));
    const genres = safeGenres(show.genres).map(normalizeText).join(" ");
    return name.includes(q) || summary.includes(q) || genres.includes(q);
  });
}

function filterEpisodes(query) {
  const q = normalizeText(query);
  if (!q) return state.episodesForCurrentShow;

  return state.episodesForCurrentShow.filter((ep) => {
    const name = normalizeText(ep.name);
    const summary = normalizeText(stripHtmlToText(ep.summary || ""));
    return name.includes(q) || summary.includes(q);
  });
}

function sortLibraryItems(items, sortMode) {
  const data = Array.from(items || []);
  if (sortMode === "newest") {
    return data.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }
  if (sortMode === "oldest") {
    return data.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  }
  if (sortMode === "show-az") {
    return data.sort((a, b) => (a.showName || "").localeCompare(b.showName || ""));
  }
  // season-episode
  return data.sort((a, b) => {
    const byShow = (a.showName || "").localeCompare(b.showName || "");
    if (byShow !== 0) return byShow;
    const bySeason = (a.season || 0) - (b.season || 0);
    if (bySeason !== 0) return bySeason;
    return (a.number || 0) - (b.number || 0);
  });
}

function renderSortControl({ sortMode, onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "mb-4 flex items-center justify-between gap-3";

  const label = document.createElement("label");
  label.className = "text-sm text-zinc-600/90 dark:text-zinc-300/90";
  label.textContent = "Sort:";

  const select = document.createElement("select");
  select.value = sortMode;
  select.className =
    "h-10 rounded-xl bg-white/70 px-3 text-sm text-zinc-900 outline-none ring-1 ring-zinc-900/10 focus:ring-emerald-500/40 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10";
  [
    ["newest", "Newest"],
    ["oldest", "Oldest"],
    ["show-az", "Show A-Z"],
    ["season-episode", "Season/Episode"],
  ].forEach(([value, text]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = text;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => onChange(select.value));

  wrap.appendChild(label);
  wrap.appendChild(select);
  return wrap;
}

function renderBrowseView() {
  setNavActive("browse");
  renderBrowseSearch();
  appEl.innerHTML = "";

  const filtered = filterShows(state.browseQuery);

  if (filtered.length === 0) {
    appEl.appendChild(renderEmptyState("No shows found", "Try different keywords."));
    return;
  }

  // small "featured" banner
  const featured = filtered
    .slice()
    .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))[0];

  const hero = document.createElement("section");
  hero.className =
    "mb-5 overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 dark:border-white/10 dark:bg-white/5";
  hero.innerHTML = `
    <div class="relative">
      <img
        src="${featured.image?.medium || "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg"}"
        alt="${featured.name}"
        class="h-56 w-full object-cover opacity-90"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent"></div>
      <div class="absolute inset-y-0 left-0 flex h-full w-full items-end">
        <div class="p-5">
          <div class="text-sm text-zinc-200/90">${featured.type || "Show"}</div>
          <h2 class="text-2xl font-semibold tracking-tight">${featured.name}</h2>
          <div class="mt-2 text-sm text-white/80">${featured.genres?.slice(0, 3)?.join(" • ") || ""}</div>
          <div class="mt-4 flex gap-2">
            <button class="rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/20" type="button" data-open-featured="${featured.id}">
              View episodes
            </button>
            <a class="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/10 hover:bg-white/20" href="#suggestions">Suggestions</a>
          </div>
        </div>
      </div>
    </div>
  `;
  appEl.appendChild(hero);
  hero
    .querySelector("[data-open-featured]")
    .addEventListener("click", (e) => {
      const id = Number(e.currentTarget.getAttribute("data-open-featured"));
      location.hash = `#show/${id}`;
    });

  appEl.appendChild(
    renderShowGrid({
      shows: filtered.slice(0, 18),
      onOpenShow: (showId) => {
        state.currentShowId = showId;
        state.episodeQuery = "";
        location.hash = `#show/${showId}`;
      },
    })
  );
}

async function renderShowView({ showId }) {
  setNavActive(null);
  // Ensure episode search only exists for the show route.
  renderEpisodeSearch();
  appEl.innerHTML = "";

  const show = getShowById(showId);
  if (!show) {
    appEl.appendChild(renderEmptyState("Show not found", "Try going back to browse."));
    return;
  }

  state.currentShowId = showId;

  let episodes = [];
  try {
    episodes = await fetchEpisodesForShow(showId);
  } catch (err) {
    appEl.appendChild(
      renderEmptyState("Could not load episodes", String(err?.message || err))
    );
    return;
  }

  state.episodesForCurrentShow = episodes;

  const favouritesForShow = computeEpisodeIdSetForShow(
    state.library?.favourites || [],
    showId
  );
  const laterForShow = computeEpisodeIdSetForShow(
    state.library?.watchLater || [],
    showId
  );

  const filteredEpisodes = filterEpisodes(state.episodeQuery);

  const shell = document.createElement("div");
  shell.className = "space-y-4";

  const top = document.createElement("div");
  top.className =
    "relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 dark:border-white/10 dark:bg-white/5";
  const poster =
    show.image?.medium ||
    "https://cdn3.vectorstock.com/i/thumb-large/25/72/picture-coming-soon-icon-vector-31612572.jpg";
  top.innerHTML = `
    <div class="relative">
      <img
        src="${poster}"
        alt="${show.name}"
        class="h-40 w-full object-cover opacity-90"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      <div class="absolute inset-x-0 bottom-0 p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-sm text-zinc-200/90">${show.type || "Show"}</div>
            <h2 class="text-2xl font-semibold tracking-tight">${show.name}</h2>
          <div class="mt-2 text-sm text-white/80">${show.genres?.slice(0, 3)?.join(" • ") || ""}</div>
          </div>
          <button class="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/10 hover:bg-white/20" type="button" data-back-to-browse>
            Back
          </button>
        </div>
      </div>
    </div>
  `;
  shell.appendChild(top);
  top.querySelector("[data-back-to-browse]").addEventListener("click", () => {
    state.browseQuery = "";
    location.hash = "#browse";
  });

  const controls = document.createElement("div");
  controls.className = "flex items-center justify-between gap-3";
  const count = document.createElement("div");
  count.className = "text-sm text-zinc-600/90 dark:text-zinc-300/90";
  count.textContent = `Showing ${filteredEpisodes.length} episode(s)`;
  controls.appendChild(count);

  // toggles are on episode cards
  shell.appendChild(controls);

  shell.appendChild(
    renderEpisodeList({
      show,
      episodes: filteredEpisodes,
      favouriteKeys: favouritesForShow,
      laterKeys: laterForShow,
      onToggleFavourite: (episode) => {
        requireAuth(() => {
          const item = buildEpisodeLibraryItem({ show, episode });
          state.library = toggleFavourite(state.username, item);
          updateCounts();
          render();
        });
      },
      onToggleLater: (episode) => {
        requireAuth(() => {
          const item = buildEpisodeLibraryItem({ show, episode });
          state.library = toggleWatchLater(state.username, item);
          updateCounts();
          render();
        });
      },
    })
  );

  appEl.appendChild(shell);
}

function renderLibraryView({ mode }) {
  const routeName = mode === "favourites" ? "favourites" : "watch-later";
  setNavActive(routeName);
  resetSearchArea();
  appEl.innerHTML = "";

  if (!state.username) {
    appEl.appendChild(
      renderEmptyState("Login required", "Sign in to save favourites and watch later.")
    );
    return;
  }

  const favouriteKeys = getFavouriteKeys(state.library);
  const laterKeys = getWatchLaterKeys(state.library);

  const sortWrap = document.createElement("div");
  sortWrap.className = "mb-4";

  let sortMode = state.librarySortMode[routeName];
  sortWrap.appendChild(
    renderSortControl({
      sortMode,
      onChange: (value) => {
        state.librarySortMode[routeName] = value;
        render();
      },
    })
  );

  const items = mode === "favourites" ? state.library.favourites : state.library.watchLater;
  const sortedItems = sortLibraryItems(items, sortMode);

  const title = mode === "favourites" ? "Your favourites" : "Watch later";
  const subtitle =
    mode === "favourites"
      ? "Tap the heart to remove."
      : "Tap the bookmark to remove.";

  appEl.appendChild(renderSectionHeader({ title, description: subtitle }));
  appEl.appendChild(sortWrap);

  const shell = renderLibraryEpisodeGrid({
    title: "Nothing here yet",
    subtitle: "Save episodes with the heart or bookmark buttons.",
    items: sortedItems,
    favouriteKeys,
    laterKeys,
    onToggleFavouriteByKey: (key) => {
      requireAuth(() => {
        const item =
          state.library.favourites.find((x) => x.key === key) ||
          state.library.watchLater.find((x) => x.key === key);
        if (!item) return;
        state.library = toggleFavourite(state.username, item);
        updateCounts();
        render();
      });
    },
    onToggleLaterByKey: (key) => {
      requireAuth(() => {
        const item =
          state.library.favourites.find((x) => x.key === key) ||
          state.library.watchLater.find((x) => x.key === key);
        if (!item) return;
        state.library = toggleWatchLater(state.username, item);
        updateCounts();
        render();
      });
    },
    onWatchByKey: (key) => {
      const item =
        state.library.favourites.find((x) => x.key === key) ||
        state.library.watchLater.find((x) => x.key === key);
      if (!item) return;
      window.open(item.episodeUrl, "_blank", "noopener,noreferrer");
    },
  });

  appEl.appendChild(shell);
}

function computeSuggestedShows() {
  const favItems = state.library?.favourites || [];
  const favGenresCount = new Map();
  const favShowIds = new Set(favItems.map((x) => x.showId));

  favItems.forEach((item) => {
    (item.showGenres || []).forEach((g) => {
      favGenresCount.set(g, (favGenresCount.get(g) || 0) + 1);
    });
  });

  const topGenres = Array.from(favGenresCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  let candidates = allShows.slice();
  if (topGenres.length > 0) {
    candidates = candidates.filter((show) => {
      const genres = safeGenres(show.genres);
      return genres.some((g) => topGenres.includes(g));
    });
    candidates = candidates.filter((show) => !favShowIds.has(show.id));
  }

  if (candidates.length === 0) {
    candidates = allShows.slice().sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
  }

  return { candidates: candidates.slice(0, 12), topGenres };
}

function renderSuggestionsView() {
  setNavActive("suggestions");
  resetSearchArea();
  appEl.innerHTML = "";

  let headerText = "Top picks for you";
  if (state.username && state.library) {
    const { candidates, topGenres } = computeSuggestedShows();
    if (topGenres.length > 0) {
      headerText = `Because you like: ${topGenres.join(", ")}`;
    }

    appEl.appendChild(
      renderSuggestionsGrid({
        shows: candidates,
        onOpenShow: (showId) => {
          state.episodeQuery = "";
          location.hash = `#show/${showId}`;
        },
        headerText,
      })
    );
  } else {
    const candidates = allShows
      .slice()
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .slice(0, 12);
    appEl.appendChild(
      renderSuggestionsGrid({
        shows: candidates,
        onOpenShow: (showId) => {
          state.episodeQuery = "";
          location.hash = `#show/${showId}`;
        },
        headerText,
      })
    );
  }
}

async function render() {
  const route = parseRoute();
  state.currentRoute = route;

  // init library on first render
  if (state.username && !state.library) {
    state.library = getLibrary(state.username);
    updateCounts();
  }

  setLoginUI();

  if (route.name === "browse") {
    renderBrowseView();
    return;
  }
  if (route.name === "suggestions") {
    renderSuggestionsView();
    return;
  }
  if (route.name === "favourites") {
    renderLibraryView({ mode: "favourites" });
    return;
  }
  if (route.name === "watch-later") {
    renderLibraryView({ mode: "watch-later" });
    return;
  }
  if (route.name === "show") {
    state.episodeQuery = state.episodeQuery || "";
    await renderShowView({ showId: route.showId });
    return;
  }

  renderBrowseView();
}

// ---- Events ----
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const route = btn.getAttribute("data-nav");
    if (route === "browse") location.hash = "#browse";
    if (route === "suggestions") location.hash = "#suggestions";
    if (route === "favourites") location.hash = "#favourites";
    if (route === "watch-later") location.hash = "#watch-later";
  });
});

loginBtn.addEventListener("click", () => openLoginModal());

logoutBtn.addEventListener("click", () => {
  signOut();
  state.username = null;
  state.library = null;
  pendingAction = null;
  updateCounts();
  closeLoginModal();
  location.hash = "#browse";
  render();
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeUI(isDark ? "light" : "dark");
  });
}

closeLoginModalBtn.addEventListener("click", () => {
  closeLoginModal();
});
cancelLoginBtn.addEventListener("click", () => closeLoginModal());

loginModalEl.addEventListener("click", (e) => {
  if (e.target === loginModalEl) closeLoginModal();
});

tabSignInBtn?.addEventListener("click", () => setAuthModeUI("signin"));
tabSignUpBtn?.addEventListener("click", () => setAuthModeUI("signup"));

loginFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginErrorEl.classList.add("hidden");
  try {
    const username = loginUsernameEl.value;
    const password = loginPasswordEl.value;
    state.username =
      state.authMode === "signup"
        ? await signUp(username, password)
        : await signIn(username, password);
    state.library = getLibrary(state.username);
    pendingAction && pendingAction();
    pendingAction = null;
    updateCounts();
    closeLoginModal();
    render();
  } catch (err) {
    const msg = String(err?.message || err);
    loginErrorEl.textContent = msg;
    loginErrorEl.classList.remove("hidden");
  }
});

window.addEventListener("hashchange", () => {
  render();
});

// ---- Boot ----
initTheme();
render();

