import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { defineConfig, type Plugin, type UserConfig } from 'vite-plus';

export interface SkinConfigOptions {
  /** The skin package directory, normally `import.meta.dirname` from its `vite.config.ts`. */
  dir: string;
}

/** Modules a skin never bundles: the Video.js packages and React are peer dependencies of every skin. */
const EXTERNALS = [/^@videojs\//, 'react', 'react/jsx-runtime', 'react-dom'];

/**
 * Ship the shared stylesheet as `dist/skin.css` so React consumers can import it. The HTML entry inlines the same file
 * through a `?inline` import, so the stylesheet is authored once and published twice.
 */
function copySkinCss(dir: string): Plugin {
  return {
    name: 'player-style:copy-skin-css',
    async writeBundle(options) {
      const outDir = options.dir ?? join(dir, 'dist');

      await mkdir(outDir, { recursive: true });
      await copyFile(join(dir, 'src/skin.css'), join(outDir, 'skin.css'));
    },
  };
}

/**
 * The Vite library build shared by every skin package: `src/html/index.ts` becomes `dist/html.js` and
 * `src/react/index.tsx` becomes `dist/react.js`, both ES modules with the Video.js packages and React left external.
 * Declaration files come from `tsc -p tsconfig.build.json` in the skin's `build` script.
 */
export function defineSkinConfig({ dir }: SkinConfigOptions): UserConfig {
  return defineConfig({
    root: dir,
    plugins: [copySkinCss(dir)],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Class names are the skin's public styling surface, so nothing is mangled.
      minify: false,
      target: 'es2022',
      lib: {
        entry: {
          html: join(dir, 'src/html/index.ts'),
          react: join(dir, 'src/react/index.tsx'),
        },
        formats: ['es'],
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: EXTERNALS,
        onLog(level, log, handler) {
          // Rolldown keeps the React entry's `'use client'` in place; the warning that it might not is noise here.
          if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;

          handler(level, log);
        },
      },
    },
  });
}
