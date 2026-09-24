/*
 * Screenshot site pages in light and dark, for a quick look after registering a skin.
 *
 *   node apps/skin-compare/scripts/site-shots.mjs <base-url> <path…> [--out <dir>] [--width 1280] [--height 900]
 *
 * Writes `<out>/<slug>-<light|dark>.png` per path (default out: the scratchpad's `site-shots/`) and prints console
 * errors and failed responses per page.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { launchBrowser } from './browser.mjs';

const scratch = process.env.CLAUDE_SCRATCHPAD ?? process.env.TMPDIR ?? '/tmp';
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: join(scratch, 'site-shots') },
    width: { type: 'string', default: '1280' },
    height: { type: 'string', default: '900' },
    full: { type: 'boolean', default: false },
  },
});

const [base, ...paths] = positionals;
if (!base || !paths.length) throw new Error('Usage: site-shots <base-url> <path…>');

mkdirSync(values.out, { recursive: true });

const browser = await launchBrowser();
const viewport = { width: Number(values.width), height: Number(values.height) };

for (const path of paths) {
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport, colorScheme: scheme });
    const page = await context.newPage();
    const problems = [];

    // The site keeps an explicit theme choice in localStorage; clear it so the media query decides.
    await context.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {}
    });
    page.on('pageerror', (error) => problems.push(String(error)));
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
    });

    await page
      .goto(new URL(path, base).href, { waitUntil: 'networkidle' })
      .catch((error) => problems.push(String(error)));
    await page.waitForTimeout(1500);

    const slug = path.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'home';
    const file = join(values.out, `${slug}-${scheme}.png`);

    await page.screenshot({ path: file, fullPage: values.full });
    console.log(`${file}${problems.length ? `\n  ${problems.join('\n  ')}` : ''}`);
    await context.close();
  }
}

await browser.close();
