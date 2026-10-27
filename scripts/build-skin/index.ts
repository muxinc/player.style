import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';

import { defineConfig, type Plugin, type UserConfig } from 'vite-plus';

import {
  FRAMEWORKS,
  type Framework,
  MEDIA_PLACEHOLDER,
  type Preset,
  PRESETS,
  type SkinCatalog,
  skinBuildKey,
} from './names.ts';

export * from './names.ts';

/** `skin.json`, as `npx @videojs/cli skin create` writes it. `preset` names the first run's preset only. */
export interface SkinManifest {
  name: string;
  framework: Framework;
  styling: 'css' | 'tailwind';
  preset: Preset;
  base: string;
  videojs: string;
  source: string;
}

/** Modules a skin never bundles: the Video.js packages and React are the consumer's. */
const EXTERNALS = [/^@videojs\//, /^react($|\/)/, /^react-dom($|\/)/];

/** An HTML entry's id: a file that does not exist in the preset folder, which `skinEntries` serves. */
const HTML_ENTRY = '/skin-html-entry.js';

/** The repository's `skins/` directory. */
export const SKINS_DIR = resolve(import.meta.dirname, '../../skins');

export interface SkinPackage {
  /** The skin's folder under `skins/`, which is its slug everywhere: registry item, site page, class prefix. */
  name: string;
  framework: Framework;
  dir: string;
}

/** Every skin package: `skins/<name>/<framework>/skin.json`, by name then framework. */
export function skinPackages(skinsDir = SKINS_DIR): SkinPackage[] {
  return readdirSync(skinsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((name) =>
      FRAMEWORKS.filter((framework) => existsSync(join(skinsDir, name, framework, 'skin.json'))).map((framework) => ({
        name,
        framework,
        dir: join(skinsDir, name, framework),
      }))
    );
}

/** The `@videojs/*` version the workspace catalog pins (`pnpm-workspace.yaml`), which every `skin.json` must name. */
export function workspaceVideojsVersion(repoDir = resolve(SKINS_DIR, '..')): string {
  const yaml = readFileSync(join(repoDir, 'pnpm-workspace.yaml'), 'utf8');
  const version = /^\s+'?@videojs\/react'?:\s*'?([^'\s]+)'?\s*$/m.exec(yaml)?.[1];
  if (!version) throw new Error('pnpm-workspace.yaml has no catalog entry for @videojs/react.');

  return version;
}

export function readSkinManifest(dir: string): SkinManifest {
  return JSON.parse(readFileSync(join(dir, 'skin.json'), 'utf8')) as SkinManifest;
}

/** `skins/<name>/catalog.json`. */
export function readSkinCatalog(name: string, skinsDir = SKINS_DIR): SkinCatalog {
  return JSON.parse(readFileSync(join(skinsDir, name, 'catalog.json'), 'utf8')) as SkinCatalog;
}

/** Every file under `dir`, as `/`-separated paths relative to it, sorted; nothing when it does not exist. */
export async function listSourceFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];

  return (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort();
}

/** The presets a skin package has, from its `src/<preset>/` folders, in `PRESETS` order. */
export function findPresets(dir: string): Preset[] {
  return PRESETS.filter((preset) => existsSync(join(dir, 'src', preset)));
}

/**
 * HTML entries are virtual: each registers the preset's elements (`skin.ts`) and default-exports its `skin.html`, so a
 * page loads one module and pastes the string into the player. A Tailwind skin's entries, React or HTML, also import
 * the project's Tailwind entry (`src/skin.css`), which `skin create` otherwise loads only in its workbench.
 */
