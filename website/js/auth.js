// Simple client-side auth using localStorage.
//
// NOTE: This is for a local fun game — passwords are hashed with SHA-256 but
// there is no server, so anyone with access to the browser can read the data.
// Don't reuse real passwords here.

const Auth = (() => {
  const USERS_KEY = "tpt.users";       // { [username]: { salt, hash } }
  const SESSION_KEY = "tpt.session";   // { username }

  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function randomSalt() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

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

  async function register(username, password) {
    username = String(username || "").trim();
    if (username.length < 2) throw new Error("Username must be at least 2 characters.");
    if (!password || password.length < 4) throw new Error("Password must be at least 4 characters.");

    const users = loadUsers();
    const key = username.toLowerCase();
    if (users[key]) throw new Error("That username is already taken.");

    const salt = randomSalt();
    const hash = await sha256(salt + ":" + password);
    users[key] = { username, salt, hash };
    saveUsers(users);
    setSession(username);
    return username;
  }

  async function login(username, password) {
    username = String(username || "").trim();
    const users = loadUsers();
    const record = users[username.toLowerCase()];
    if (!record) throw new Error("No account with that username.");
    const hash = await sha256(record.salt + ":" + password);
    if (hash !== record.hash) throw new Error("Incorrect password.");
    setSession(record.username);
    return record.username;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
  }

  function currentUser() {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      return s && s.username ? s.username : null;
    } catch {
      return null;
    }
  }

  function saveKeyFor(username) {
    return "tpt.save." + username.toLowerCase();
  }

  function loadSave(username) {
    try {
      return JSON.parse(localStorage.getItem(saveKeyFor(username)) || "null");
    } catch {
      return null;
    }
  }

  function writeSave(username, data) {
    localStorage.setItem(saveKeyFor(username), JSON.stringify(data));
  }

  function clearSave(username) {
    localStorage.removeItem(saveKeyFor(username));
  }

  return { register, login, logout, currentUser, loadSave, writeSave, clearSave };
})();
