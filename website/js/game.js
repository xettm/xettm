// Theme Park Tycoon — core game logic.
//
// Balance knobs live here. Tweak freely.

const Game = (() => {
  const GRID_W = 12;
  const GRID_H = 12;
  const TICK_MS = 1000;          // how often the park "ticks"
  const AUTOSAVE_TICKS = 10;     // autosave every N ticks
  const STARTING_MONEY = 2000;

  // Build a lookup map from the catalog.
  const CATALOG_BY_ID = Object.fromEntries((window.CATALOG || []).map((x) => [x.id, x]));

  // -------- State --------
  const state = {
    user: null,
    money: STARTING_MONEY,
    grid: new Array(GRID_W * GRID_H).fill(null),  // each cell: null | { id }
    tick: 0,
    selected: null,   // catalog id currently selected to build
    bulldoze: false,  // whether bulldoze mode is on
  };

  // -------- Events --------
  const listeners = { change: [], log: [] };
  function on(ev, fn) { listeners[ev].push(fn); }
  function emit(ev, payload) { listeners[ev].forEach((fn) => fn(payload)); }
  function log(msg, tone = "") {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    emit("log", { ts, msg, tone });
  }

  // -------- Persistence --------
  function saveNow() {
    if (!state.user) return;
    Auth.writeSave(state.user, {
      money: state.money,
      grid: state.grid,
      tick: state.tick,
      savedAt: Date.now(),
    });
  }

  function loadFor(username) {
    state.user = username;
    const save = Auth.loadSave(username);
    if (save) {
      state.money = Number.isFinite(save.money) ? save.money : STARTING_MONEY;
      state.tick = save.tick || 0;
      // Validate grid — drop unknown ids so renaming/removing catalog entries is safe.
      const loaded = Array.isArray(save.grid) ? save.grid : [];
      state.grid = new Array(GRID_W * GRID_H).fill(null).map((_, i) => {
        const c = loaded[i];
        if (c && c.id && CATALOG_BY_ID[c.id]) return { id: c.id };
        return null;
      });
      log(`Welcome back, ${username}! Your park is loaded.`, "good");
    } else {
      state.money = STARTING_MONEY;
      state.grid = new Array(GRID_W * GRID_H).fill(null);
      state.tick = 0;
      log(`Welcome, ${username}! Start by placing a ride.`, "good");
    }
    state.selected = null;
    state.bulldoze = false;
    emit("change");
  }

  function resetPark() {
    state.money = STARTING_MONEY;
    state.grid = new Array(GRID_W * GRID_H).fill(null);
    state.tick = 0;
    state.selected = null;
    state.bulldoze = false;
    saveNow();
    log("Park reset. Fresh start!", "bad");
    emit("change");
  }

  // -------- Derived stats --------
  function computeStats() {
    let totalCapacity = 0;
    let happinessPoints = 0;
    let rideIncome = 0;
    let shopIncome = 0;
    let rideCount = 0;
    let shopCount = 0;
    let decorCount = 0;

    for (const cell of state.grid) {
      if (!cell) continue;
      const item = CATALOG_BY_ID[cell.id];
      if (!item) continue;
      happinessPoints += item.happiness || 0;
      if (item.category === "ride") {
        totalCapacity += item.capacity || 0;
        rideIncome += item.income || 0;
        rideCount++;
      } else if (item.category === "shop") {
        shopIncome += item.income || 0;
        shopCount++;
      } else {
        decorCount++;
      }
    }

    // Happiness: base 50, decor and variety push it up, big parks without decor drag it down.
    const rawHappiness = 50 + happinessPoints - totalCapacity * 0.3;
    const happiness = Math.max(0, Math.min(100, Math.round(rawHappiness)));
    const happinessMult = happiness / 100;

    const visitors = Math.floor(totalCapacity * happinessMult);
    // Shops scale with visitors (lots of customers = more revenue).
    const shopScale = rideCount === 0 ? 0 : Math.min(1.5, visitors / 10);
    const incomePerTick = Math.round(rideIncome * happinessMult + shopIncome * shopScale);

    const rating = Math.round(happiness + visitors * 0.2);

    return {
      happiness,
      visitors,
      totalCapacity,
      rideCount,
      shopCount,
      decorCount,
      incomePerTick,
      rating,
    };
  }

  // -------- Actions --------
  function select(id) {
    if (!CATALOG_BY_ID[id]) return;
    state.selected = id;
    state.bulldoze = false;
    emit("change");
  }

  function cancelTool() {
    state.selected = null;
    state.bulldoze = false;
    emit("change");
  }

  function toggleBulldoze() {
    state.bulldoze = !state.bulldoze;
    if (state.bulldoze) state.selected = null;
    emit("change");
  }

  function cellIndex(x, y) { return y * GRID_W + x; }

  function handleCellClick(index) {
    if (state.bulldoze) {
      const cell = state.grid[index];
      if (!cell) return;
      const item = CATALOG_BY_ID[cell.id];
      // Refund a small fraction so demolishing isn't too punishing.
      const refund = item ? Math.floor(item.cost * 0.4) : 0;
      state.grid[index] = null;
      state.money += refund;
      log(`Demolished ${item ? item.name : "building"} (refund $${refund}).`, "bad");
      emit("change");
      return;
    }

    if (!state.selected) {
      log("Select something from the sidebar first.", "");
      return;
    }
    if (state.grid[index]) {
      log("That cell is already occupied.", "bad");
      return;
    }
    const item = CATALOG_BY_ID[state.selected];
    if (!item) return;
    if (state.money < item.cost) {
      log(`Not enough money for ${item.name} ($${item.cost}).`, "bad");
      return;
    }
    state.money -= item.cost;
    state.grid[index] = { id: item.id };
    log(`Built ${item.name} for $${item.cost}.`, "good");
    emit("change");
  }

  // -------- Tick loop --------
  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => {
      state.tick++;
      const stats = computeStats();
      state.money += stats.incomePerTick;
      if (state.tick % AUTOSAVE_TICKS === 0) saveNow();
      emit("change");
    }, TICK_MS);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // -------- Accessors for UI --------
  function snapshot() {
    return {
      money: state.money,
      grid: state.grid,
      selected: state.selected,
      bulldoze: state.bulldoze,
      width: GRID_W,
      height: GRID_H,
      stats: computeStats(),
      catalog: window.CATALOG || [],
      catalogById: CATALOG_BY_ID,
    };
  }

  return {
    on,
    loadFor,
    resetPark,
    saveNow,
    start,
    stop,
    select,
    cancelTool,
    toggleBulldoze,
    handleCellClick,
    snapshot,
    log,
    GRID_W,
    GRID_H,
    TICK_MS,
    STARTING_MONEY,
  };
})();
