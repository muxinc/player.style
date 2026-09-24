import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin } from 'vite-plus';
import { describe, expect, it } from 'vite-plus/test';

import {
  createOpenEdition,
  createRegistration,
  createSourceOwnedHtml,
  defineSkinConfig,
  detectPreset,
  MEDIA_PLACEHOLDER,
  SOURCES,
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

/** Minimal sources for `createOpenEdition`, with the package name and the root's `data-preset` as the variables. */
function sources(preset: string, name = '@player.style/example') {
  return {
    name,
    template: `<media-container class="media-skin ps-example" data-theme="example" data-preset="${preset}">\n  <slot></slot>\n</media-container>`,
    css: '.ps-example {}',
    htmlEntry: "import '@videojs/html/ui/container';\nimport markup from './template.html?raw';",
    reactEntry: "'use client';\n\nexport function ExampleSkin() {\n  return null;\n}",
  };
}

/** A throwaway skin package on disk, with its stylesheet wherever `stylesheet` says. */
async function scaffoldSkin(stylesheet: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'build-skin-'));
  const { template, css, htmlEntry, reactEntry } = sources('video');
  const files: Record<string, string> = {
    'package.json': JSON.stringify({ name: '@player.style/example' }),
    [SOURCES.template]: template,
    [SOURCES.html]: htmlEntry,
    [SOURCES.react]: reactEntry,
    [stylesheet]: css,
  };

  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(dir, path, '..'), { recursive: true });
    await writeFile(join(dir, path), content);
  }

  return dir;
}

