// Theme Park Tycoon content catalog.
//
// Add new rides / shops / decorations by appending entries to this list.
// Each entry's shape:
//
//   {
//     id:        "unique_string_id",    // required, unique, used in save files
//     name:      "Display Name",        // shown in the UI
//     emoji:     "🎡",                   // shown on the grid and in the menu
//     category:  "ride" | "shop" | "decoration",
//     cost:      number,                // money to build
//     income:    number,                // money per tick (see Game.TICK_MS)
//     happiness: number,                // contribution to park happiness
//     capacity:  number,                // (rides only) max visitors it can host
//     description: "short blurb"        // optional, shown as tooltip
//   }
//
// After editing, just refresh the page — new items show up automatically.

window.CATALOG = [
  // ---------------- Rides ----------------
  {
    id: "carousel",
    name: "Carousel",
    emoji: "🎠",
    category: "ride",
    cost: 200,
    income: 6,
    happiness: 3,
    capacity: 8,
    description: "A gentle classic. Great for young guests.",
  },
  {
    id: "ferris_wheel",
    name: "Ferris Wheel",
    emoji: "🎡",
    category: "ride",
    cost: 600,
    income: 18,
    happiness: 8,
    capacity: 20,
    description: "A beautiful view from the top.",
  },
  {
    id: "roller_coaster",
    name: "Roller Coaster",
    emoji: "🎢",
    category: "ride",
    cost: 1500,
    income: 55,
    happiness: 15,
    capacity: 40,
    description: "Fast, loud, and a crowd-pleaser.",
  },
  {
    id: "bumper_cars",
    name: "Bumper Cars",
    emoji: "🚗",
    category: "ride",
    cost: 450,
    income: 14,
    happiness: 6,
    capacity: 12,
    description: "Controlled chaos.",
  },
  {
    id: "haunted_house",
    name: "Haunted House",
    emoji: "🏚️",
    category: "ride",
    cost: 900,
    income: 28,
    happiness: 10,
    capacity: 18,
    description: "Spooky fun year-round.",
  },
  {
    id: "pirate_ship",
    name: "Pirate Ship",
    emoji: "🚢",
    category: "ride",
    cost: 1100,
    income: 38,
    happiness: 12,
    capacity: 24,
    description: "Swing back and forth into the sky.",
  },

  // ---------------- Shops ----------------
  {
    id: "ice_cream",
    name: "Ice Cream Stand",
    emoji: "🍦",
    category: "shop",
    cost: 150,
    income: 5,
    happiness: 2,
    capacity: 0,
    description: "Sweet treats keep guests cool.",
  },
  {
    id: "popcorn",
    name: "Popcorn Cart",
    emoji: "🍿",
    category: "shop",
    cost: 120,
    income: 4,
    happiness: 2,
    capacity: 0,
    description: "Buttery goodness.",
  },
  {
    id: "burger",
    name: "Burger Stand",
    emoji: "🍔",
    category: "shop",
    cost: 300,
    income: 10,
    happiness: 3,
    capacity: 0,
    description: "Fuel up the guests.",
  },
  {
    id: "pizza",
    name: "Pizza Parlor",
    emoji: "🍕",
    category: "shop",
    cost: 400,
    income: 14,
    happiness: 4,
    capacity: 0,
    description: "Great slices, happy guests.",
  },
  {
    id: "souvenir",
    name: "Souvenir Shop",
    emoji: "🎁",
    category: "shop",
    cost: 350,
    income: 11,
    happiness: 3,
    capacity: 0,
    description: "Memories sold here.",
  },

  // ---------------- Decorations ----------------
  {
    id: "tree",
    name: "Tree",
    emoji: "🌳",
    category: "decoration",
    cost: 40,
    income: 0,
    happiness: 2,
    capacity: 0,
    description: "A bit of shade goes a long way.",
  },
  {
    id: "flowers",
    name: "Flowers",
    emoji: "🌷",
    category: "decoration",
    cost: 25,
    income: 0,
    happiness: 1,
    capacity: 0,
    description: "Pretty and cheap.",
  },
  {
    id: "fountain",
    name: "Fountain",
    emoji: "⛲",
    category: "decoration",
    cost: 250,
    income: 0,
    happiness: 6,
    capacity: 0,
    description: "A focal point for the park.",
  },
  {
    id: "bench",
    name: "Bench",
    emoji: "🪑",
    category: "decoration",
    cost: 30,
    income: 0,
    happiness: 1,
    capacity: 0,
    description: "Tired guests appreciate a seat.",
  },
  {
    id: "lamp",
    name: "Lamp Post",
    emoji: "🏮",
    category: "decoration",
    cost: 60,
    income: 0,
    happiness: 2,
    capacity: 0,
    description: "Keeps the park glowing.",
  },
];
