/*
 * Capture one skin across the three panes (Media Chrome original, Video.js 10 HTML, Video.js 10 React), three widths
 * and a handful of states, then lay the shots out in one labelled PNG.
 *
 *   pnpm -F skin-compare capture <skin> [--out docs/porting/screens] [--shots <dir>]
 *
 * Individual shots land in the scratchpad (or `--shots`); the composite in docs/porting/screens/<skin>.png.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { createServer } from 'vite-plus';

import { launchBrowser } from './browser.mjs';

const APP_DIR = resolve(import.meta.dirname, '..');
const REPO_DIR = resolve(APP_DIR, '../..');
const PANES = ['original', 'html', 'react'];
const WIDTHS = [360, 720, 1080];
const STATES = [
  'idle',
  'hover',
  'volume-hover',
  'scrub-hover',
  'playing',
  'playing-inactive',
  'paused-after-play',
  'accent-hover',
];
/* Where the pointer goes for the hover states, in each stack's own vocabulary; extend when a skin names things differently. */
const HOVER_TARGETS = {
  mute: 'media-mute-button, .ps-mute-button',
  scrub: 'media-time-range, media-time-slider, .ps-range',
};
const MAX_COMPOSITE_BYTES = 500 * 1024;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: join(REPO_DIR, 'docs/porting/screens') },
    shots: { type: 'string' },
    src: { type: 'string' },
    poster: { type: 'string' },
  },
});

const skin = positionals[0];
if (!skin) throw new Error('Usage: capture <skin>');

const scratch = process.env.CLAUDE_SCRATCHPAD ?? process.env.TMPDIR ?? '/tmp';
const shotsDir = values.shots ?? join(scratch, 'compare', skin);

mkdirSync(shotsDir, { recursive: true });
mkdirSync(values.out, { recursive: true });

if (!existsSync(join(APP_DIR, 'public/media/sample.webm'))) {
  console.log('No test media yet; run `node scripts/make-media.mjs` first.');
  process.exit(1);
}

const server = await createServer({
  root: APP_DIR,
  configFile: join(APP_DIR, 'vite.config.ts'),
  server: { host: '127.0.0.1', port: 0 },
});

await server.listen();

const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await launchBrowser();
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function paneUrl(pane, width, accent) {
  const query = new URLSearchParams({ skin, w: String(width) });

  if (values.src) query.set('src', values.src);
  if (values.poster) query.set('poster', values.poster);
  if (accent) query.set('accent', accent);

  return `${base}/${pane}.html?${query}`;
}

async function openPane(pane, width, accent) {
  const page = await browser.newPage({ viewport: { width: width + 32, height: Math.round((width * 9) / 16) + 64 } });
  const errors = [];

  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(paneUrl(pane, width, accent));
  await page.waitForSelector('body[data-ready]', { timeout: 30_000 });
  // Custom elements upgrade after the module runs; the poster image tells us the layer is drawn.
  await page
    .waitForFunction(() => document.querySelector('video')?.readyState >= 1, null, { timeout: 30_000 })
    .catch(() => {});
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 15_000 })
    .catch(() => {});
  await sleep(400);

  return { page, errors };
}

async function shoot(page, stage, name) {
  const buffer = await stage.screenshot({ type: 'png' });

  writeFileSync(join(shotsDir, `${name}.png`), buffer);
  return buffer;
}

