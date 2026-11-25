// LADLE RUSH — frozen demo scenes for screenshots (?shot=cover|chop|fry|serve).
// Each scene sets an exact, deterministic state: tickets, chef position, carried
// items, station contents and timers. The game is paused in these scenes, so the
// render is stable frame after frame.

import { STATIONS } from './config.js';
import { makeItem, makePlate } from './state.js';

function setTickets(shift, list) {
  shift.tickets = list.map((t, i) => ({
    id: i + 1,
    recipeId: t.recipe,
    total: t.total,
    left: t.left,
  }));
}

function putOnStation(world, stationId, kind, itemState, done, total) {
  const key = stationId === 'grill' ? 'grillSlot' : stationId === 'fry' ? 'frySlot' : 'potSlot';
  world[key] = { item: makeItem(kind, itemState), done, total };
}

export function applyShot(shift, world, name) {
  shift.phase = 'play';
  shift.frozen = true;
  const chef = world.chef;
  if (name === 'cover') {
    // Mid-rush: two tickets, a Deluxe Burger mid-assembly, plate ready at the window.
    shift.timeLeft = 84;
    shift.elapsed = 96;
    shift.score = 640;
    shift.combo = 2;
    setTickets(shift, [
      { recipe: 'deluxe', total: 60, left: 41 },
      { recipe: 'pasta', total: 60, left: 18 },
    ]);
    chef.x = 1060;
    chef.y = 470;
    chef.dir = 'left';
    const plate = makePlate();
    plate.items.push(makeItem('bun', 'raw'));
    plate.items.push(makeItem('patty', 'grilled'));
    plate.items.push(makeItem('cheese', 'raw'));
    chef.carrying = [plate, makeItem('tomato', 'chopped')];
    putOnStation(world, 'grill', 'patty', 'raw', 2.5, 4);
    putOnStation(world, 'fry', 'potato', 'chopped', 3.1, 4);
  } else if (name === 'chop') {
    shift.timeLeft = 131;
    shift.elapsed = 49;
    shift.score = 250;
    shift.combo = 1;
    setTickets(shift, [{ recipe: 'salad', total: 75, left: 52 }]);
    chef.x = 313;
    chef.y = 300;
    chef.dir = 'up';
    chef.carrying = [makeItem('tomato', 'raw')];
    world.chopProgress = 0.6;
  } else if (name === 'fry') {
    shift.timeLeft = 97;
    shift.elapsed = 83;
    shift.score = 480;
    shift.combo = 0;
    setTickets(shift, [
      { recipe: 'fries', total: 60, left: 33 },
      { recipe: 'classic', total: 60, left: 47 },
    ]);
    chef.x = 700;
    chef.y = 320;
    chef.dir = 'down';
    chef.carrying = [makeItem('potato', 'fried')];
    putOnStation(world, 'fry', 'potato', 'chopped', 3.8, 4);
    putOnStation(world, 'grill', 'patty', 'raw', 1.2, 4);
    putOnStation(world, 'pot', 'pasta', 'raw', 4.4, 5);
  } else if (name === 'serve') {
    // Rush moment: a finished Classic Burger at the window, one ticket about to burn.
    shift.timeLeft = 42;
    shift.elapsed = 138;
    shift.score = 1120;
    shift.combo = 3;
    shift.hearts = 3;
    setTickets(shift, [{ recipe: 'classic', total: 50, left: 8 }]);
    chef.x = 1100;
    chef.y = 540;
    chef.dir = 'down';
    const plate = makePlate();
    plate.items.push(makeItem('bun', 'raw'));
    plate.items.push(makeItem('patty', 'grilled'));
    plate.items.push(makeItem('lettuce', 'chopped'));
    chef.carrying = [plate];
  } else {
    shift.frozen = false;
    shift.phase = 'title';
  }
}

export function shotNames() {
  return ['cover', 'chop', 'fry', 'serve'];
}

export function stationCenter(id) {
  const s = STATIONS[id];
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}
