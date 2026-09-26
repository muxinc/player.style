import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

import { detectPreset, type Preset, SOURCES } from 'build-skin';
import { type Browser, devices, type Page } from 'playwright-core';
import { build, type Plugin } from 'vite-plus';

import type { Issue } from './page/runtime.ts';

export type { Issue, Rule } from './page/runtime.ts';

const packageDir = import.meta.dirname;
const repoDir = resolve(packageDir, '../..');
const skinsDir = join(repoDir, 'skins');

/**
 * The media the page plays: the registry e2e's short WebM sample (Playwright's Chromium has no H.264). The poster and
 * the captions track are generated below, so the check needs no binary fixture of its own.
 */
const SAMPLE_MEDIA = join(repoDir, 'scripts/build-registry/e2e/media/sample.webm');
const POSTER = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 16 9"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#3a506b"/><stop offset="1" stop-color="#1c2541"/></linearGradient></defs><rect width="16" height="9" fill="url(#g)"/></svg>`;
const CAPTIONS = 'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nA caption line\n';

/**
 * The room above and below the player, as a page has round it: a hit area that reaches past the player's top or
 * bottom edge (an audio card's top-edge seek strip) is measured, while the player still spans the phone's width.
 */
const PAGE_MARGIN = 44;

/** The phone widths every skin is rendered at, each with the height of a 16:9 player that fills it. */
export const VIEWPORTS = [
  { width: 320, height: 180 },
  { width: 375, height: 211 },
] as const;

export const FRAMEWORKS = ['html', 'react'] as const;
export type Framework = (typeof FRAMEWORKS)[number];

export interface Skin {
  /** The package directory under `skins/`, which is also the slug the tag and component names derive from. */
  name: string;
  /** The preset the template's root declares: a `-live` package renders on the live-video player. */
  preset: Preset;
  /** The template has a `byline` slot, so the page fills it (and passes the React component a `byline`). */
  byline: boolean;
}

/**
 * Every skin package in the workspace: each directory under `skins/` with a template, the same discovery as the shared
 * build-skin tests, so a new package is covered without being listed anywhere.
 */
export function discoverSkins(): Skin[] {
  return readdirSync(skinsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(skinsDir, entry.name, SOURCES.template)))
    .map((entry) => {
      const template = readFileSync(join(skinsDir, entry.name, SOURCES.template), 'utf8');

      return { name: entry.name, preset: detectPreset(template), byline: /<slot\b[^>]*\bname="byline"/.test(template) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The skins whose `dist` is missing an entry the page loads. */
export function unbuilt(skins: Skin[]): string[] {
  return skins
    .filter((skin) =>
      ['html.js', 'react.js', 'skin.css'].some((file) => !existsSync(join(skinsDir, skin.name, 'dist', file)))
    )
    .map((skin) => skin.name);
}

/** `virtual:fit-check/skins`: a lazy import of every skin's built entries, so a page loads only the skin it shows. */
function skinsModule(skins: Skin[]): Plugin {
  const id = 'virtual:fit-check/skins';
  const loaders = (file: string) =>
    `{\n${skins.map(({ name }) => `  ${JSON.stringify(name)}: () => import(${JSON.stringify(join(skinsDir, name, 'dist', file))}),`).join('\n')}\n}`;

  return {
    name: 'fit-check:skins',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load: (source) =>
      source === `\0${id}`
        ? `export const html = ${loaders('html.js')};\nexport const react = ${loaders('react.js')};\n`
        : undefined,
  };
}

/**
 * Bundle the pages (`page/html.ts`, `page/react.ts`, and the rule tests' `page/fixture.ts`) with the Video.js packages,
 * React and every skin's dist.
 */
async function bundlePages(skins: Skin[], outDir: string): Promise<void> {
  await build({
    configFile: false,
    root: packageDir,
    publicDir: false,
    logLevel: 'warn',
    mode: 'production',
    plugins: [skinsModule(skins)],
    build: {
      outDir,
      emptyOutDir: true,
      minify: false,
      target: 'es2022',
      modulePreload: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: {
          html: join(packageDir, 'page/html.ts'),
          react: join(packageDir, 'page/react.ts'),
          fixture: join(packageDir, 'page/fixture.ts'),
        },
        output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
        onLog(level, log, handler) {
          // The React entries' `'use client'` means nothing in a browser bundle.
          if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;

          handler(level, log);
        },
      },
    },
  });
}

const TYPES: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
  '.vtt': 'text/vtt',
  '.html': 'text/html',
};

function page(entry: Framework | 'fixture'): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>fit check</title>
    <style>html, body { margin: 0; background: #808080; } #root { width: 100%; margin: ${PAGE_MARGIN}px 0; }</style>
    <script type="module" src="/bundle/${entry}.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
}

export interface FitCheckServer {
  url: string;
  close(): Promise<void>;
}

/**
 * Bundle the pages into a scratch directory and serve them on a free loopback port with every skin's `dist`, the
 * sample media (with byte ranges, which seeking needs) and the generated poster and captions.
 */
export async function startServer(skins: Skin[]): Promise<FitCheckServer> {
  const bundleDir = await mkdtemp(join(tmpdir(), 'fit-check-'));

  await bundlePages(skins, bundleDir);

  const files = (pathname: string): string | null => {
    if (pathname === '/media/sample.webm') return SAMPLE_MEDIA;

    const [base, prefix] = pathname.startsWith('/bundle/')
      ? [bundleDir, '/bundle/']
      : /^\/skins\/[\w-]+\/dist\//.test(pathname)
        ? [skinsDir, '/skins/']
        : [];
    if (!base) return null;

    const path = resolve(base, pathname.slice(prefix!.length));

    return path.startsWith(base + sep) ? path : null;
  };

  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://127.0.0.1');
    const generated: Record<string, [string, string]> = {
      '/html': [page('html'), TYPES['.html']!],
      '/react': [page('react'), TYPES['.html']!],
      '/fixture': [page('fixture'), TYPES['.html']!],
      '/media/poster.svg': [POSTER, TYPES['.svg']!],
      '/media/captions.vtt': [CAPTIONS, TYPES['.vtt']!],
    };
    const text = generated[pathname];

    if (text) {
      response.writeHead(200, { 'content-type': text[1], 'cache-control': 'no-store' });
      response.end(text[0]);
      return;
    }

    const path = files(pathname);
    const info = path ? await stat(path).catch(() => null) : null;

    if (!path || !info?.isFile()) {
      response.writeHead(404);
      response.end('Not found.');
      return;
    }

    const body = await readFile(path);
    const type = TYPES[extname(path)] ?? 'application/octet-stream';
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? '');

    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;

      response.writeHead(206, {
        'content-type': type,
        'content-range': `bytes ${start}-${end}/${body.length}`,
        'accept-ranges': 'bytes',
      });
      response.end(body.subarray(start, end + 1));
      return;
    }

    response.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes' });
    response.end(body);
  });

  await new Promise<void>((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    async close() {
      await new Promise((resolveClose) => server.close(resolveClose));
      await rm(bundleDir, { recursive: true, force: true });
    },
  };
}

export interface Case {
  skin: Skin;
  framework: Framework;
  width: number;
  height: number;
}

/** An issue found in a case, with the interaction that led to it. */
export interface Finding extends Issue {
  /** What was open: the paused player, or the menu a tap on a trigger opened. */
  state: string;
}

/** One line of failure output: the rule, the state, the element and what is wrong with it. */
export function formatFinding({ rule, state, element, detail }: Finding): string {
  return `[${rule}] ${state}: ${element}: ${detail}`;
}

const wait = (ms: number) => new Promise((resolveWait) => setTimeout(resolveWait, ms));

/**
 * Wait until no transition or finite animation is running and nothing in the player or its popups has moved over
 * three reads, or 4s: what a tap set off has finished.
 */
async function settle(page: Page): Promise<void> {
  const deadline = Date.now() + 4000;
  let previous = '';
  let stable = 0;

  await wait(150);
  while (Date.now() < deadline) {
    const [current, busy] = await page.evaluate(() => [window.fitCheck.signature(), window.fitCheck.busy()] as const);

    stable = current === previous && !busy ? stable + 1 : 0;
    if (stable === 2) return;

    previous = current;
    await wait(100);
  }
}

async function tap(page: Page, point: { x: number; y: number }): Promise<void> {
  await page.touchscreen.tap(point.x, point.y);
  await settle(page);
}

/**
 * Tap the player where no control is until its controls show, keeping the media paused (a tap plays in a skin whose
 * tap gesture toggles playback). The first tap always happens: the state under test is the one after a tap.
 */
async function showControls(page: Page, always: boolean): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!always || attempt > 0) {
      if ((await page.evaluate(() => window.fitCheck.state())).controlsVisible) return;
    }

    await tap(page, await page.evaluate(() => window.fitCheck.neutralPoint()));

    if (!(await page.evaluate(() => window.fitCheck.state())).paused) {
      await page.evaluate(() => window.fitCheck.pause());
      await settle(page);
    }
  }
}

async function closePopups(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 3 && (await page.evaluate(() => window.fitCheck.popupCount())); attempt++) {
    await page.keyboard.press('Escape');
    await settle(page);
  }
}

/** Tap a registered element; false when it is no longer painted or cannot be hit. */
async function tapElement(page: Page, id: number): Promise<boolean> {
  const point = await page.evaluate((target) => window.fitCheck.pointOf(target), id);
  if (!point) return false;

  await tap(page, point);
  return true;
}

/**
 * Whether the skin is drawn at a fixed size: given 64px more width, none of its controls changes size and they spread
 * no further apart (a responsive skin's bars and sliders stretch, its corners move apart, or a breakpoint changes it).
 */
async function drawnAtFixedSize(page: Page, viewport: { width: number; height: number }): Promise<boolean> {
  const before = await page.evaluate(() => window.fitCheck.controlSizes());

  await page.setViewportSize({ ...viewport, width: viewport.width + 64 });
  await settle(page);

  const after = await page.evaluate(() => window.fitCheck.controlSizes());

  await page.setViewportSize(viewport);
  await settle(page);
  return before.length > 0 && before.join() === after.join();
}

/** The browser's media pipeline failed (WebKit's does, now and then, under load): the case is run again. */
class MediaFailure extends Error {}

/**
 * Render one skin in one framework at one size under phone emulation, and return every rule it breaks: first paused
 * with its controls shown by a tap, then with each menu a tap opens (and each submenu a tap inside it opens). A run
 * whose media fails to decode is retried twice, since the player's error dialog would cover what is measured.
 */
export async function checkCase(
  browser: Browser,
  url: string,
  { skin, framework, width, height }: Case
): Promise<Finding[]> {
  const query = new URLSearchParams({ skin: skin.name, preset: skin.preset, byline: skin.byline ? '1' : '0' });

  return checkPage(browser, `${url}/${framework}?${query}`, { width, height });
}

/** `checkCase` for any page the server serves, such as a fixture: `page` is its full URL. */
export async function checkPage(
  browser: Browser,
  page: string,
  size: { width: number; height: number }
): Promise<Finding[]> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await runPage(browser, page, size);
    } catch (error) {
      if (!(error instanceof MediaFailure) || attempt === 3) throw error;
    }
  }
}

async function runPage(
  browser: Browser,
  address: string,
  { width, height }: { width: number; height: number }
): Promise<Finding[]> {
  const origin = new URL(address).origin;
  const context = await browser.newContext({
    viewport: { width, height: height + 2 * PAGE_MARGIN },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: devices['iPhone 15']!.userAgent,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const errors: string[] = [];
  const findings = new Map<string, Finding>();
  const mediaOk = async () => {
    const failure = await page.evaluate(() => window.fitCheck.mediaError());
    if (failure) throw new MediaFailure(failure);
  };
  const collect = (issues: Issue[], state: string) => {
    for (const issue of issues) {
      const finding = { ...issue, state };

      findings.set(formatFinding(finding), finding);
    }
  };

  try {
    // Hermetic: anything but the local server is refused.
    await context.route(
      (target) => target.origin !== origin,
      (route) => route.abort()
    );

    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(address);
    await page.waitForFunction(() => 'fitCheck' in window);
    await page
      .evaluate(() => window.fitCheck.ready)
      .catch((error: Error) => {
        throw new Error(
          `${error.message.split('\n')[0]}${errors.length ? `\npage errors:\n${errors.join('\n')}` : ''}`
        );
      });

    // A skin taller than a 16:9 frame (a fixed-size one, say) gets a viewport that shows all of it.
    const player = await page.evaluate(() => window.fitCheck.playerBox());
    const viewport = { width, height: Math.max(height, Math.ceil(player.bottom - player.top)) + 2 * PAGE_MARGIN };

    await page.setViewportSize(viewport);
    await page.evaluate(() => window.fitCheck.prepare());
    await showControls(page, true);
    await mediaOk();

    // Only a skin with undersized targets is tried at a second width, to see whether it is drawn at a fixed size.
    let issues = await page.evaluate(() => window.fitCheck.measure('player'));
    const fixed = issues.some(({ rule }) => rule === 'target/size') && (await drawnAtFixedSize(page, viewport));

    if (fixed) issues = await page.evaluate(() => window.fitCheck.measure('player', true));
    collect(issues, 'paused, controls shown');

    const triggers = await page.evaluate(() => window.fitCheck.triggers('player'));

    for (const trigger of triggers) {
      const open = async () => {
        await closePopups(page);
        await showControls(page, false);
        return (await tapElement(page, trigger.id)) && (await page.evaluate(() => window.fitCheck.popupCount())) > 0;
      };
      if (!(await open())) continue;

      const state = `after tapping ${trigger.label}`;
      const submenus = await page.evaluate(() => window.fitCheck.triggers('popups'));

      collect(await page.evaluate((drawn) => window.fitCheck.measure('popups', drawn), fixed), state);

      for (const [index, submenu] of submenus.entries()) {
        if (index > 0 && !(await open())) break;

        // Reopening can re-render the menu, so find the submenu trigger again by position and name.
        const again = index > 0 ? (await page.evaluate(() => window.fitCheck.triggers('popups')))[index] : submenu;
        if (again?.label !== submenu.label || !(await tapElement(page, again.id))) continue;

        collect(
          await page.evaluate((drawn) => window.fitCheck.measure('popups', drawn), fixed),
          `${state}, then ${submenu.label}`
        );
      }
    }
    await mediaOk();
  } finally {
    await context.close();
  }

  return [...findings.values()];
}