async function center(page) {
  const box = await page.locator('#stage').boundingBox();

  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Move the pointer over the first visible match, returning false when the skin has no such control. */
async function hoverTarget(page, selector, xRatio = 0.5) {
  const target = page.locator(selector).first();
  const box = (await target.count()) ? await target.boundingBox() : null;
  if (!box) return false;

  await page.mouse.move(box.x + box.width * xRatio, box.y + box.height / 2, { steps: 4 });
  await sleep(500);
  return true;
}

const shots = new Map();
const problems = [];

for (const width of WIDTHS) {
  for (const pane of PANES) {
    const { page, errors } = await openPane(pane, width);
    const stage = page.locator('#stage');
    const key = (state) => `${pane}-${width}-${state}`;

    await page.mouse.move(1, 1);
    await sleep(300);
    shots.set(key('idle'), await shoot(page, stage, key('idle')));

    const mid = await center(page);

    await page.mouse.move(mid.x, mid.y);
    await sleep(400);
    shots.set(key('hover'), await shoot(page, stage, key('hover')));

    if (await hoverTarget(page, HOVER_TARGETS.mute)) {
      shots.set(key('volume-hover'), await shoot(page, stage, key('volume-hover')));
    }

    if (await hoverTarget(page, HOVER_TARGETS.scrub, 0.4)) {
      shots.set(key('scrub-hover'), await shoot(page, stage, key('scrub-hover')));
    }

    await page.mouse.move(mid.x, mid.y);
    await page.evaluate(() => document.querySelector('video')?.play());
    await sleep(1500);
    // Keep the pointer moving so controls count as active while playing.
    await page.mouse.move(mid.x + 4, mid.y + 4);
    await sleep(300);
    shots.set(key('playing'), await shoot(page, stage, key('playing')));

    // Both stacks hide their controls after a few idle seconds of playback; media-chrome's default is two.
    await sleep(3500);
    shots.set(key('playing-inactive'), await shoot(page, stage, key('playing-inactive')));

    await page.evaluate(() => document.querySelector('video')?.pause());
    await page.mouse.move(mid.x, mid.y);
    await sleep(600);
    shots.set(key('paused-after-play'), await shoot(page, stage, key('paused-after-play')));

    if (errors.length) problems.push(`${pane}@${width}: ${errors.join(' | ')}`);
    await page.close();

    const accent = await openPane(pane, width, 'f5c518');
    const accentMid = await center(accent.page);

    await accent.page.mouse.move(accentMid.x, accentMid.y);
    await sleep(400);
    shots.set(key('accent-hover'), await shoot(accent.page, accent.page.locator('#stage'), key('accent-hover')));
    await accent.page.close();
  }
}

/** Lay every shot out as rows of pane × width and columns of state, scaled down until the PNG fits the budget. */
async function composite(cellWidth) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const rows = WIDTHS.flatMap((width) => PANES.map((pane) => ({ pane, width })));
  const cell = (pane, width, state) => {
    const buffer = shots.get(`${pane}-${width}-${state}`);
    const src = buffer ? `data:image/png;base64,${buffer.toString('base64')}` : '';

    return `<td><img src="${src}" alt="" style="width:${cellWidth}px"></td>`;
  };
  const html = `<!doctype html><style>
    body{margin:0;background:#111;color:#eee;font:12px system-ui,sans-serif;display:inline-block;padding:12px}
    h1{font-size:16px;margin:0 0 8px}
    table{border-collapse:separate;border-spacing:6px}
    th{font-weight:600;text-align:left;white-space:nowrap;color:#bbb}
    td{vertical-align:top}
    img{display:block;background:#2b2b2b}
    .pane{color:#fff}
  </style>
  <h1>${skin}: Media Chrome original vs Video.js 10 ports — ${new Date().toISOString().slice(0, 10)}</h1>
  <table>
    <tr><th></th>${STATES.map((state) => `<th>${state}</th>`).join('')}</tr>
    ${rows
      .map(
        ({ pane, width }) =>
          `<tr><th><span class="pane">${pane}</span><br>${width}px</th>${STATES.map((state) => cell(pane, width, state)).join('')}</tr>`
      )
      .join('')}
  </table>`;

  await page.setContent(html);

  const buffer = await page.screenshot({ type: 'png', fullPage: true });

  await page.close();
  return buffer;
}

let cellWidth = 280;
let png = await composite(cellWidth);

while (png.byteLength > MAX_COMPOSITE_BYTES && cellWidth > 160) {
  cellWidth -= 40;
  png = await composite(cellWidth);
}

const outFile = join(values.out, `${skin}.png`);

writeFileSync(outFile, png);
await browser.close();
await server.close();

console.log(`Shots: ${shotsDir}`);
console.log(`Composite: ${outFile} (${Math.round(statSync(outFile).size / 1024)} KB, cells ${cellWidth}px)`);

if (problems.length) {
  console.log('Console errors:');
  for (const problem of problems) console.log(`  ${problem}`);
}
