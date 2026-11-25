// LADLE RUSH — all canvas drawing: kitchen, stations, chef, food, HUD, tickets,
// particles, popups, fridge menu, title and game-over screens. No logic here
// beyond what each thing looks like.

import {
  CANVAS_H, CANVAS_W, INGREDIENTS, PALETTE, RECIPES, STATIONS,
} from './config.js';
import { fridgeKinds } from './world.js';
import { isPlate } from './state.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, bold) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px system-ui, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawIngredientIcon(ctx, kind, itemState, x, y, size) {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'lettuce') {
    ctx.fillStyle = itemState === 'chopped' ? '#79c25a' : '#5da83c';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.62, r * 0.45, a, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = '#3f7d28';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (kind === 'tomato') {
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8f1f16';
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.3, r * 0.2, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5da83c';
    ctx.fillRect(-r * 0.12, -r - 2, r * 0.24, r * 0.4);
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r, -r * 0.5);
    ctx.lineTo(0, -r);
    ctx.lineTo(-r, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9a41f';
    ctx.beginPath();
    ctx.arc(-r * 0.3, 0, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'potato') {
    ctx.fillStyle = itemState === 'fried' ? '#f6c453' : '#d9a066';
    if (itemState === 'fried') {
      ctx.fillStyle = '#c0392b';
      roundRect(ctx, -r, -r * 0.4, r * 2, r * 1.3, 4);
      ctx.fill();
      ctx.fillStyle = '#f6c453';
      for (let i = -1; i <= 1; i++) ctx.fillRect(i * r * 0.5 - 3, -r * 1.1, 7, r * 1.1);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b07a45';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.arc(r * 0.35, r * 0.2, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'pasta') {
    ctx.strokeStyle = itemState === 'boiled' ? '#f0d9a0' : '#e0c078';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, (i - 1) * r * 0.5, r * 0.8, 0.3, Math.PI * 2 - 0.6);
      ctx.stroke();
    }
  } else if (kind === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.9, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a2e';
    ctx.fillRect(-r * 0.9, r * 0.1, r * 1.8, r * 0.3);
    ctx.fillStyle = '#fff3d0';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.4, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.55, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'patty') {
    ctx.fillStyle = itemState === 'burnt' ? '#1d1d1d' : itemState === 'grilled' ? '#6b3d18' : '#9c5a30';
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4);
    ctx.fill();
    if (itemState === 'grilled') {
      ctx.strokeStyle = '#4a2a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.3);
      ctx.lineTo(r * 0.6, -r * 0.3);
      ctx.moveTo(-r * 0.6, r * 0.1);
      ctx.lineTo(r * 0.6, r * 0.1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPlateIcon(ctx, plate, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f4f4f4';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.62, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9ced6';
  ctx.lineWidth = 2;
  ctx.stroke();
  let dy = -size * 0.16;
  for (const item of plate.items) {
    drawIngredientIcon(ctx, item.kind, item.state, 0, dy, size * 0.52);
    dy += size * 0.16;
  }
  ctx.restore();
}

function drawCarried(ctx, chef) {
  let y = chef.y - 34;
  for (const thing of chef.carrying) {
    if (isPlate(thing)) drawPlateIcon(ctx, thing, chef.x, y, 30);
    else drawIngredientIcon(ctx, thing.kind, thing.state, chef.x, y, 26);
    y -= 26;
  }
}

function drawChef(ctx, chef, walking) {
  ctx.save();
  ctx.translate(chef.x, chef.y);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const bob = walking ? Math.sin(Date.now() / 90) * 2 : 0;
  // Body (apron).
  ctx.fillStyle = '#fff7e6';
  roundRect(ctx, -13, -6 + bob, 26, 24, 8);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-13, 8 + bob, 26, 4);
  // Head + toque.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(0, -14 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-7, -22 + bob, 7, 0, Math.PI * 2);
  ctx.arc(0, -25 + bob, 8, 0, Math.PI * 2);
  ctx.arc(7, -22 + bob, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11, -24 + bob, 22, 5);
  // Eyes look in the walking direction.
  const ex = chef.dir === 'left' ? -3 : chef.dir === 'right' ? 3 : 0;
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.arc(-4 + ex, -14 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(4 + ex, -14 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStation(ctx, station, world) {
  const s = station;
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, s.x + 4, s.y + 4, s.w - 8, 18, 6);
  ctx.fill();
  // Label rides on the top strip so it never collides with the station's
  // contents (plates stack, bin box, pick-up box, cooking bars).
  text(ctx, s.label, s.x + s.w / 2, s.y + 13, 14, '#fff7e6', 'center', true);
  // Station contents: ingredient piles, cooking slots, plates.
  if (s.id === 'fridge') {
    drawIngredientIcon(ctx, 'lettuce', 'raw', s.x + 34, s.y + 42, 26);
    drawIngredientIcon(ctx, 'tomato', 'raw', s.x + 84, s.y + 42, 26);
    drawIngredientIcon(ctx, 'cheese', 'raw', s.x + 134, s.y + 42, 26);
  } else if (s.id === 'chop') {
    drawIngredientIcon(ctx, 'lettuce', 'chopped', s.x + 40, s.y + 44, 24);
    drawIngredientIcon(ctx, 'tomato', 'chopped', s.x + 84, s.y + 44, 24);
    drawIngredientIcon(ctx, 'potato', 'chopped', s.x + 128, s.y + 44, 24);
    if (world.chopProgress > 0) {
      ctx.strokeStyle = '#f2c230';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + 42, 26, -Math.PI / 2, -Math.PI / 2 + world.chopProgress * Math.PI * 2);
      ctx.stroke();
    }
  } else if (s.id === 'grill' || s.id === 'fry' || s.id === 'pot') {
    const key = s.id === 'grill' ? 'grillSlot' : s.id === 'fry' ? 'frySlot' : 'potSlot';
    const slot = world[key];
    ctx.fillStyle = '#3a3a3a';
    roundRect(ctx, s.x + 18, s.y + 30, s.w - 36, 26, 6);
    ctx.fill();
    if (slot) {
      const frac = Math.min(1, slot.done / slot.total);
      ctx.fillStyle = slot.item.state === 'burnt' ? '#1d1d1d' : '#e07840';
      roundRect(ctx, s.x + 22, s.y + 34, (s.w - 44) * frac, 18, 4);
      ctx.fill();
      drawIngredientIcon(ctx, slot.item.kind, slot.item.state, s.x + s.w / 2, s.y + 46, 20);
      if (slot.done >= slot.total) text(ctx, 'READY', s.x + s.w / 2, s.y + 62, 12, '#7dff8a', 'center', true);
      else if (slot.item.state === 'burnt') text(ctx, 'BURNT!', s.x + s.w / 2, s.y + 62, 12, '#ff6b5e', 'center', true);
    } else {
      ctx.fillStyle = '#888';
      text(ctx, 'empty', s.x + s.w / 2, s.y + 44, 12, '#aaaaaa', 'center');
    }
  } else if (s.id === 'plates') {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#f4f4f4';
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 38 + i * 7, 34, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9ced6';
      ctx.stroke();
    }
  } else if (s.id === 'serve') {
    ctx.fillStyle = '#7a4a21';
    roundRect(ctx, s.x + 14, s.y + 26, s.w - 28, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#f2c230';
    text(ctx, 'PICK UP', s.x + s.w / 2, s.y + 42, 13, '#2e2118', 'center', true);
  } else if (s.id === 'trash') {
    ctx.fillStyle = '#555';
    roundRect(ctx, s.x + 30, s.y + 28, s.w - 60, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#888';
    text(ctx, 'BIN', s.x + s.w / 2, s.y + 44, 13, '#dddddd', 'center', true);
  }
}

function drawTicket(ctx, ticket, x, y, w, h) {
  const recipe = RECIPES[ticket.recipeId];
  ctx.fillStyle = PALETTE.ticket;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  const frac = Math.max(0, ticket.left / ticket.total);
  ctx.fillStyle = frac < 0.2 ? '#c0392b' : '#e8a94e';
  roundRect(ctx, x + 8, y + h - 12, (w - 16) * frac, 6, 3);
  ctx.fill();
  text(ctx, recipe.name, x + 12, y + 16, 15, PALETTE.ink, 'left', true);
  text(ctx, Math.ceil(ticket.left) + 's', x + w - 12, y + 16, 15, frac < 0.2 ? '#c0392b' : '#7a4a21', 'right', true);
  let ix = x + 26;
  for (const need of recipe.needs) {
    const [kind, itemState] = need.split(':');
    drawIngredientIcon(ctx, kind, itemState, ix, y + 46, 30);
    ix += 40;
  }
  text(ctx, recipe.base + ' pts', x + w - 12, y + 46, 12, '#7a4a21', 'right');
}

function drawHud(ctx, shift) {
  // Top bar.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_W, 56);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(0, 0, CANVAS_W, 6);
  // Score.
  text(ctx, 'SCORE ' + shift.score, 20, 32, 22, PALETTE.ink, 'left', true);
  if (shift.combo > 1) text(ctx, 'COMBO x' + shift.combo, 200, 32, 18, '#c0392b', 'left', true);
  // Shift timer (center, big, pulses red under 10s).
  const mm = Math.floor(shift.timeLeft / 60);
  const ss = String(Math.floor(shift.timeLeft % 60)).padStart(2, '0');
  const urgent = shift.timeLeft <= 10 && shift.phase === 'play';
  const timerColor = urgent ? '#c0392b' : PALETTE.ink;
  const timerSize = urgent ? 30 : 26;
  text(ctx, mm + ':' + ss, CANVAS_W / 2, 32, timerSize, timerColor, 'center', true);
  text(ctx, 'SHIFT', CANVAS_W / 2, 12, 11, '#7a4a21', 'center', true);
  // Hearts.
  let hx = CANVAS_W - 24;
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < shift.hearts ? '#c0392b' : '#d8c9b0';
    ctx.beginPath();
    ctx.arc(hx - 8, 28, 8, 0, Math.PI * 2);
    ctx.arc(hx + 8, 28, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 15, 30);
    ctx.lineTo(hx + 15, 30);
    ctx.lineTo(hx, 46);
    ctx.closePath();
    ctx.fill();
    hx -= 44;
  }
  // Ticket rail.
  const railY = 62;
  const railH = 86;
  for (let i = 0; i < shift.tickets.length; i++) {
    drawTicket(ctx, shift.tickets[i], 16 + i * 316, railY, 300, railH);
  }
  if (shift.tickets.length === 0 && shift.phase === 'play') {
    text(ctx, 'No orders right now — the next ticket is coming…', 20, railY + 40, 16, '#7a4a21');
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Tile floor in the kitchen area.
  for (let y = 152; y < CANVAS_H; y += 48) {
    for (let x = 0; x < CANVAS_W; x += 48) {
      ctx.fillStyle = ((x + y) / 48) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, 48, 48);
    }
  }
  // Red-checked awning strip above the back counter.
  for (let x = 0; x < CANVAS_W; x += 32) {
    ctx.fillStyle = (x / 32) % 2 === 0 ? '#c0392b' : '#fff7e6';
    ctx.fillRect(x, 152, 32, 16);
  }
}

function drawFridgeMenu(ctx, world) {
  if (!world.fridgeOpen) return;
  const kinds = fridgeKinds();
  const bw = 96;
  const bh = 64;
  const gap = 12;
  const total = kinds.length * bw + (kinds.length - 1) * gap;
  const x0 = (CANVAS_W - total) / 2;
  const y0 = 640;
  ctx.fillStyle = 'rgba(46,33,24,0.85)';
  roundRect(ctx, x0 - 16, y0 - 34, total + 32, bh + 48, 10);
  ctx.fill();
  text(ctx, 'Pick an ingredient — click or press 1-7', CANVAS_W / 2, y0 - 16, 14, '#fff7e6', 'center', true);
  for (let i = 0; i < kinds.length; i++) {
    const x = x0 + i * (bw + gap);
    ctx.fillStyle = '#fff7e6';
    roundRect(ctx, x, y0, bw, bh, 8);
    ctx.fill();
    drawIngredientIcon(ctx, kinds[i], 'raw', x + bw / 2, y0 + 24, 30);
    text(ctx, (i + 1) + ' ' + INGREDIENTS[kinds[i]].name, x + bw / 2, y0 + 52, 11, PALETTE.ink, 'center', true);
  }
}

function drawParticles(ctx, shift) {
  for (const p of shift.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx, shift) {
  for (const popup of shift.popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, popup.life));
    text(ctx, popup.text, popup.x, popup.y, 20, popup.color, 'center', true);
  }
  ctx.globalAlpha = 1;
}

export function drawGame(ctx, shift, world, walking) {
  drawFloor(ctx);
  for (const id of Object.keys(STATIONS)) drawStation(ctx, STATIONS[id], world);
  drawChef(ctx, world.chef, walking);
  drawCarried(ctx, world.chef);
  drawParticles(ctx, shift);
  drawPopups(ctx, shift);
  drawHud(ctx, shift);
  drawFridgeMenu(ctx, world);
  if (shift.message && shift.elapsed < shift.messageUntil) {
    ctx.fillStyle = 'rgba(46,33,24,0.9)';
    const w = ctx.measureText(shift.message).width + 32;
    roundRect(ctx, (CANVAS_W - w) / 2, 560, w, 34, 8);
    ctx.fill();
    text(ctx, shift.message, CANVAS_W / 2, 578, 15, '#fff7e6', 'center');
  }
}

function drawTitle(ctx, shift) {
  ctx.fillStyle = 'rgba(46,33,24,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'LADLE RUSH', CANVAS_W / 2, 190, 72, '#f2c230', 'center', true);
  text(ctx, 'One chef. Six recipes. A 180-second dinner rush.', CANVAS_W / 2, 250, 22, '#fff7e6', 'center');
  text(ctx, 'Chop, grill, plate and serve before the tickets burn.', CANVAS_W / 2, 282, 18, '#e8d3a8', 'center');
  const lines = [
    'Move: WASD or arrow keys — Interact: E, Space, or click a station',
    'Fridge: pick ingredients (1-7) — Chop: hold E — Grill / Fry / Pot: timed bars',
    'Plates: take a plate, add ingredients at PLATES, serve at SERVE',
    'Serve on time for a combo. Three burned tickets end the shift.',
  ];
  let y = 350;
  for (const line of lines) {
    text(ctx, line, CANVAS_W / 2, y, 16, '#fff7e6', 'center');
    y += 30;
  }
  text(ctx, 'Press E or click to start cooking', CANVAS_W / 2, 520, 20, '#f2c230', 'center', true);
}

function drawGameOver(ctx, shift) {
  ctx.fillStyle = 'rgba(46,33,24,0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'SHIFT OVER', CANVAS_W / 2, 190, 56, '#f2c230', 'center', true);
  text(ctx, shift.overReason, CANVAS_W / 2, 250, 18, '#fff7e6', 'center');
  text(ctx, 'Score: ' + shift.score, CANVAS_W / 2, 320, 28, '#fff7e6', 'center', true);
  text(ctx, 'Dishes served: ' + shift.served + '    Best combo: x' + shift.bestCombo + '    Tickets lost: ' + shift.lost, CANVAS_W / 2, 370, 18, '#e8d3a8', 'center');
  text(ctx, 'Seed: ' + shift.seed, CANVAS_W / 2, 410, 14, '#c9b48a', 'center');
  text(ctx, 'Press R to cook another shift', CANVAS_W / 2, 480, 20, '#f2c230', 'center', true);
}

export function drawScreen(ctx, shift, world, walking) {
  drawGame(ctx, shift, world, walking);
  if (shift.phase === 'title') drawTitle(ctx, shift);
  if (shift.phase === 'over') drawGameOver(ctx, shift);
}
