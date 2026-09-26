import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { type Browser, chromium } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

import { checkPage, discoverSkins, type FitCheckServer, startServer, VIEWPORTS } from '../index.ts';

/*
 * The rules against two hand-made players (../page/fixture.ts): one that breaks each rule, one that uses each
 * allowance. A rule that stops firing, or an allowance that stops holding, fails here before it hides a real skin's
 * defect or fails a sound one.
 */

const installed = existsSync(chromium.executablePath());
let server: FitCheckServer | undefined;
let browser: Browser | undefined;

beforeAll(async () => {
  if (!installed)
    throw new Error('Chromium is not installed: run `pnpm -F fit-check exec playwright-core install chromium`.');

  server = await startServer(discoverSkins());
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

describe('discoverSkins', () => {
  it('finds every package under skins/, each on the preset its template declares', () => {
    const skinsDir = join(import.meta.dirname, '../../../skins');
    const packages = readdirSync(skinsDir).filter((name) => existsSync(join(skinsDir, name, 'package.json')));
    const skins = discoverSkins();

    expect(skins.map(({ name }) => name).sort()).toEqual(packages.sort());
    for (const { name, preset } of skins) if (name.endsWith('-live')) expect(preset, name).toBe('live-video');
  });
});

describe('checkPage', () => {
  it('reports each rule where the broken fixture breaks it', async () => {
    const findings = await checkPage(browser!, `${server!.url}/fixture?skin=broken`, VIEWPORTS[0]);

    expect(findings.map(({ rule, element }) => `${rule} ${element}`).sort()).toEqual([
      'fit/outside-player button.gone "Gone"',
      'fit/outside-player button.off "Off"',
      'fit/outside-player div.sunk',
      'fit/overflow div.row',
      'popover/placement div.popup',
      'target/size button.off "Off"',
      'target/size button.small "Small"',
      'text/overflow div.narrow "Overflowing text"',
      'text/overlap span.alpha "Alpha"',
    ]);
  });

  it('passes a round 44px button, reach added by a pseudo-element, an equivalent control, an ellipsis, a scrolling marquee, a clipped decoration, a thumb past its track, a hairline track whose hit area reaches past the edge and hidden controls past the edge', async () => {
    const findings = await checkPage(browser!, `${server!.url}/fixture?skin=clean`, VIEWPORTS[0]);

    expect(findings).toEqual([]);
  });

  it('holds an endless animation still while it measures, and sets it going again after', async () => {
    const page = await browser!.newPage();

    try {
      await page.goto(`${server!.url}/fixture?skin=clean`);
      await page.waitForFunction(() => 'fitCheck' in window);
      await page.evaluate(() => window.fitCheck.ready);

      // Every box the rules read, read with the marquee's state noted.
      const states = await page.evaluate(() => {
        const [marquee] = document.getAnimations();
        const during = new Set<string>();
        const read = Element.prototype.getBoundingClientRect;

        Element.prototype.getBoundingClientRect = function (this: Element) {
          during.add(marquee!.playState);
          return read.call(this);
        };
        try {
          window.fitCheck.measure('player');
        } finally {
          Element.prototype.getBoundingClientRect = read;
        }
        return { during: [...during], after: marquee!.playState };
      });

      expect(states).toEqual({ during: ['paused'], after: 'running' });
    } finally {
      await page.close();
    }
  });
});
