// LADLE RUSH — boot + fixed-timestep loop + state machine (title / play / over).
// Reads ?shot= once at boot for frozen screenshot scenes; otherwise plays live.

import { CANVAS_H, CANVAS_W } from './config.js';
import { createShift, spawnTicket, updateParticles, updatePopups, updateShiftTimers } from './state.js';
import { attachInput, createInput, endFrameInput } from './input.js';
import { createWorld, updateWorld } from './world.js';
import { drawScreen } from './render.js';
import { playSfx } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot') || '';

const input = createInput();
attachInput(input, canvas);

let shift = createShift(20261125);
let world = createWorld();
world.sfx = (name) => playSfx(name);

if (shotName) {
  applyShot(shift, world, shotName);
} else {
  spawnTicket(shift);
  spawnTicket(shift);
}

let last = performance.now();
let walking = false;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (shift.phase === 'title') {
    if (input.interactPressed || input.mousePressed) {
      shift.phase = 'play';
      shift.elapsed = 0;
      playSfx('open');
    }
  } else if (shift.phase === 'play' && !shift.frozen) {
    updateShiftTimers(shift, dt);
    if (shift.phase === 'play') {
      updateWorld(shift, world, input, dt);
      updateParticles(shift, dt);
      updatePopups(shift, dt);
      walking = input.up || input.down || input.left || input.right;
    }
  } else if (shift.phase === 'over') {
    if (input.restartPressed) {
      shift = createShift(20261125 + shift.served);
      world = createWorld();
      world.sfx = (name) => playSfx(name);
      spawnTicket(shift);
      spawnTicket(shift);
    }
  }

  drawScreen(ctx, shift, world, walking);
  endFrameInput(input);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
