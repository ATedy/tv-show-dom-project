const USERS_KEY = "streambox:users:v1";
const SESSION_KEY = "streambox:session:v1";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSessionUsername() {
  const session = loadSession();
  return session?.username || null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signInOrUp(username, password) {
  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername) throw new Error("Username is required.");
  if (!password || password.length < 4)
    throw new Error("Password must be at least 4 characters.");

  const users = loadUsers();
  const passwordHash = await sha256Hex(password);

  const existing = users[cleanUsername];
  if (!existing) {
    users[cleanUsername] = { passwordHash, createdAt: Date.now() };
    saveUsers(users);
  } else if (existing.passwordHash !== passwordHash) {
    throw new Error("Invalid username/password.");
  }

  saveSession({ username: cleanUsername, issuedAt: Date.now() });
  return cleanUsername;
}

export async function signUp(username, password) {
  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername) throw new Error("Username is required.");
  if (!password || password.length < 4)
    throw new Error("Password must be at least 4 characters.");

  const users = loadUsers();
  if (users[cleanUsername]) {
    throw new Error("Username already exists. Please sign in.");
  }

  const passwordHash = await sha256Hex(password);
  users[cleanUsername] = { passwordHash, createdAt: Date.now() };
  saveUsers(users);
  saveSession({ username: cleanUsername, issuedAt: Date.now() });
  return cleanUsername;
}

export async function signIn(username, password) {
  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername) throw new Error("Username is required.");
  if (!password || password.length < 4)
    throw new Error("Password must be at least 4 characters.");

  const users = loadUsers();
  const existing = users[cleanUsername];
  if (!existing) {
    throw new Error("No account for this username. Please sign up.");
  }

  const passwordHash = await sha256Hex(password);
  if (existing.passwordHash !== passwordHash) {
    throw new Error("Invalid username/password.");
  }

  saveSession({ username: cleanUsername, issuedAt: Date.now() });
  return cleanUsername;
}

function normalizeUsername(input) {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().toLowerCase();
}

