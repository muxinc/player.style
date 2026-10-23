import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import {
  findPresets,
  MEDIA_PLACEHOLDER,
  readSkinManifest,
  SKINS_DIR,
  skinPackages,
  workspaceVideojsVersion,
} from '../index.ts';

/*
 * The checks every skin package in the repository passes: each is a `skin create` project, taken in by
 * scripts/add-skin, with the gallery's `catalog.json` beside it.
 */

const packages = skinPackages();
const names = [...new Set(packages.map((skin) => skin.name))];
const videojs = workspaceVideojsVersion();

/** What `skin create` writes that intake leaves behind: the workbench, its deploy files and a nested workspace. */
const LEFT_BEHIND = ['apps', 'pnpm-workspace.yaml', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lock'];

describe('skinPackages', () => {
  it('finds every converted skin, each in its own framework folder', () => {
    for (const { name } of packages) expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(new Set(packages.map(({ name, framework }) => `${name}/${framework}`)).size).toBe(packages.length);
  });
});

describe.each(names)('skins/%s', (name) => {
  it('has catalog.json with a title, a description and an author', () => {
    const catalog = JSON.parse(readFileSync(join(SKINS_DIR, name, 'catalog.json'), 'utf8'));

    expect(catalog.title, 'title').toBeTruthy();
    expect(catalog.description, 'description').toBeTruthy();
    expect(catalog.author?.name, 'author.name').toBeTruthy();
  });
});

describe.each(packages)('skins/$name/$framework', ({ name, framework, dir }) => {
  const manifest = readSkinManifest(dir);

  it('is a skin create project for its folder and the workspace Video.js', () => {
    expect(manifest.framework).toBe(framework);
    expect(['css', 'tailwind']).toContain(manifest.styling);
    expect(manifest.videojs).toBe(videojs);
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))).toMatchObject({
      name: `@skins/${name}-${framework}`,
      private: true,
    });
  });

  it('has a skin entry in every preset folder, and markup with the media placeholder', () => {
    const presets = findPresets(dir);

    expect(presets.length).toBeGreaterThan(0);
    for (const preset of presets) {
      const files = framework === 'react' ? ['skin.tsx'] : ['skin.ts', 'skin.html'];

      for (const file of files) expect(existsSync(join(dir, 'src', preset, file)), `${preset}/${file}`).toBe(true);
      if (framework === 'html') {
        expect(readFileSync(join(dir, 'src', preset, 'skin.html'), 'utf8')).toContain(MEDIA_PLACEHOLDER);
      }
    }
  });

  it('left the workbench and the nested workspace behind', () => {
    for (const file of LEFT_BEHIND) expect(existsSync(join(dir, file)), file).toBe(false);
  });
});
