// LADLE RUSH — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// Deterministic: two runs write byte-identical output.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return '/output';
}

function emptyDirContentsOnly(dir: string): void {
  // Never remove the directory itself: the grader mounts it.
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of readdirSync(dir).sort()) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function main(): void {
  const out = outputDir();
  emptyDirContentsOnly(out);
  const gameSrc = join(REPO_ROOT, 'game');
  const shotsSrc = join(REPO_ROOT, 'screenshots');
  cpSync(gameSrc, join(out, 'game'), { recursive: true });
  cpSync(shotsSrc, join(out, 'screenshots'), { recursive: true });
  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(out, 'dossier.json'), dossier);
  // Self-check: the dossier we just wrote must parse and name our cover shot.
  const parsed = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8')) as {
    schema: string;
    cover: number;
    images: Array<{ name: string }>;
    text: string;
  };
  if (parsed.schema !== 'makefun/dossier/v1') throw new Error('unexpected dossier schema: ' + parsed.schema);
  if (parsed.cover < 0 || parsed.cover >= parsed.images.length || parsed.images.length < 3 || parsed.images.length > 4) {
    throw new Error('unexpected screenshot set: cover=' + parsed.cover + ' images=' + parsed.images.length);
  }
  console.log('wrote ' + out + '/dossier.json (' + dossier.length + ' bytes)');
  console.log('cover: ' + parsed.images[parsed.cover].name + ' | images: ' + parsed.images.length + ' | dossier text: ' + parsed.text.length + ' chars');
}

main();