/** Run every `writeBundle` hook of a skin config as Vite would after emitting `outDir`. */
async function writeBundle(config: ReturnType<typeof defineSkinConfig>, outDir: string): Promise<void> {
  for (const plugin of config.plugins as Plugin[]) {
    const hook = plugin.writeBundle;
    const handler = typeof hook === 'function' ? hook : hook?.handler;

    // Neither plugin reads the hook context or the bundle, so an empty context and bundle stand in for Vite's.
    await (handler as ((this: unknown, options: { dir: string }, bundle: object) => unknown) | undefined)?.call(
      {},
      { dir: outDir },
      {}
    );
  }
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
  it('documents the video preset', () => {
    const files = createOpenEdition(sources('video'));

    expect(files['README.md']).toContain('# @player.style/example, open edition');
    expect(files['README.md']).toContain("import '@videojs/html/video/player';");
    expect(files['README.md']).toContain("import { Video, VideoPlayer } from '@videojs/react/video';");
    expect(files['README.md']).toContain('<video-player>');
    expect(files['README.md']).toContain('The complete stylesheet, class selectors scoped under `.ps-example`');
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

  it('documents the live-video preset for a live edition package', () => {
    const files = createOpenEdition(sources('live-video', '@player.style/example-live'));

    expect(files['README.md']).toContain('# @player.style/example-live, open edition');
    expect(files['README.md']).toContain('This is a live edition, on the Video.js live-video preset');
    expect(files['README.md']).toContain("import '@videojs/html/live-video/player';");
    expect(files['README.md']).toContain("import { Video, LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(files['README.md']).toContain('<live-video-player>');
    expect(files['README.md']).toContain('your <video> where the media placeholder is');
    // The stylesheet is the on-demand sibling's, so the scope it names is the sibling's root class, not the slug.
    expect(files['README.md']).toContain('The complete stylesheet, class selectors scoped under `.ps-example`');
    expect(files['README.md']).toContain('the same file as `@player.style/example-live/skin.css`');
    expect(files['skin.html']).toContain('@player.style/example-live, open edition');
    expect(files['skin.html']).toContain('Paste it inside <live-video-player>');
    expect(files['register.ts']).toContain("import '@videojs/html/live-video/player';");
    expect(files['register.ts']).toContain('<live-video-player>');
    expect(files['Skin.tsx']).toContain(
      "// Source-owned copy of @player.style/example-live. Import './skin.css' next to it."
    );
  });

  it('refuses a React entry without the client directive', () => {
    expect(() => createOpenEdition({ ...sources('video'), reactEntry: 'export function ExampleSkin() {}' })).toThrow(
      /use client/
    );
  });
});

describe('defineSkinConfig', () => {
  it('builds html and react entries into dist as ES modules', () => {
    const config = defineSkinConfig({ dir: '/skins/example' });
    const lib = config.build?.lib;
    if (!lib || typeof lib.fileName !== 'function') throw new Error('expected a library build');

    expect(lib.entry).toEqual({
      html: '/skins/example/src/html/index.ts',
      react: '/skins/example/src/react/index.tsx',
    });
    expect(lib.formats).toEqual(['es']);
    expect(lib.fileName('es', 'react')).toBe('react.js');
    expect(config.build?.outDir).toBe('dist');
    expect(config.build?.emptyOutDir).toBe(true);
  });

  it('ships src/skin.css as dist/skin.css and dist/open/skin.css by default', async () => {
    const dir = await scaffoldSkin(SOURCES.stylesheet);
    const outDir = join(dir, 'dist');

    await writeBundle(defineSkinConfig({ dir }), outDir);

    expect(await readFile(join(outDir, 'skin.css'), 'utf8')).toBe('.ps-example {}');
    expect(await readFile(join(outDir, 'open/skin.css'), 'utf8')).toBe('.ps-example {}');
    expect(readdirSync(join(outDir, 'open')).sort()).toEqual([
      'README.md',
      'Skin.tsx',
      'register.ts',
      'skin.css',
      'skin.html',
    ]);
  });

  it('ships the stylesheet the `stylesheet` option names, wherever it sits', async () => {
    const dir = await scaffoldSkin('../shared/skin.css');
    const outDir = join(dir, 'dist');

    await writeBundle(defineSkinConfig({ dir, stylesheet: '../shared/skin.css' }), outDir);

    expect(existsSync(join(dir, 'src/skin.css'))).toBe(false);
    expect(await readFile(join(outDir, 'skin.css'), 'utf8')).toBe('.ps-example {}');
    expect(await readFile(join(outDir, 'open/skin.css'), 'utf8')).toBe('.ps-example {}');
  });
});

describe('dist/open', () => {
  it('exists for every skin once `pnpm build:skins` has run', () => {
    const missing = skins.filter((skin) => !existsSync(join(skinsDir, skin, 'dist/open/skin.html')));

    expect(missing, 'run `pnpm build:skins` first').toEqual([]);
  });

  for (const skin of skins) {
    const skinDir = join(skinsDir, skin);
    const dir = join(skinDir, 'dist/open');
    const built = existsSync(join(dir, 'skin.html'));
    // A live edition package keeps its on-demand sibling's root class, theme name and stylesheet.
    const live = skin.endsWith('-live');
    const base = live ? skin.slice(0, -'-live'.length) : skin;
    const stylesheet = live ? join(skinsDir, base, 'src/skin.css') : join(skinDir, 'src/skin.css');

    describe.runIf(built)(skin, () => {
      it('ships the four source files and a README', () => {
        expect(readdirSync(dir).sort()).toEqual(['README.md', 'Skin.tsx', 'register.ts', 'skin.css', 'skin.html']);
      });

      it('has light-DOM markup with one media placeholder and no slots', () => {
        const html = readFileSync(join(dir, 'skin.html'), 'utf8');

        expect(html).not.toContain('<slot');
        expect(html.split(MEDIA_PLACEHOLDER).length - 1).toBe(1);
        expect(html).toMatch(new RegExp(`<media-container class="media-skin ps-${base}" data-theme="${base}"`));
        if (live) expect(html).toMatch(/<media-container [^>]*data-preset="live-video"/);
      });

      it(live ? "copies the on-demand sibling's stylesheet unchanged" : 'copies the stylesheet unchanged', () => {
        expect(readFileSync(join(dir, 'skin.css'), 'utf8')).toBe(readFileSync(stylesheet, 'utf8'));
        expect(readFileSync(join(skinDir, 'dist/skin.css'), 'utf8')).toBe(readFileSync(stylesheet, 'utf8'));
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

        expect(tsx.startsWith("'use client';\n")).toBe(true);
        expect(tsx).toContain(`// Source-owned copy of @player.style/${skin}. Import './skin.css' next to it.`);
        expect(tsx).toMatch(/export function \w+Skin\b/);
      });

      if (live) {
        it('documents the live-video host', () => {
          const readme = readFileSync(join(dir, 'README.md'), 'utf8');

          expect(readme).toContain("import '@videojs/html/live-video/player';");
          expect(readme).toContain('LiveVideoPlayer');
        });
      }
    });

    describe(`${skin} package`, () => {
      const read = (name: string) =>
        JSON.parse(readFileSync(join(skinsDir, name, 'package.json'), 'utf8')) as {
          name: string;
          main?: string;
          sideEffects: string[];
          exports: Record<string, unknown>;
        };
      const pkg = read(skin);

      it('exports the HTML edition at ./html beside ./react, with no bare entry that would read as the default', () => {
        expect(pkg.name).toBe(`@player.style/${skin}`);
        expect(pkg.main).toBeUndefined();
        expect(pkg.exports).toEqual({
          './html': { types: './dist/types/html/index.d.ts', default: './dist/html.js' },
          './react': { types: './dist/types/react/index.d.ts', default: './dist/react.js' },
          './skin.css': './dist/skin.css',
          './open/*': './dist/open/*',
          './package.json': './package.json',
        });
        expect(pkg.sideEffects).toEqual(['./dist/html.js']);
      });

      it('documents the HTML edition through its /html entry', () => {
        const readme = readFileSync(join(skinDir, 'README.md'), 'utf8');

        expect(readme).toContain(`import '@player.style/${skin}/html';`);
        expect(readme).not.toContain(`import '@player.style/${skin}';`);
      });
    });

    describe.runIf(live)(`${skin} live package`, () => {
      it('is named after its on-demand sibling and ships the same export map', () => {
        const read = (name: string) =>
          JSON.parse(readFileSync(join(skinsDir, name, 'package.json'), 'utf8')) as {
            exports: Record<string, unknown>;
          };

        expect(read(skin).exports).toEqual(read(base).exports);
      });

      it('is listed in the root package as a dependency and a side effect', () => {
        const root = JSON.parse(readFileSync(join(skinsDir, '../package.json'), 'utf8')) as {
          dependencies: Record<string, string>;
          sideEffects: string[];
        };

        expect(root.dependencies[`@player.style/${skin}`]).toBe('1.0.0-alpha.0');
        expect(root.sideEffects).toContain(`./skins/${skin}/dist/html.js`);
      });
    });
  }
});

describe('player.style package', () => {
  const root = JSON.parse(readFileSync(join(skinsDir, '../package.json'), 'utf8')) as {
    exports: Record<string, unknown>;
    typesVersions: Record<string, Record<string, string[]>>;
  };

  it('re-exports every skin at <name>/html and <name>/react, with no bare <name> entry', () => {
    expect(root.exports).toEqual({
      './*/html': { types: './skins/*/dist/types/html/index.d.ts', default: './skins/*/dist/html.js' },
      './*/react': { types: './skins/*/dist/types/react/index.d.ts', default: './skins/*/dist/react.js' },
      './*/skin.css': './skins/*/dist/skin.css',
      './*/open/skin.html': './skins/*/dist/open/skin.html',
      './*/open/skin.css': './skins/*/dist/open/skin.css',
      './*/open/register.ts': './skins/*/dist/open/register.ts',
      './*/open/Skin.tsx': './skins/*/dist/open/Skin.tsx',
      './*/open/README.md': './skins/*/dist/open/README.md',
      './package.json': './package.json',
      '.': './index.js',
    });
    expect(root.typesVersions).toEqual({
      '*': {
        '*/html': ['./skins/*/dist/types/html/index.d.ts'],
        '*/react': ['./skins/*/dist/types/react/index.d.ts'],
      },
    });
  });
});
