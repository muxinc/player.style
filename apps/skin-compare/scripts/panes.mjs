/*
 * What capture.mjs and measure.mjs share: the harness dev server, the test media check, and opening one pane of one
 * skin at one width in a fresh page.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { createServer } from 'vite-plus';

export const APP_DIR = resolve(import.meta.dirname, '..');
export const REPO_DIR = resolve(APP_DIR, '../..');
export const PANES = ['original', 'html', 'react'];
export const MEDIA_SELECTOR = 'video, audio';
export const SCRATCH = process.env.CLAUDE_SCRATCHPAD ?? process.env.TMPDIR ?? '/tmp';

const MEDIA = [
  'sample.webm',
  'poster.png',
  'pattern-portrait.webm',
  'poster-portrait.png',
  'tone.webm',
  'storyboard.vtt',
  'storyboard.jpg',
  'storyboard-portrait.vtt',
  'storyboard-portrait.jpg',
  'captions.vtt',
];

export const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

export function assertMedia() {
  if (MEDIA.every((file) => existsSync(join(APP_DIR, 'public/media', file)))) return;

  console.log('Test media missing; run `node scripts/make-media.mjs --all` first.');
  process.exit(1);
}

/** Start the harness's Vite server on a free port, or reuse one already running at `base`. */
export async function startHarness(base) {
  if (base) {
    const server = await createServer({
      root: APP_DIR,
      configFile: join(APP_DIR, 'vite.config.ts'),
      logLevel: 'error',
    });
    const { getSkin, SKINS } = await server.ssrLoadModule('/src/skins.ts');
    const { parseAspect } = await server.ssrLoadModule('/src/params.ts');

    return { base: base.replace(/\/$/, ''), getSkin, SKINS, parseAspect, close: () => server.close() };
  }

  const server = await createServer({
    root: APP_DIR,
    configFile: join(APP_DIR, 'vite.config.ts'),
    server: { host: '127.0.0.1', port: 0 },
  });

  await server.listen();

  const { getSkin, SKINS } = await server.ssrLoadModule('/src/skins.ts');
  const { parseAspect } = await server.ssrLoadModule('/src/params.ts');

  return {
    base: server.resolvedUrls.local[0].replace(/\/$/, ''),
    getSkin,
    SKINS,
    parseAspect,
    close: () => server.close(),
  };
}

export function paneUrl(base, pane, skin, width, extra = {}) {
  const query = new URLSearchParams({ skin, w: String(width) });

  for (const [name, value] of Object.entries(extra)) if (value) query.set(name, value);
  return `${base}/${pane}.html?${query}`;
}

/** Open a pane and wait until its media has metadata and every image (poster, storyboard) has loaded. */
export async function openPane(browser, url, { width, ratio, deviceScaleFactor = 1 }) {
  const page = await browser.newPage({
    viewport: { width: width + 32, height: Math.round(width / ratio) + 64 },
    deviceScaleFactor,
  });
  const errors = [];

  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(url);
  await page.waitForSelector('body[data-ready]', { state: 'attached', timeout: 30_000 });
  // Custom elements upgrade after the module runs; the poster image tells us the layer is drawn.
  await page
    .waitForFunction((selector) => document.querySelector(selector)?.readyState >= 1, MEDIA_SELECTOR, {
      timeout: 30_000,
    })
    .catch(() => {});
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 15_000 })
    .catch(() => {});
  await sleep(400);

  return { page, errors };
}