function skinEntries(dir: string, manifest: SkinManifest): Plugin {
  const tailwind = manifest.styling === 'tailwind' ? `import ${JSON.stringify(join(dir, 'src/skin.css'))};\n` : '';
  const reactEntries = new Set(findPresets(dir).map((preset) => join(dir, 'src', preset, 'skin.tsx')));

  return {
    name: 'build-skin:entries',
    resolveId: (source) => (source.endsWith(HTML_ENTRY) ? `\0${source}` : undefined),
    load(id) {
      if (!id.startsWith('\0') || !id.endsWith(HTML_ENTRY)) return undefined;

      const presetDir = id.slice(1, -HTML_ENTRY.length);
      const html = join(presetDir, 'skin.html');
      if (!readFileSync(html, 'utf8').includes(MEDIA_PLACEHOLDER)) {
        throw new Error(`${html} has no media placeholder: keep \`${MEDIA_PLACEHOLDER}\` where the media goes.`);
      }

      return `${tailwind}import ${JSON.stringify(join(presetDir, 'skin.ts'))};\nexport { default } from ${JSON.stringify(`${html}?raw`)};\n`;
    },
    transform(code, id) {
      if (!tailwind || !reactEntries.has(id)) return undefined;

      const directive = /^\s*(?:\/\*[\s\S]*?\*\/\s*)?(['"])use client\1;?\n/.exec(code)?.[0] ?? '';

      return { code: directive + tailwind + code.slice(directive.length), map: null };
    },
  };
}

/**
 * Vite's library build writes each entry's CSS beside it without importing it. Prepend the imports (after a leading
 * `'use client'`, which must stay first), so `dist/<preset>.js` loads its own styles, as the source module does.
 */
function entryCssImport(): Plugin {
  return {
    name: 'build-skin:entry-css-import',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.isEntry) continue;

        const css = new Set<string>();
        const visit = (fileName: string) => {
          const imported = bundle[fileName];
          if (imported?.type !== 'chunk') return;

          for (const file of imported.viteMetadata?.importedCss ?? []) css.add(file);
          for (const next of imported.imports) visit(next);
        };

        visit(chunk.fileName);
        if (!css.size) continue;

        const from = dirname(chunk.fileName);
        const imports = [...css].map((file) => `import './${posix.relative(from, file)}';\n`).join('');
        const directive = /^(['"])use client\1;?\n/.exec(chunk.code)?.[0] ?? '';

        chunk.code = directive + imports + chunk.code.slice(directive.length);
      }
    },
  };
}

/** Where the site reads which preset modules are built, and loads them from (`site/lib/skins.ts`, `skin-builds.ts`). */
export const SITE_GENERATED_DIR = resolve(SKINS_DIR, '../site/lib/generated');

/**
 * Write the site's index of built preset modules: `skin-builds.json` (`{ "<name>/<framework>/<preset>": true }`) and
 * `skin-loaders.ts`, one literal `import()` per module. Literal imports are what let Turbopack give each skin a chunk
 * of its own that loads with its preview; a glob over every skin's `dist/` puts every skin in the chunks of every page.
 * The files are generated (gitignored) and rewritten only when they change.
 */
export function writeSkinBuildIndex(skinsDir = SKINS_DIR, outDir = SITE_GENERATED_DIR): void {
  const keys = skinPackages(skinsDir).flatMap(({ name, framework, dir }) =>
    findPresets(dir)
      .filter((preset) => existsSync(join(dir, 'dist', `${preset}.js`)))
      .map((preset) => skinBuildKey(name, framework, preset))
  );
  const json = `${JSON.stringify(Object.fromEntries(keys.map((key) => [key, true])), null, 2)}\n`;
  const loaders = [
    '// Generated by scripts/build-skin after every skin build (`pnpm build:skins`); do not edit.',
    'const loaders: Record<string, () => Promise<Record<string, unknown>>> = {',
    ...keys.map((key) => {
      const [name, framework, preset] = key.split('/');

      return `  '${key}': () => import('../../../skins/${name}/${framework}/dist/${preset}.js'),`;
    }),
    '};',
    '',
    'export default loaders;',
    '',
  ].join('\n');

  mkdirSync(outDir, { recursive: true });
  for (const [file, content] of [
    ['skin-builds.json', json],
    ['skin-loaders.ts', loaders],
  ] as const) {
    const path = join(outDir, file);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) writeFileSync(path, content);
  }
}

/** After a package's build, the site's index of built modules is written again from what is on disk. */
function siteBuildIndex(): Plugin {
  return { name: 'build-skin:site-build-index', closeBundle: () => writeSkinBuildIndex() };
}

/**
 * The Vite library build every skin package shares. It reads `skin.json` for the framework and builds one entry per
 * `src/<preset>/` folder: `src/<preset>/skin.tsx` for React, `skin.ts` plus `skin.html` for HTML. Each becomes
 * `dist/<preset>.js` and `dist/<preset>.css` (a stylesheet several presets import becomes one shared chunk named after
 * it), with the Video.js packages and React left external. `@/` resolves to the package's own `src/`, as in the
 * `skin create` project.
 */
export function defineSkinConfig({ dir }: { dir: string }): UserConfig {
  const manifest = readSkinManifest(dir);
  const presets = findPresets(dir);
  if (!presets.length) throw new Error(`${dir} has no src/<preset>/ folder (${PRESETS.join(', ')}).`);

  const entry = Object.fromEntries(
    presets.map((preset) => [
      preset,
      join(dir, 'src', preset, manifest.framework === 'react' ? 'skin.tsx' : HTML_ENTRY.slice(1)),
    ])
  );

  return defineConfig({
    root: dir,
    plugins: [
      skinEntries(dir, manifest),
      entryCssImport(),
      siteBuildIndex(),
      manifest.styling === 'tailwind' && import('@tailwindcss/vite').then((module) => module.default()),
    ],
    resolve: { alias: { '@': join(dir, 'src') } },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Class names are the skin's public styling surface, so nothing is mangled.
      minify: false,
      target: 'es2022',
      cssCodeSplit: true,
      lib: { entry, formats: ['es'], fileName: (_format, name) => `${name}.js` },
      rollupOptions: {
        external: EXTERNALS,
        output: { assetFileNames: '[name][extname]' },
        onLog(level, log, handler) {
          // Rolldown keeps the React entries' `'use client'` in place; the warning that it might not is noise here.
          if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;

          handler(level, log);
        },
      },
    },
  });
}
