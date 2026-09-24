import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { createRegistration, createSourceOwnedHtml, MEDIA_PLACEHOLDER } from '../index.ts';

const skinsDir = join(import.meta.dirname, '../../../skins');
const skins = readdirSync(skinsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** Every module specifier a TypeScript file imports, side-effect imports included. */
function importedModules(source: string): string[] {
  return [...source.matchAll(/^import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"];?$/gm)].map((match) => match[1]!);
}

describe('createSourceOwnedHtml', () => {
  it('replaces the default slot with the media placeholder', () => {
    expect(createSourceOwnedHtml('<div>\n  <slot></slot>\n</div>')).toBe(`<div>\n  ${MEDIA_PLACEHOLDER}\n</div>`);
  });

  it('unwraps a named slot into a marker and its fallback, dedented to the slot', () => {
    const template = [
      '<x-poster>',
      '  <slot name="poster">',
      '    <img class="ps-poster-image" alt="" />',
      '  </slot>',
      '</x-poster>',
      '<slot></slot>',
    ].join('\n');

    expect(createSourceOwnedHtml(template)).toBe(
      [
        '<x-poster>',
        '  <!-- poster -->',
        '  <img class="ps-poster-image" alt="" />',
        '</x-poster>',
        MEDIA_PLACEHOLDER,
      ].join('\n')
    );
  });

  it('leaves a marker alone for an empty named slot, whatever its other attributes', () => {
    const template = '<slot></slot>\n  <slot class="ps-byline-slot" name="byline"></slot>\n  <b>x</b>';

    expect(createSourceOwnedHtml(template)).toBe(`${MEDIA_PLACEHOLDER}\n  <!-- byline -->\n  <b>x</b>`);
  });

  it('refuses a template without a media slot', () => {
    expect(() => createSourceOwnedHtml('<div></div>')).toThrow(/media slot/);
  });
});

describe('createRegistration', () => {
  it('keeps the @videojs/html imports and drops the template and stylesheet ones', () => {
    const entry = [
      "import '@videojs/html/ui/container';",
      "import { registerIcons } from '@videojs/html/icons';",
      "import markup from './template.html?raw';",
      "import styles from '../skin.css?inline';",
      '',
      "registerIcons('default', {\n  play: PlayIcon,\n});",
    ].join('\n');

    expect(createRegistration(entry)).toBe(
      [
        "import '@videojs/html/ui/container';",
        "import { registerIcons } from '@videojs/html/icons';",
        '',
        "registerIcons('default', {\n  play: PlayIcon,\n});",
      ].join('\n')
    );
  });
});

describe('dist/open', () => {
  it('exists for every skin once `pnpm build:skins` has run', () => {
    const missing = skins.filter((skin) => !existsSync(join(skinsDir, skin, 'dist/open/skin.html')));

    expect(missing, 'run `pnpm build:skins` first').toEqual([]);
  });

  for (const skin of skins) {
    const dir = join(skinsDir, skin, 'dist/open');
    const built = existsSync(join(dir, 'skin.html'));

    describe.runIf(built)(skin, () => {
      it('ships the four source files and a README', () => {
        expect(readdirSync(dir).sort()).toEqual(['README.md', 'Skin.tsx', 'register.ts', 'skin.css', 'skin.html']);
      });

      it('has light-DOM markup with one media placeholder and no slots', () => {
        const html = readFileSync(join(dir, 'skin.html'), 'utf8');

        expect(html).not.toContain('<slot');
        expect(html.split(MEDIA_PLACEHOLDER).length - 1).toBe(1);
        expect(html).toMatch(new RegExp(`<media-container class="media-skin ps-${skin}" data-theme="${skin}"`));
      });

      it('copies the stylesheet unchanged', () => {
        expect(readFileSync(join(dir, 'skin.css'), 'utf8')).toBe(
          readFileSync(join(skinsDir, skin, 'src/skin.css'), 'utf8')
        );
      });

      it('registers every element the markup uses through @videojs/html', () => {
        const html = readFileSync(join(dir, 'skin.html'), 'utf8');
        const register = readFileSync(join(dir, 'register.ts'), 'utf8');
        const used = new Set([...html.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
        const modules = importedModules(register);
        const registered = new Set(modules.map((module) => module.replace(/^@videojs\/html\/ui\//, 'media-')));

        expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
        expect(modules.every((module) => module.startsWith('@videojs/html/'))).toBe(true);
      });

      it('imports modules that resolve into @videojs/html/dist', () => {
        const require = createRequire(join(skinsDir, skin, 'package.json'));
        const modules = importedModules(readFileSync(join(dir, 'register.ts'), 'utf8'));

        for (const module of modules) {
          expect(require.resolve(module), module).toMatch(/node_modules\/@videojs\/html\/dist\//);
        }
      });

      it('keeps the React source a client component', () => {
        const tsx = readFileSync(join(dir, 'Skin.tsx'), 'utf8');

        expect(tsx.startsWith("'use client';\n")).toBe(true);
        expect(tsx).toContain(`// Source-owned copy of @player.style/${skin}. Import './skin.css' next to it.`);
        expect(tsx).toMatch(/export function \w+Skin\b/);
      });
    });
  }
});
