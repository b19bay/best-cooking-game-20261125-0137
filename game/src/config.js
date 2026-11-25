// LADLE RUSH — data only: recipes, stations, timings, palette, sizes.
// No logic here; every other module imports these constants.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const MAX_TICKETS = 3;
export const MAX_CARRY = 2;
export const MAX_PLATE_ITEMS = 4;
export const CHEF_SPEED = 280;
export const CHEF_RADIUS = 18;

// Ramp marks: [shiftSecond, orderIntervalSec, ticketSeconds]
export const RAMP = [
  { at: 0, interval: 14, ticket: 75 },
  { at: 60, interval: 10, ticket: 60 },
  { at: 120, interval: 8, ticket: 50 },
];

// Ingredient kinds and how each is prepared. process: null = ready from the fridge.
export const INGREDIENTS = {
  lettuce: { name: 'Lettuce', process: 'chop', color: '#5da83c', chopSeconds: 0.9 },
  tomato: { name: 'Tomato', process: 'chop', color: '#d9382b', chopSeconds: 0.9 },
  cheese: { name: 'Cheese', process: null, color: '#f2c230' },
  potato: { name: 'Potato', process: 'chop-fry', color: '#d9a066', chopSeconds: 0.9, frySeconds: 4 },
  pasta: { name: 'Pasta', process: 'boil', color: '#f0d9a0', boilSeconds: 5 },
  bun: { name: 'Bun', process: null, color: '#e8a94e' },
  patty: { name: 'Patty', process: 'grill', color: '#7a4a21', grillSeconds: 4 },
};

// processStation maps a process step to the station that performs it.
export const PROCESS_STATION = {
  chop: 'chop',
  grill: 'grill',
  fry: 'fry',
  boil: 'pot',
};

// Recipes: required ingredient states. A plate matches a recipe when its contents
// are exactly these states (order does not matter).
export const RECIPES = {
  salad: {
    name: 'Garden Salad', base: 100,
    needs: ['lettuce:chopped', 'tomato:chopped'],
  },
  classic: {
    name: 'Classic Burger', base: 150,
    needs: ['bun:raw', 'patty:grilled', 'lettuce:chopped'],
  },
  cheese: {
    name: 'Cheese Burger', base: 160,
    needs: ['bun:raw', 'patty:grilled', 'cheese:raw'],
  },
  fries: {
    name: 'Fries Basket', base: 90,
    needs: ['potato:fried'],
  },
  pasta: {
    name: 'Tomato Pasta', base: 140,
    needs: ['pasta:boiled', 'tomato:chopped'],
  },
  deluxe: {
    name: 'Deluxe Burger', base: 200,
    needs: ['bun:raw', 'patty:grilled', 'cheese:raw', 'tomato:chopped'],
  },
};

export const RECIPE_IDS = ['salad', 'classic', 'cheese', 'fries', 'pasta', 'deluxe'];

// Kitchen layout. Stations are rectangles the chef walks around and interacts with
// from the floor side. y 152..720 is the kitchen; the ticket rail sits above it.
export const STATIONS = {
  fridge: { id: 'fridge', label: 'FRIDGE', x: 40, y: 176, w: 168, h: 76 },
  chop: { id: 'chop', label: 'CHOP', x: 228, y: 176, w: 168, h: 76 },
  grill: { id: 'grill', label: 'GRILL', x: 416, y: 176, w: 168, h: 76 },
  fry: { id: 'fry', label: 'FRYER', x: 604, y: 176, w: 168, h: 76 },
  pot: { id: 'pot', label: 'POT', x: 792, y: 176, w: 168, h: 76 },
  plates: { id: 'plates', label: 'PLATES', x: 980, y: 176, w: 180, h: 76 },
  trash: { id: 'trash', label: 'TRASH', x: 40, y: 596, w: 150, h: 72 },
  serve: { id: 'serve', label: 'SERVE', x: 960, y: 596, w: 280, h: 72 },
};

export const STATION_IDS = ['fridge', 'chop', 'grill', 'fry', 'pot', 'plates', 'trash', 'serve'];

// Floor bounds the chef can walk (between the two counter rows).
export const FLOOR = { x: 24, y: 268, w: 1232, h: 312 };

// Palette: warm kitchen.
export const PALETTE = {
  wall: '#f3e3c2',
  floorA: '#ecd9ac',
  floorB: '#d3b57e',
  counter: '#8a5a33',
  counterTop: '#b07a45',
  counterEdge: '#6e4525',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  cream: '#fff7e6',
  ink: '#2e2118',
  red: '#c0392b',
  green: '#5da83c',
  gold: '#f2c230',
  ticket: '#fffbe8',
  ticketEdge: '#d8c98f',
};
