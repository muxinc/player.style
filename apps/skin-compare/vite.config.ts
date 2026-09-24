import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { defineConfig, type Plugin, searchForWorkspaceRoot } from 'vite-plus';

/* Lightning CSS as Vite+ resolves it; the harness takes no dependency of its own on it. */
const require = createRequire(import.meta.resolve('vite-plus'));

interface LightningCss {
  transform(options: { filename: string; code: Uint8Array; minify: boolean }): { code: Uint8Array };
}

/**
 * Run the stylesheet the React pane imports through Lightning CSS, as Next (Turbopack), Vite's `lightningcss`
 * transformer and Tailwind 4 do on a consumer's page. That pipeline folds `translate`/`scale`/`rotate` into `transform`
 * and reorders declarations, so a skin that only works raw breaks on the site but not here. The HTML pane's `?inline`
 * import stays raw, as the published element ships it. `SKIN_COMPARE_CSS=raw` turns this and the host reset off.
 */
function hostCssPipeline(): Plugin {
  return {
    name: 'skin-compare:host-css-pipeline',
    enforce: 'pre',
    apply: () => process.env.SKIN_COMPARE_CSS !== 'raw',
    async transform(code, id) {
      if (!/\/skins\/[^/]+\/src\/skin\.css$/.test(id)) return null;

      const { transform } = require('lightningcss') as LightningCss;
      const result = transform({ filename: id, code: Buffer.from(code), minify: true });

      return { code: Buffer.from(result.code).toString(), map: null };
    },
  };
}

const HOST_RESET = 'virtual:host-reset.css';

/** `--theme(--name, fallback)` → `fallback`, balancing parentheses, since the preflight is read without Tailwind. */
function resolveThemeCalls(css: string): string {
  let out = '';
  let index = 0;

  for (let start = css.indexOf('--theme(', index); start !== -1; start = css.indexOf('--theme(', index)) {
    let depth = 1;
    let end = start + '--theme('.length;

    for (; depth; end++) {
      if (css[end] === '(') depth++;
      else if (css[end] === ')') depth--;
    }

    const args = css.slice(start + '--theme('.length, end - 1);

    out += css.slice(index, start) + args.slice(args.indexOf(',') + 1).trim();
    index = end;
  }
  return out + css.slice(index);
}

/**
 * The site's page-level reset, for the React pane: Tailwind 4's preflight in `@layer base`, as the site's
 * `@import "tailwindcss"` puts it. Read from the site's own Tailwind; an empty stylesheet when the site has none.
 */
function hostReset(): Plugin {
  return {
    name: 'skin-compare:host-reset',
    resolveId: (id) => (id === HOST_RESET ? `\0${HOST_RESET}` : null),
    load(id) {
      if (id !== `\0${HOST_RESET}` || process.env.SKIN_COMPARE_CSS === 'raw')
        return id === `\0${HOST_RESET}` ? '' : null;

      try {
        const site = createRequire(join(import.meta.dirname, '../../site/package.json'));

        return `@layer theme, base, components, utilities;\n@layer base {\n${resolveThemeCalls(readFileSync(site.resolve('tailwindcss/preflight.css'), 'utf8'))}\n}\n`;
      } catch {
        return '';
      }
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [hostCssPipeline(), hostReset()],
  server: {
    port: 5199,
    // The panes import the skins' sources straight from `skins/*`, outside this app's root.
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },
  resolve: {
    // One copy of React and of the Video.js packages, whichever package the import comes from.
    dedupe: ['react', 'react-dom', '@videojs/react', '@videojs/html'],
  },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        original: 'original.html',
        html: 'html.html',
        react: 'react.html',
      },
    },
  },
});
