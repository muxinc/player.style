import { existsSync } from 'node:fs';

import { type Browser, type BrowserType, chromium, webkit } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

import {
  checkCase,
  discoverSkins,
  type FitCheckServer,
  formatFinding,
  FRAMEWORKS,
  startServer,
  unbuilt,
  VIEWPORTS,
} from '../index.ts';

/*
 * Every built skin, as its HTML element and its React component, on a phone at 320 and 375 wide, in Chromium and
 * WebKit: paused with its controls shown by a tap, and with every menu a tap opens. See ../README.md for the rules.
 */

const skins = discoverSkins();
const built = unbuilt(skins).length === 0;
const INSTALL = 'pnpm -F fit-check exec playwright-core install chromium webkit';

/** Chromium is required; WebKit, the engine an iPhone runs, is checked when it is installed and skipped otherwise. */
const engines: { name: string; type: BrowserType; required: boolean }[] = [
  { name: 'chromium', type: chromium, required: true },
  { name: 'webkit', type: webkit, required: false },
];

let server: FitCheckServer | undefined;

beforeAll(async () => {
  if (built) server = await startServer(skins);
});

afterAll(async () => {
  await server?.close();
});

describe('skins', () => {
  it('are all built', () => {
    expect(unbuilt(skins), 'run `pnpm build:skins` first').toEqual([]);
  });
});

for (const { name, type, required } of engines) {
  const installed = existsSync(type.executablePath());
  const suite = installed || required ? name : `${name} (not installed: \`${INSTALL}\`)`;

  describe.skipIf(!installed && !required)(suite, () => {
    let browser: Browser | undefined;

    beforeAll(async () => {
      if (!installed) throw new Error(`${name} is not installed: run \`${INSTALL}\`.`);
      if (built) browser = await type.launch();
    });

    afterAll(async () => {
      await browser?.close();
    });

    for (const skin of skins) {
      describe.runIf(built)(skin.name, () => {
        for (const framework of FRAMEWORKS) {
          for (const { width, height } of VIEWPORTS) {
            const title = `${framework} at ${width}x${height} on the ${skin.preset} preset`;

            it(title, async () => {
              const findings = await checkCase(browser!, server!.url, { skin, framework, width, height });

              expect(findings.map(formatFinding), `${skin.name}, ${title}, in ${name}`).toEqual([]);
            });
          }
        }
      });
    }
  });
}
