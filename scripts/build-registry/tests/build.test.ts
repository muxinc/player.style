import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

import { buildRegistry, readSkinSources, validateHostedRegistry } from '../build.ts';
import { CATALOG_FILES, type CatalogEntry, FRAMEWORKS, registryFileTarget } from '../index.ts';

const skinsDir = join(import.meta.dirname, '../../../skins');
const builtSkins = readdirSync(skinsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(skinsDir, entry.name, 'dist/open/skin.html')))
  .map((entry) => entry.name)
  .sort();

/** Every hosted `*.json` under a directory, recursively. */
function hostedJson(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

// The real build over the built skins (`pnpm build:skins` first), into a scratch directory: it stages the catalogs,
// runs `shadcn build`, and validates its own output; the assertions below check the hosted files independently.
describe('buildRegistry', () => {
  let outDir: string;
  let stagingDir: string;
  let items: string[];

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'player-style-registry-'));
    stagingDir = await mkdtemp(join(tmpdir(), 'player-style-registry-staging-'));

    const result = await buildRegistry({ skinsDir, outDir, stagingDir, log: () => {} });

    items = result.items;
  }, 120_000);

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
    await rm(stagingDir, { recursive: true, force: true });
  });

  it('builds one item per built skin, named after its directory', () => {
    expect(items).toEqual(builtSkins);
    expect(builtSkins.length).toBeGreaterThan(0);
  });

  it('hosts registry.json, catalog.json and every item in both catalogs', async () => {
    const files = hostedJson(outDir);

    expect(files).toEqual(
      FRAMEWORKS.flatMap((framework) =>
        ['catalog.json', 'registry.json', ...items.map((item) => `${item}.json`)].map((file) =>
          join(outDir, framework, file)
        )
      ).sort()
    );
    await expect(validateHostedRegistry(outDir)).resolves.toHaveLength(files.length);
  });

  it('emits schema-valid items whose files carry the source files verbatim with @components targets', () => {
    for (const framework of FRAMEWORKS) {
      const registry = registrySchema.parse(JSON.parse(readFileSync(join(outDir, framework, 'registry.json'), 'utf8')));

      expect(registry.items.map((item) => item.name)).toEqual(items);

      for (const name of items) {
        const item = registryItemSchema.parse(
          JSON.parse(readFileSync(join(outDir, framework, `${name}.json`), 'utf8'))
        );
        const open = join(skinsDir, name, 'dist/open');

        expect(item.name).toBe(name);
        expect(item.dependencies).toEqual(
          framework === 'react' ? ['@videojs/react@10.0.0-rc.2', 'react'] : ['@videojs/html@10.0.0-rc.2']
        );
        expect(item.files?.map((file) => file.target)).toEqual(
          CATALOG_FILES[framework].map((file) => registryFileTarget(name, file))
        );

        for (const file of item.files ?? []) {
          const source = file.path.slice(`${name}/`.length);

          expect(file.content).toBe(readFileSync(join(open, source), 'utf8'));
        }
      }
    }
  });

  it("writes a catalog index shaped like Video.js 10's: one entry per item", () => {
    for (const framework of FRAMEWORKS) {
      const catalog: CatalogEntry[] = JSON.parse(readFileSync(join(outDir, framework, 'catalog.json'), 'utf8'));

      expect(catalog.map((entry) => entry.name)).toEqual(items);

      for (const entry of catalog) {
        expect(entry.registryItem).toBe(entry.name);
        expect(entry.url).toBe(`https://player.style/r/${framework}/${entry.name}.json`);
        expect(entry.docs).toMatch(/^https:\/\/player\.style\/skins\//);
        expect(entry.useCase).toBe(entry.preset);
        expect(entry.live).toBe(entry.name.endsWith('-live'));
        expect(entry.files).toHaveLength(CATALOG_FILES[framework].length);
      }
    }
  });
});

describe('readSkinSources', () => {
  it('reads every built skin and reports the unbuilt ones', async () => {
    const { sources, skipped } = await readSkinSources(skinsDir);

    expect(sources.map((source) => source.name)).toEqual(builtSkins);
    expect(skipped.every((name) => !builtSkins.includes(name))).toBe(true);
    expect(sources[0]?.package).toBe(`@player.style/${builtSkins[0]}`);
  });
});
