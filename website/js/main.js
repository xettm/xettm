// Wires the UI to Auth + Game.

(() => {
  // ---- DOM refs ----
  const authScreen = document.getElementById("auth-screen");
  const gameScreen = document.getElementById("game-screen");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginError = document.getElementById("login-error");
  const registerError = document.getElementById("register-error");

  const tabs = document.querySelectorAll(".tab");
  const forms = { login: loginForm, register: registerForm };

  const statMoney = document.getElementById("stat-money");
  const statVisitors = document.getElementById("stat-visitors");
  const statHappiness = document.getElementById("stat-happiness");
  const statRating = document.getElementById("stat-rating");
  const currentUserEl = document.getElementById("current-user");

  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const logoutBtn = document.getElementById("logout-btn");

  const categoryTabs = document.querySelectorAll(".cat-tab");
  const catalogList = document.getElementById("catalog-list");
  const bulldozeBtn = document.getElementById("bulldoze-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const buildHint = document.getElementById("build-hint");

  const gridEl = document.getElementById("park-grid");
  const eventLog = document.getElementById("event-log");

  let activeCategory = "ride";

  // ---- Tab switching ----
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(forms).forEach((f) => f.classList.remove("active"));
      forms[tab.dataset.tab].classList.add("active");
      loginError.textContent = "";
      registerError.textContent = "";
    });
  });

  // ---- Auth submit ----
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const fd = new FormData(loginForm);
    try {
      const username = await Auth.login(fd.get("username"), fd.get("password"));
      enterGame(username);
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.textContent = "";
    const fd = new FormData(registerForm);
    try {
      const username = await Auth.register(fd.get("username"), fd.get("password"));
      enterGame(username);
    } catch (err) {
      registerError.textContent = err.message;
    }
  });

  // ---- Enter / leave game ----
  function enterGame(username) {
    authScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    currentUserEl.textContent = "Logged in as " + username;
    buildGrid();
    Game.loadFor(username);
    Game.start();
  }

  function leaveGame() {
    Game.stop();
    Game.saveNow();
    Auth.logout();
    gameScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");
    loginForm.reset();
    registerForm.reset();
  }

  // ---- Topbar buttons ----
  saveBtn.addEventListener("click", () => {
    Game.saveNow();
    Game.log("Game saved.", "good");
  });
  logoutBtn.addEventListener("click", leaveGame);
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset your park? This cannot be undone.")) {
      Game.resetPark();
    }
  });

  // ---- Sidebar ----
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.cat;
      render();
    });
  });

  bulldozeBtn.addEventListener("click", () => Game.toggleBulldoze());
  cancelBtn.addEventListener("click", () => Game.cancelTool());

  // ---- Grid ----
  function buildGrid() {
    gridEl.innerHTML = "";
    gridEl.style.gridTemplateColumns = `repeat(${Game.GRID_W}, 1fr)`;
    for (let i = 0; i < Game.GRID_W * Game.GRID_H; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.i = String(i);
      cell.addEventListener("click", () => Game.handleCellClick(i));
      gridEl.appendChild(cell);
    }
  }

  // ---- Render loop ----
  function render() {
    const s = Game.snapshot();

    statMoney.textContent = "$" + s.money.toLocaleString();
    statVisitors.textContent = s.stats.visitors.toLocaleString();
    statHappiness.textContent = s.stats.happiness + "%";
    statRating.textContent = s.stats.rating.toLocaleString();

    // Catalog list for current category.
    catalogList.innerHTML = "";
    const items = s.catalog.filter((x) => x.category === activeCategory);
    if (items.length === 0) {
      catalogList.innerHTML = `<div class="hint">No ${activeCategory}s in the catalog yet.</div>`;
    }
    for (const item of items) {
      const affordable = s.money >= item.cost;
      const el = document.createElement("div");
      el.className = "catalog-item" + (s.selected === item.id ? " selected" : "") + (affordable ? "" : " disabled");
      el.title = item.description || item.name;
      el.innerHTML = `
        <div class="emoji">${item.emoji}</div>
        <div>
          <div class="name">${item.name}</div>
          <div class="meta">+${item.income}/s · 😊${item.happiness}${item.capacity ? " · 👥" + item.capacity : ""}</div>
        </div>
        <div class="cost">$${item.cost}</div>
      `;
      el.addEventListener("click", () => {
        if (!affordable) {
          Game.log(`Need $${item.cost} for ${item.name}.`, "bad");
          return;
        }
        Game.select(item.id);
      });
      catalogList.appendChild(el);
    }

    // Tool buttons.
    bulldozeBtn.classList.toggle("active", s.bulldoze);

    // Hint.
    if (s.bulldoze) {
      buildHint.textContent = "Bulldoze mode: click a building to demolish it (40% refund).";
    } else if (s.selected) {
      const item = s.catalogById[s.selected];
      buildHint.textContent = `Placing ${item.name}. Click an empty cell. (${item.description || ""})`;
    } else {
      buildHint.textContent = "Pick something to build, then click a grid cell.";
    }

    // Grid tiles.
    const cells = gridEl.children;
    for (let i = 0; i < s.grid.length; i++) {
      const el = cells[i];
      if (!el) continue;
      const c = s.grid[i];
      el.classList.toggle("has-building", !!c);
      el.classList.toggle("bulldoze-mode", s.bulldoze);
      el.classList.toggle("place-mode", !!s.selected && !s.bulldoze && !c);
      if (c) {
        const item = s.catalogById[c.id];
        el.textContent = item ? item.emoji : "";
        el.title = item ? `${item.name} (+${item.income}/s)` : "";
      } else {
        el.textContent = "";
        el.title = "";
      }
    }
  }

  // ---- Event log ----
  Game.on("change", render);
  Game.on("log", ({ ts, msg, tone }) => {
    const entry = document.createElement("div");
    entry.className = "entry" + (tone ? " " + tone : "");
    entry.innerHTML = `<span class="ts">${ts}</span>${msg}`;
    eventLog.appendChild(entry);
    // Cap log size.
    while (eventLog.children.length > 50) eventLog.removeChild(eventLog.firstChild);
    eventLog.scrollTop = eventLog.scrollHeight;
  });

  // ---- Save on unload ----
  window.addEventListener("beforeunload", () => {
    Game.saveNow();
  });

  // ---- Auto-login if session exists ----
  const existing = Auth.currentUser();
  if (existing) {
    enterGame(existing);
  }
})();
