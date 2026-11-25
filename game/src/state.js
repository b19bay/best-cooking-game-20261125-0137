// LADLE RUSH — shift state: tickets, score, hearts, combo, timers, order spawning.
// Pure state transitions; rendering lives in render.js, movement in world.js.

import { MAX_HEARTS, MAX_TICKETS, RAMP, RECIPE_IDS, SHIFT_SECONDS } from './config.js';
import { makeRng, pickFrom } from './rng.js';

export function makeItem(kind, itemState) {
  return { kind, state: itemState };
}

export function itemKey(item) {
  return item.kind + ':' + item.state;
}

export function makePlate() {
  return { plate: true, items: [] };
}

export function isPlate(thing) {
  return thing !== null && typeof thing === 'object' && thing.plate === true;
}

export function createShift(seed) {
  return {
    seed,
    rng: makeRng(seed),
    phase: 'title', // title | play | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    hearts: MAX_HEARTS,
    tickets: [],
    nextTicketIn: 2,
    ticketSeq: 0,
    message: '',
    messageUntil: 0,
    popups: [],
    particles: [],
    overReason: '',
  };
}

export function rampFor(elapsed) {
  let current = RAMP[0];
  for (const mark of RAMP) {
    if (elapsed >= mark.at) current = mark;
  }
  return current;
}

export function spawnTicket(shift) {
  if (shift.tickets.length >= MAX_TICKETS) return null;
  const ramp = rampFor(shift.elapsed);
  const recipeId = pickFrom(shift.rng, RECIPE_IDS);
  shift.ticketSeq += 1;
  const ticket = {
    id: shift.ticketSeq,
    recipeId,
    total: ramp.ticket,
    left: ramp.ticket,
  };
  shift.tickets.push(ticket);
  return ticket;
}

export function updateShiftTimers(shift, dt) {
  shift.elapsed += dt;
  shift.timeLeft = Math.max(0, SHIFT_SECONDS - shift.elapsed);
  shift.nextTicketIn -= dt;
  if (shift.nextTicketIn <= 0) {
    spawnTicket(shift);
    shift.nextTicketIn = rampFor(shift.elapsed).interval;
  }
  for (const ticket of shift.tickets) ticket.left -= dt;
  const expired = shift.tickets.filter((t) => t.left <= 0);
  for (const ticket of expired) {
    shift.tickets = shift.tickets.filter((t) => t.id !== ticket.id);
    shift.hearts -= 1;
    shift.lost += 1;
    shift.combo = 0;
    showMessage(shift, 'Ticket expired! -1 heart', 2);
  }
  if (shift.hearts <= 0 && shift.phase === 'play') {
    shift.phase = 'over';
    shift.overReason = 'Three tickets burned. The dinner rush wins this time.';
  }
  if (shift.timeLeft <= 0 && shift.phase === 'play') {
    shift.phase = 'over';
    shift.overReason = 'Shift over! The kitchen closes with the last ticket.';
  }
}

export function showMessage(shift, text, seconds) {
  shift.message = text;
  shift.messageUntil = shift.elapsed + seconds;
}

export function addPopup(shift, x, y, text, color) {
  shift.popups.push({ x, y, text, color, life: 1.2 });
}

export function updatePopups(shift, dt) {
  for (const popup of shift.popups) {
    popup.y -= 34 * dt;
    popup.life -= dt;
  }
  shift.popups = shift.popups.filter((p) => p.life > 0);
}

export function updateParticles(shift, dt) {
  for (const p of shift.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
    p.life -= dt;
  }
  shift.particles = shift.particles.filter((p) => p.life > 0);
}

export function burstParticles(shift, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = shift.rng() * Math.PI * 2;
    const speed = 60 + shift.rng() * 140;
    shift.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      life: 0.5 + shift.rng() * 0.4,
      color,
    });
  }
}
