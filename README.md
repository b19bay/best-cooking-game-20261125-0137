[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/b19bay/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/b19bay/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard)

# LADLE RUSH: one chef, 6 recipes, 180-second dinner rush — chop, grill, plate and serve before the tickets burn

A complete cooking game that runs offline in a desktop browser from static files.
You are the only chef on shift. Tickets land on the order board; fetch ingredients
from the fridge, chop them, grill, fry or boil them, build each dish on a plate,
and serve it at the window before its ticket burns. Three burned tickets end the
shift — or the 180-second clock does.

## How to play

- Move: WASD or arrow keys. Interact: E, Space, or click a station.
- Fridge: pick an ingredient (click it, or press 1–7).
- Chop board: hold E to chop lettuce, tomato, or potato.
- Grill / Fryer / Pot: timed bars. Pick the food up when the bar fills — leave it
  too long and it burns.
- Plates: take a plate, add your ingredients to it at the PLATES counter, then
  serve the finished dish at SERVE.
- Trash: throw away anything burnt or wrong.

## Recipes

| Dish | Needs | Points |
|---|---|---|
| Garden Salad | chopped lettuce + chopped tomato | 100 |
| Classic Burger | bun + grilled patty + chopped lettuce | 150 |
| Cheese Burger | bun + grilled patty + cheese | 160 |
| Fries Basket | fried potato | 90 |
| Tomato Pasta | boiled pasta + chopped tomato | 140 |
| Deluxe Burger | bun + grilled patty + cheese + chopped tomato | 200 |

Serving on time pays the dish points plus a time bonus, multiplied by your combo
for consecutive on-time serves. The order interval and ticket timers tighten at
60 and 120 seconds into the shift.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome:

```
python3 -m http.server 8000 --directory game
```

No network requests, no build step, no libraries — vanilla JavaScript and canvas,
all art drawn in code, all sound synthesized with WebAudio.

## Layout

- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.
- `game/index.html` — page shell; `game/src/` holds the game, one file per job:
  `config` (data), `rng` (seeded random), `state` (tickets/score), `input`
  (keyboard/mouse), `world` (movement + stations), `render` (canvas drawing),
  `audio` (synthesized sfx), `shots` (frozen screenshot scenes), `main` (loop).
- `screenshots/` — four real renders of the game's own code.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
