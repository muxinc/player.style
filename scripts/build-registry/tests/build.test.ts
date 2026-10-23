import { readdirSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { findPresets, SKINS_DIR, skinPackages, workspaceVideojsVersion } from 'build-skin';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

import { buildRegistry, readSkinSources, validateHostedRegistry } from '../build.ts';
import { type CatalogEntry, FRAMEWORKS, rewriteImports } from '../index.ts';

const packages = skinPackages();
const videojs = workspaceVideojsVersion();

/** Every hosted `*.json` under a directory, recursively. */
function hostedJson(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

// The real build over the repository's skin packages, into a scratch directory: it stages the catalogs, runs
// `shadcn build`, and validates its own output; the assertions below check the hosted files independently.
describe('buildRegistry', () => {
  let outDir: string;
  let stagingDir: string;
  let items: Record<string, string[]>;

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'skins-registry-'));
    stagingDir = await mkdtemp(join(tmpdir(), 'skins-registry-staging-'));

    const result = await buildRegistry({ skinsDir: SKINS_DIR, outDir, stagingDir, log: () => {} });

    items = result.items;
  }, 120_000);

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
    await rm(stagingDir, { recursive: true, force: true });
  });

  it('builds one item per preset of every package, in its framework’s catalog', () => {
    for (const framework of FRAMEWORKS) {
      const expected = packages.filter((skin) => skin.framework === framework).flatMap((skin) => findPresets(skin.dir));

      expect(items[framework], framework).toHaveLength(expected.length);
    }
    expect(packages.length).toBeGreaterThan(0);
  });

  it('hosts registry.json, catalog.json and every item in both catalogs', async () => {
    const files = hostedJson(outDir);

    expect(files).toEqual(
      FRAMEWORKS.flatMap((framework) =>
        ['catalog.json', 'registry.json', ...items[framework]!.map((item) => `${item}.json`)].map((file) =>
          join(outDir, framework, file)
        )
      ).sort()
    );
    await expect(validateHostedRegistry(outDir)).resolves.toHaveLength(files.length);
  });

  it('carries the source files, imports rewritten for the install folder, with @components/skins targets', () => {
    for (const framework of FRAMEWORKS) {
      const registry = registrySchema.parse(JSON.parse(readFileSync(join(outDir, framework, 'registry.json'), 'utf8')));

      for (const { name } of registry.items) {
        const item = registryItemSchema.parse(
          JSON.parse(readFileSync(join(outDir, framework, `${name}.json`), 'utf8'))
        );
        const skin = item.files![0]!.path.split('/')[0]!;

        for (const dependency of item.dependencies ?? []) {
          if (dependency.startsWith('@videojs/')) expect(dependency).toMatch(new RegExp(`@${videojs}$`));
        }

        for (const file of item.files ?? []) {
          const path = file.path.slice(`${skin}/`.length);
          const source = readFileSync(join(SKINS_DIR, skin, framework, 'src', path), 'utf8');

          expect(file.target).toBe(`@components/skins/${skin}/${path}`);
          expect(file.content).toBe(rewriteImports(source, skin));
        }
      }
    }
  });

  it("writes a catalog index shaped like Video.js 10's: one entry per item", () => {
    for (const framework of FRAMEWORKS) {
      const catalog: CatalogEntry[] = JSON.parse(readFileSync(join(outDir, framework, 'catalog.json'), 'utf8'));

      expect(catalog.map((entry) => entry.name)).toEqual(items[framework]);

      for (const entry of catalog) {
        expect(entry.registryItem).toBe(entry.name);
        expect(entry.url).toBe(`https://skins.videojs.org/r/${framework}/${entry.name}.json`);
        expect(entry.docs).toMatch(/^https:\/\/skins\.videojs\.org\/skins\//);
        expect(entry.live).toBe(entry.preset.startsWith('live-'));
      }
    }
  });
});

describe('readSkinSources', () => {
  it('reads every package and skips the folders not yet in the skin create layout', async () => {
    const { sources, skipped } = await readSkinSources(SKINS_DIR);

    expect(sources.map((source) => `${source.name}/${source.framework}`)).toEqual(
      packages.map((skin) => `${skin.name}/${skin.framework}`)
    );
    expect(skipped.some((name) => packages.some((skin) => skin.name === name))).toBe(false);
  });
});
