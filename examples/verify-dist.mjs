/*
 * Post-build check for the examples: a packaging mistake that a bundler tolerates must still fail the build.
 *
 *   node ../verify-dist.mjs [--elements]
 *
 * Run from an example after `vp build`. For each `@player.style/*` dependency of the example it asserts that the bundled CSS carries the skin's root class
 * (a dropped `skin.css` import) and, with `--elements`, that the bundled JS still defines `<skin>-skin` (a
 * `sideEffects` entry that no longer matches `dist/html.js` lets the bundler tree-shake the bare `/html` import).
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const elements = process.argv.includes('--elements');
const manifest = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8'));
const skins = Object.keys(manifest.dependencies ?? {})
  .filter((name) => name.startsWith('@player.style/'))
  .map((name) => name.slice('@player.style/'.length));
const assetsDir = join(process.cwd(), 'dist/assets');
const files = await readdir(assetsDir);
const read = async (extension) =>
  (
    await Promise.all(
      files.filter((file) => file.endsWith(extension)).map((file) => readFile(join(assetsDir, file), 'utf8'))
    )
  ).join('\n');
const [css, js] = await Promise.all([read('.css'), read('.js')]);
const errors = [];

for (const skin of skins) {
  // A live package ships its base skin's stylesheet, so its root class is the base name's.
  const rootClass = `.ps-${skin.replace(/-live$/, '')}`;

  if (!css.includes(rootClass))
    errors.push(`${skin}: no ${rootClass} rule in the bundled CSS (was skin.css imported?).`);

  if (elements && !new RegExp(`["'\`]${skin}-skin["'\`]`).test(js)) {
    errors.push(`${skin}: <${skin}-skin> is not defined in the bundled JS (check the package's sideEffects).`);
  }
}

if (errors.length) {
  console.error(`verify-dist failed in ${process.cwd()}:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

console.log(`verify-dist: ${skins.length} skins bundled${elements ? ' and defined' : ''}: ${skins.join(', ')}.`);
