# Adding content to Theme Park Tycoon

All game content lives in a single file: **`catalog.js`**.

To add a new ride, shop, or decoration, append an object to the `window.CATALOG`
array in that file and refresh the page. No build step is required.

## Entry schema

```js
{
  id:          "unique_string_id",  // required, unique; used in save files
  name:        "Display Name",      // shown in the sidebar
  emoji:       "🎡",                 // shown on the grid and in the sidebar
  category:    "ride",              // "ride" | "shop" | "decoration"
  cost:        500,                 // build cost (money)
  income:      18,                  // money per tick (tick = 1 s by default)
  happiness:   8,                   // contribution to park happiness score
  capacity:    20,                  // (rides) max visitors it can host; 0 for shops/decor
  description: "short blurb"        // optional, used as a tooltip
}
```

## Tips

- `id` must be unique across the whole catalog. If you rename one, old save files
  that reference the old id will silently ignore it (the tile shows as empty).
- Use **a single emoji** for `emoji` — the game draws it directly on the grid.
- Keep numbers reasonable. A few starting ranges that feel balanced:
  - Rides: cost 150–2000, income 5–60, happiness 2–15
  - Shops: cost 100–500, income 3–15, happiness 1–4
  - Decorations: cost 20–300, income 0, happiness 1–6
- You can also tweak the global difficulty in `../js/game.js`
  (see the `TICK_MS`, `STARTING_MONEY`, and `VISITOR_BASE` constants).

## Example: adding a water ride

```js
{
  id: "log_flume",
  name: "Log Flume",
  emoji: "🛶",
  category: "ride",
  cost: 1300,
  income: 42,
  happiness: 13,
  capacity: 28,
  description: "Splashy fun on a hot day.",
},
```
