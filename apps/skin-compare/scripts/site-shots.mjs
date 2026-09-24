/*
 * Screenshot pages of a running site build, for checking the gallery and a skin's detail page.
 *
 *   node scripts/site-shots.mjs http://127.0.0.1:3000 / /skins/microvideo [--out <dir>] [--full]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { launchBrowser } from './browser.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: process.env.CLAUDE_SCRATCHPAD ?? '.' },
    full: { type: 'boolean', default: false },
  },
});

const [base, ...paths] = positionals;
if (!base || !paths.length) throw new Error('Usage: site-shots <baseUrl> <path> [<path>…]');

mkdirSync(values.out, { recursive: true });

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

for (const path of paths) {
  const errors = [];
  const listener = (message) => message.type() === 'error' && errors.push(message.text());

  page.on('console', listener);
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const file = join(values.out, `site${path.replace(/\W+/g, '-') || '-home'}.png`);

  writeFileSync(file, await page.screenshot({ type: 'png', fullPage: values.full }));
  page.off('console', listener);
  console.log(`${path} -> ${file}${errors.length ? `\n  console errors: ${errors.join(' | ')}` : ''}`);
}

await browser.close();
