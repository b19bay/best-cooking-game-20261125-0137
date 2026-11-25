// LADLE RUSH — the kitchen world: chef movement, collision, station interactions.
// One file, one job: what happens when the chef touches a station.

import {
  CHEF_RADIUS, CHEF_SPEED, FLOOR, INGREDIENTS, MAX_CARRY, MAX_PLATE_ITEMS,
  PROCESS_STATION, RECIPES, STATIONS,
} from './config.js';
import {
  addPopup, burstParticles, isPlate, itemKey, makeItem, makePlate, showMessage,
} from './state.js';

export function createChef() {
  return { x: 640, y: 430, dir: 'down', carrying: [] };
}

export function createWorld() {
  return {
    chef: createChef(),
    // One processing slot per timed station: { item, done (seconds), total } or null.
    grillSlot: null,
    frySlot: null,
    potSlot: null,
    // Chop progress while the chef holds a choppable item at the board (0..1).
    chopProgress: 0,
    // Fridge menu: open when the chef browses the fridge, -1 = closed.
    fridgeOpen: false,
    fridgeIndex: 0,
  };
}

const FRIDGE_KINDS = ['lettuce', 'tomato', 'cheese', 'potato', 'pasta', 'bun', 'patty'];

export function fridgeKinds() {
  return FRIDGE_KINDS;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function nearestStation(chef) {
  let best = null;
  let bestDist = 78;
  for (const id of Object.keys(STATIONS)) {
    const s = STATIONS[id];
    const cx = Math.max(s.x, Math.min(chef.x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(chef.y, s.y + s.h));
    const dx = chef.x - cx;
    const dy = chef.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  return best;
}

export function moveChef(world, input, dt) {
  const chef = world.chef;
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (dx === 0 && dy === 0) return;
  const len = Math.sqrt(dx * dx + dy * dy);
  dx /= len;
  dy /= len;
  if (Math.abs(dx) > Math.abs(dy)) chef.dir = dx > 0 ? 'right' : 'left';
  else chef.dir = dy > 0 ? 'down' : 'up';
  const nx = chef.x + dx * CHEF_SPEED * dt;
  const ny = chef.y + dy * CHEF_SPEED * dt;
  const clampedX = Math.max(FLOOR.x + CHEF_RADIUS, Math.min(FLOOR.x + FLOOR.w - CHEF_RADIUS, nx));
  const clampedY = Math.max(FLOOR.y + CHEF_RADIUS, Math.min(FLOOR.y + FLOOR.h - CHEF_RADIUS, ny));
  // Counters block movement: try x then y so the chef slides along them.
  const blocked = (x, y) => {
    for (const id of Object.keys(STATIONS)) {
      const s = STATIONS[id];
      if (rectsOverlap(x - CHEF_RADIUS, y - CHEF_RADIUS, CHEF_RADIUS * 2, CHEF_RADIUS * 2, s.x, s.y, s.w, s.h)) return true;
    }
    return false;
  };
  if (!blocked(clampedX, chef.y)) chef.x = clampedX;
  if (!blocked(chef.x, clampedY)) chef.y = clampedY;
}

function freeHands(chef) {
  return MAX_CARRY - chef.carrying.length;
}

function heldIngredients(chef) {
  return chef.carrying.filter((t) => !isPlate(t));
}

function carriedPlate(chef) {
  return chef.carrying.find((t) => isPlate(t)) || null;
}

function takeItem(chef, item) {
  if (freeHands(chef) <= 0) return false;
  chef.carrying.push(item);
  return true;
}

function plateMatchesRecipe(plate) {
  const keys = plate.items.map(itemKey).sort();
  for (const id of Object.keys(RECIPES)) {
    const needs = RECIPES[id].needs.slice().sort();
    if (keys.length === needs.length && keys.every((k, i) => k === needs[i])) return id;
  }
  return null;
}

function servePlate(shift, world, plate) {
  const recipeId = plateMatchesRecipe(plate);
  if (!recipeId) return false;
  const ticketIndex = shift.tickets.findIndex((t) => t.recipeId === recipeId);
  if (ticketIndex < 0) return false;
  const ticket = shift.tickets[ticketIndex];
  shift.tickets.splice(ticketIndex, 1);
  const timeBonus = Math.round((ticket.left / ticket.total) * 50);
  const points = RECIPES[recipeId].base + timeBonus;
  shift.combo += 1;
  shift.bestCombo = Math.max(shift.bestCombo, shift.combo);
  const total = points * shift.combo;
  shift.score += total;
  shift.served += 1;
  const chef = world.chef;
  addPopup(shift, chef.x, chef.y - 40, '+' + total, '#2e7d32');
  burstParticles(shift, chef.x, chef.y - 20, '#f2c230', 14);
  return true;
}

function processStepFor(item) {
  // Returns the next processing step for an item, or null when it is ready.
  const def = INGREDIENTS[item.kind];
  if (item.state === 'raw' && def.process === 'chop') return 'chop';
  if (item.state === 'raw' && def.process === 'chop-fry') return 'chop';
  if (item.state === 'chopped' && def.process === 'chop-fry') return 'fry';
  if (item.state === 'raw' && def.process === 'grill') return 'grill';
  if (item.state === 'raw' && def.process === 'boil') return 'boil';
  return null;
}

function stationSlot(world, stationId) {
  if (stationId === 'grill') return 'grillSlot';
  if (stationId === 'fry') return 'frySlot';
  if (stationId === 'pot') return 'potSlot';
  return null;
}

function slotSeconds(item, stationId) {
  const def = INGREDIENTS[item.kind];
  if (stationId === 'grill') return def.grillSeconds;
  if (stationId === 'fry') return def.frySeconds;
  if (stationId === 'pot') return def.boilSeconds;
  return 0;
}

function finishedState(item, stationId) {
  if (stationId === 'grill') return 'grilled';
  if (stationId === 'fry') return 'fried';
  if (stationId === 'pot') return 'boiled';
  return item.state;
}

function interactWithStation(shift, world, station) {
  const chef = world.chef;
  const sfx = world.sfx;
  switch (station.id) {
    case 'fridge': {
      world.fridgeOpen = !world.fridgeOpen;
      if (world.fridgeOpen) sfx('open');
      return;
    }
    case 'chop': {
      const held = heldIngredients(chef).find((it) => processStepFor(it) === 'chop');
      if (!held) {
        showMessage(shift, 'Nothing to chop — bring lettuce, tomato or potato.', 1.6);
        sfx('buzz');
        return;
      }
      return; // chopping advances while E is held (see updateWorld)
    }
    case 'grill':
    case 'fry':
    case 'pot': {
      const key = stationSlot(world, station.id);
      const slot = world[key];
      if (slot) {
        if (slot.done < slot.total) {
          showMessage(shift, 'Still cooking — wait for the bar to fill.', 1.4);
          return;
        }
        if (freeHands(chef) <= 0) {
          showMessage(shift, 'Hands full!', 1.2);
          return;
        }
        const cookedState = slot.item.state === 'burnt' ? 'burnt' : finishedState(slot.item, station.id);
        const item = makeItem(slot.item.kind, cookedState);
        takeItem(chef, item);
        world[key] = null;
        sfx('take');
        return;
      }
      const held = heldIngredients(chef).find((it) => {
        const s = processStepFor(it);
        return s && PROCESS_STATION[s] === station.id;
      });
      if (!held) {
        const any = heldIngredients(chef)[0];
        if (any && processStepFor(any) === 'chop') showMessage(shift, 'Chop it at the board first.', 1.6);
        else showMessage(shift, 'Bring something that cooks here.', 1.4);
        sfx('buzz');
        return;
      }
      chef.carrying = chef.carrying.filter((t) => t !== held);
      world[key] = { item: held, done: 0, total: slotSeconds(held, station.id) };
      sfx('place');
      return;
    }
    case 'plates': {
      const plate = carriedPlate(chef);
      const held = heldIngredients(chef);
      if (plate && held.length > 0) {
        // Transfer every held ingredient onto the carried plate.
        if (plate.items.length + held.length > MAX_PLATE_ITEMS) {
          showMessage(shift, 'The plate is full.', 1.4);
          sfx('buzz');
          return;
        }
        for (const item of held) plate.items.push(item);
        chef.carrying = chef.carrying.filter((t) => isPlate(t));
        sfx('plate');
        burstParticles(shift, chef.x, chef.y - 20, '#f2c230', 6);
        return;
      }
      if (!plate && freeHands(chef) > 0) {
        takeItem(chef, makePlate());
        sfx('take');
        return;
      }
      showMessage(shift, 'Hands full — serve or trash something first.', 1.4);
      return;
    }
    case 'trash': {
      if (chef.carrying.length === 0) {
        showMessage(shift, 'Nothing to throw away.', 1.2);
        return;
      }
      chef.carrying = [];
      world.chopProgress = 0;
      sfx('trash');
      return;
    }
    case 'serve': {
      const plate = carriedPlate(chef);
      if (!plate) {
        showMessage(shift, 'Bring a finished plate to serve.', 1.6);
        return;
      }
      if (plate.items.length === 0) {
        showMessage(shift, 'The plate is empty.', 1.4);
        sfx('buzz');
        return;
      }
      if (servePlate(shift, world, plate)) {
        chef.carrying = chef.carrying.filter((t) => !isPlate(t));
        sfx('serve');
        showMessage(shift, 'Served! +' + shift.combo + 'x combo', 1.6);
      } else {
        showMessage(shift, 'No ticket needs this dish yet.', 1.8);
        sfx('buzz');
      }
      return;
    }
    default:
      return;
  }
}

function takeFromFridge(shift, world, index) {
  const chef = world.chef;
  if (freeHands(chef) <= 0) {
    showMessage(shift, 'Hands full!', 1.2);
    world.sfx('buzz');
    return;
  }
  const kind = FRIDGE_KINDS[index];
  takeItem(chef, makeItem(kind, 'raw'));
  world.sfx('take');
  world.fridgeOpen = false;
}

export function updateWorld(shift, world, input, dt) {
  const chef = world.chef;
  moveChef(world, input, dt);

  // Timed stations advance; left too long past done, the item burns.
  for (const stationId of ['grill', 'fry', 'pot']) {
    const key = stationSlot(world, stationId);
    const slot = world[key];
    if (!slot) continue;
    slot.done += dt;
    if (slot.done > slot.total + 6 && slot.item.state !== 'burnt') {
      slot.item = makeItem(slot.item.kind, 'burnt');
      showMessage(shift, 'It burned! Trash it.', 2);
      world.sfx('buzz');
    }
  }

  // Chopping advances only while E is held at the board with a choppable item.
  const station = nearestStation(chef);
  if (station && station.id === 'chop' && input.interactHeld) {
    const held = heldIngredients(chef).find((it) => processStepFor(it) === 'chop');
    if (held) {
      world.chopProgress += dt / INGREDIENTS[held.kind].chopSeconds;
      if (world.chopProgress >= 1) {
        held.state = 'chopped';
        world.chopProgress = 0;
        burstParticles(shift, chef.x, chef.y - 24, INGREDIENTS[held.kind].color, 10);
        world.sfx('chop');
      }
    }
  } else if (!input.interactHeld) {
    world.chopProgress = Math.max(0, world.chopProgress - dt * 0.5);
  }

  // Fridge menu: number keys or a click pick an ingredient.
  if (world.fridgeOpen) {
    if (input.digitPressed >= 1 && input.digitPressed <= FRIDGE_KINDS.length) {
      takeFromFridge(shift, world, input.digitPressed - 1);
    }
    if (input.mousePressed) {
      const picked = fridgeMenuHit(input.mouseX, input.mouseY);
      if (picked >= 0) takeFromFridge(shift, world, picked);
      else world.fridgeOpen = false;
    }
    if (input.interactPressed) world.fridgeOpen = false;
    return;
  }

  // Mouse click near a station interacts with it; E/Space does the same.
  if (input.mousePressed) {
    const clicked = nearestStation({ x: input.mouseX, y: input.mouseY });
    if (clicked) {
      const dx = chef.x - Math.max(clicked.x, Math.min(chef.x, clicked.x + clicked.w));
      const dy = chef.y - Math.max(clicked.y, Math.min(chef.y, clicked.y + clicked.h));
      if (Math.sqrt(dx * dx + dy * dy) < 78) interactWithStation(shift, world, clicked);
    }
    return;
  }
  if (input.interactPressed && station) interactWithStation(shift, world, station);
}

// Fridge menu hit-test: menu row of 7 buttons at the bottom of the screen.
export function fridgeMenuHit(mx, my) {
  const bw = 96;
  const bh = 64;
  const gap = 12;
  const total = FRIDGE_KINDS.length * bw + (FRIDGE_KINDS.length - 1) * gap;
  const x0 = (1280 - total) / 2;
  const y0 = 640;
  if (my < y0 || my > y0 + bh) return -1;
  for (let i = 0; i < FRIDGE_KINDS.length; i++) {
    const x = x0 + i * (bw + gap);
    if (mx >= x && mx <= x + bw) return i;
  }
  return -1;
}

export function stationOf(world, id) {
  return STATIONS[id];
}

export function describeCarrying(chef) {
  return chef.carrying.map((t) => {
    if (isPlate(t)) return 'plate[' + t.items.map(itemKey).join('+') + ']';
    return itemKey(t);
  });
}
