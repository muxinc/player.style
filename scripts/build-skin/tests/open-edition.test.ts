import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import {
  createOpenEdition,
  createRegistration,
  createSourceOwnedHtml,
  detectPreset,
  EDITIONS,
  hasLiveEdition,
  MEDIA_PLACEHOLDER,
} from '../index.ts';

const skinsDir = join(import.meta.dirname, '../../../skins');
const skins = readdirSync(skinsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** Every module specifier a TypeScript file imports, side-effect imports included. */
function importedModules(source: string): string[] {
  return [...source.matchAll(/^import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"];?$/gm)].map((match) => match[1]!);
}

/** Minimal sources for `createOpenEdition`, with the root's `data-preset` as the one variable. */
function sources(preset: string, edition?: 'live') {
  return {
    name: '@player.style/example',
    edition,
    template: `<media-container class="media-skin ps-example" data-theme="example" data-preset="${preset}">\n  <slot></slot>\n</media-container>`,
    css: '.ps-example {}',
    htmlEntry: "import '@videojs/html/ui/container';\nimport markup from './template.html?raw';",
    reactEntry: "'use client';\n\nexport function ExampleSkin() {\n  return null;\n}",
  };
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

describe('detectPreset', () => {
  it('reads the root data-preset and falls back to video', () => {
    expect(detectPreset('<media-container class="x" data-preset="audio">')).toBe('audio');
    expect(detectPreset('<media-container class="x" data-preset="live-video">')).toBe('live-video');
    expect(detectPreset('<media-container class="x">')).toBe('video');
    expect(detectPreset('<media-container class="x" data-preset="background">')).toBe('video');
  });
});

describe('createOpenEdition', () => {
  it('documents the video preset for an on-demand edition', () => {
    const files = createOpenEdition(sources('video'));

    expect(files['README.md']).toContain('# @player.style/example, open edition');
    expect(files['README.md']).toContain("import '@videojs/html/video/player';");
    expect(files['README.md']).toContain("import { Video, VideoPlayer } from '@videojs/react/video';");
    expect(files['README.md']).toContain('<video-player>');
    expect(files['README.md']).not.toContain('live edition');
    expect(files['skin.html']).toContain('Paste it inside <video-player>');
    expect(files['register.ts']).toContain("import '@videojs/html/video/player';");
    expect(files['Skin.tsx']).toContain(
      "// Source-owned copy of @player.style/example. Import './skin.css' next to it."
    );
  });

  it('documents the audio preset', () => {
    const files = createOpenEdition(sources('audio'));

    expect(files['README.md']).toContain("import '@videojs/html/audio/player';");
    expect(files['README.md']).toContain("import { Audio, AudioPlayer } from '@videojs/react/audio';");
    expect(files['README.md']).toContain('your <audio> where the media placeholder is');
  });

  it('documents the live-video preset and the /live subpath for a live edition', () => {
    const files = createOpenEdition(sources('live-video', 'live'));

    expect(files['README.md']).toContain('# @player.style/example/live, open edition');
    expect(files['README.md']).toContain('This is the live edition, on the Video.js live-video preset');
    expect(files['README.md']).toContain("import '@videojs/html/live-video/player';");
    expect(files['README.md']).toContain("import { Video, LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(files['README.md']).toContain('<live-video-player>');
    expect(files['README.md']).toContain('your <video> where the media placeholder is');
    expect(files['skin.html']).toContain('@player.style/example/live, open edition');
    expect(files['skin.html']).toContain('Paste it inside <live-video-player>');
    expect(files['register.ts']).toContain("import '@videojs/html/live-video/player';");
    expect(files['register.ts']).toContain('<live-video-player>');
    expect(files['Skin.tsx']).toContain(
      "// Source-owned copy of @player.style/example/live. Import './skin.css' next to it."
    );
  });

  it('refuses a React entry without the client directive', () => {
    expect(() => createOpenEdition({ ...sources('video'), reactEntry: 'export function ExampleSkin() {}' })).toThrow(
      /use client/
    );
  });
});

describe('dist/open', () => {
  it('exists for every skin once `pnpm build:skins` has run', () => {
    const missing = skins.filter((skin) => !existsSync(join(skinsDir, skin, 'dist/open/skin.html')));

    expect(missing, 'run `pnpm build:skins` first').toEqual([]);
  });

  for (const skin of skins) {
    const skinDir = join(skinsDir, skin);
    const live = hasLiveEdition(skinDir);
    const editions = live ? (['', 'live'] as const) : ([''] as const);

    for (const edition of editions) {
      const dir = join(skinDir, 'dist/open', edition);
      const built = existsSync(join(dir, 'skin.html'));
      const label = edition ? `${skin}/live` : skin;
      const preset = edition ? 'live-video' : null;

      describe.runIf(built)(label, () => {
        it('ships the four source files and a README', () => {
          const files = readdirSync(dir).filter((file) => file !== 'live');

          expect(files.sort()).toEqual(['README.md', 'Skin.tsx', 'register.ts', 'skin.css', 'skin.html']);
        });

        it('has light-DOM markup with one media placeholder and no slots', () => {
          const html = readFileSync(join(dir, 'skin.html'), 'utf8');

          expect(html).not.toContain('<slot');
          expect(html.split(MEDIA_PLACEHOLDER).length - 1).toBe(1);
          expect(html).toMatch(new RegExp(`<media-container class="media-skin ps-${skin}" data-theme="${skin}"`));
          if (preset) expect(html).toMatch(new RegExp(`<media-container [^>]*data-preset="${preset}"`));
        });

        it('copies the stylesheet unchanged', () => {
          expect(readFileSync(join(dir, 'skin.css'), 'utf8')).toBe(readFileSync(join(skinDir, 'src/skin.css'), 'utf8'));
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
          const require = createRequire(join(skinDir, 'package.json'));
          const modules = importedModules(readFileSync(join(dir, 'register.ts'), 'utf8'));

          for (const module of modules) {
            expect(require.resolve(module), module).toMatch(/node_modules\/@videojs\/html\/dist\//);
          }
        });

        it('keeps the React source a client component', () => {
          const tsx = readFileSync(join(dir, 'Skin.tsx'), 'utf8');
          const subpath = edition ? `@player.style/${skin}/live` : `@player.style/${skin}`;

          expect(tsx.startsWith("'use client';\n")).toBe(true);
          expect(tsx).toContain(`// Source-owned copy of ${subpath}. Import './skin.css' next to it.`);
          expect(tsx).toMatch(/export function \w+Skin\b/);
        });

        if (preset) {
          it('documents the live-video host', () => {
            const readme = readFileSync(join(dir, 'README.md'), 'utf8');

            expect(readme).toContain("import '@videojs/html/live-video/player';");
            expect(readme).toContain('LiveVideoPlayer');
          });
        }
      });
    }

    describe.runIf(live)(`${skin} live edition`, () => {
      it('has all three live sources beside the on-demand ones', () => {
        for (const path of Object.values(EDITIONS.live)) expect(existsSync(join(skinDir, path)), path).toBe(true);
      });

      it.runIf(existsSync(join(skinDir, 'dist/live.js')))(
        'builds dist/live.js, dist/live-react.js and their types',
        () => {
          for (const file of [
            'dist/live.js',
            'dist/live-react.js',
            'dist/types/live/html/index.d.ts',
            'dist/types/live/react/index.d.ts',
            'dist/open/live/skin.html',
          ]) {
            expect(existsSync(join(skinDir, file)), file).toBe(true);
          }
        }
      );

      it('exports ./live and ./live/react and marks dist/live.js as a side effect', () => {
        const pkg = JSON.parse(readFileSync(join(skinDir, 'package.json'), 'utf8')) as {
          sideEffects: string[];
          exports: Record<string, { types: string; default: string } | string>;
        };

        expect(pkg.exports['./live']).toEqual({
          types: './dist/types/live/html/index.d.ts',
          default: './dist/live.js',
        });
        expect(pkg.exports['./live/react']).toEqual({
          types: './dist/types/live/react/index.d.ts',
          default: './dist/live-react.js',
        });
        expect(pkg.sideEffects).toContain('./dist/live.js');
      });

      it('is listed in the root package as a side effect', () => {
        const root = JSON.parse(readFileSync(join(skinsDir, '../package.json'), 'utf8')) as { sideEffects: string[] };

        expect(root.sideEffects).toContain(`./skins/${skin}/dist/live.js`);
      });
    });
  }
});
