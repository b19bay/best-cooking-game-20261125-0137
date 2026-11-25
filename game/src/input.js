// LADLE RUSH — keyboard + mouse input. Edge-triggered actions: a key press fires
// once (interact), while movement keys are held state.

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    interactHeld: false,
    interactPressed: false,
    digitPressed: -1,
    restartPressed: false,
    mouseX: -1,
    mouseY: -1,
    mousePressed: false,
    anyKeyPressed: false,
  };
}

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyE: 'interact', Space: 'interact',
  KeyR: 'restart',
};

export function attachInput(input, canvas) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const action = KEY_MAP[event.code];
    if (action === 'interact') {
      input.interactHeld = true;
      input.interactPressed = true;
      input.anyKeyPressed = true;
      event.preventDefault();
    } else if (action === 'restart') {
      input.restartPressed = true;
      input.anyKeyPressed = true;
    } else if (action) {
      input[action] = true;
      input.anyKeyPressed = true;
      event.preventDefault();
    } else if (event.code >= 'Digit1' && event.code <= 'Digit7') {
      input.digitPressed = Number(event.code.slice(5));
      input.anyKeyPressed = true;
    }
  });
  window.addEventListener('keyup', (event) => {
    const action = KEY_MAP[event.code];
    if (action === 'interact') input.interactHeld = false;
    else if (action) input[action] = false;
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    input.mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    input.mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
    input.mousePressed = true;
    input.anyKeyPressed = true;
    event.preventDefault();
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}

export function endFrameInput(input) {
  input.interactPressed = false;
  input.digitPressed = -1;
  input.restartPressed = false;
  input.mousePressed = false;
  input.anyKeyPressed = false;
}
