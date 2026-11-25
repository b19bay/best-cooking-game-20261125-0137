// LADLE RUSH — synthesized sound effects (WebAudio oscillators, no audio files).
// The context is created on the first user gesture; every call before that is a
// silent no-op, so the game never crashes in a headless screenshot run.

let audioCtx = null;
let sizzleNodes = null;

export function ensureAudio() {
  if (audioCtx) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    audioCtx = new Ctor();
  } catch (err) {
    audioCtx = null;
  }
}

function tone(freq, duration, type, gainValue, slideTo) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(gainValue || 0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    // Sound is garnish; a failed beep never breaks the game.
  }
}

function noiseBurst(duration, gainValue) {
  if (!audioCtx) return;
  try {
    const len = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(gainValue || 0.08, audioCtx.currentTime);
    src.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
  } catch (err) {
    // Sound is garnish; a failed burst never breaks the game.
  }
}

export function playSfx(name) {
  ensureAudio();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  switch (name) {
    case 'chop':
      noiseBurst(0.08, 0.16);
      tone(180, 0.08, 'triangle', 0.14, 90);
      break;
    case 'take':
      tone(520, 0.07, 'sine', 0.1);
      break;
    case 'place':
      tone(340, 0.09, 'sine', 0.1, 260);
      break;
    case 'plate':
      tone(660, 0.06, 'sine', 0.1);
      tone(880, 0.09, 'sine', 0.1);
      break;
    case 'serve':
      tone(523, 0.1, 'sine', 0.12);
      setTimeout(() => tone(659, 0.1, 'sine', 0.12), 90);
      setTimeout(() => tone(784, 0.16, 'sine', 0.12), 180);
      break;
    case 'buzz':
      tone(140, 0.22, 'sawtooth', 0.08, 90);
      break;
    case 'trash':
      noiseBurst(0.12, 0.1);
      break;
    case 'open':
      tone(440, 0.06, 'sine', 0.08, 560);
      break;
    case 'sizzle':
      if (sizzleNodes) return;
      noiseBurst(0.5, 0.05);
      break;
    default:
      break;
  }
}
