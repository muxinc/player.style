import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { defineConfig, type Plugin, type UserConfig } from 'vite-plus';

export interface SkinConfigOptions {
  /** The skin package directory, normally `import.meta.dirname` from its `vite.config.ts`. */
  dir: string;
  /**
   * The stylesheet, relative to `dir`; `src/skin.css` by default. A live edition package (`skins/<name>-live`) points
   * it at the on-demand package's file (`../<name>/src/skin.css`) so both ship one stylesheet.
   */
  stylesheet?: string;
}

/** Modules a skin never bundles: the Video.js packages and React are peer dependencies of every skin. */
const EXTERNALS = [/^@videojs\//, 'react', 'react/jsx-runtime', 'react-dom'];

/** What stands in for the default `<slot>` in the open edition's markup. */
export const MEDIA_PLACEHOLDER = '<!-- Add a compatible media element here. -->';

/** The sources of a skin package, relative to its directory. */
export const SOURCES = {
  template: 'src/html/template.html',
  html: 'src/html/index.ts',
  react: 'src/react/index.tsx',
  stylesheet: 'src/skin.css',
} as const;

/** The Video.js preset a skin's root `data-preset` names, and the host player the package documents. */
export const PRESETS = {
  video: {
    player: 'video-player',
    playerImport: '@videojs/html/video/player',
    reactPlayer: 'VideoPlayer',
    reactMedia: 'Video',
    reactImport: '@videojs/react/video',
    media: 'video',
  },
  audio: {
    player: 'audio-player',
    playerImport: '@videojs/html/audio/player',
    reactPlayer: 'AudioPlayer',
    reactMedia: 'Audio',
    reactImport: '@videojs/react/audio',
    media: 'audio',
  },
  'live-video': {
    player: 'live-video-player',
    playerImport: '@videojs/html/live-video/player',
    reactPlayer: 'LiveVideoPlayer',
    reactMedia: 'Video',
    reactImport: '@videojs/react/live-video',
    media: 'video',
  },
} as const;

export type Preset = keyof typeof PRESETS;

/** The preset a template declares on its root `media-container`; `video` when it declares none. */
export function detectPreset(template: string): Preset {
  const preset = template.match(/<media-container\b[^>]*\bdata-preset="([^"]+)"/)?.[1];
  if (preset && preset in PRESETS) return preset as Preset;

  return 'video';
}

/**
 * Ship the stylesheet as `dist/skin.css` so React consumers can import it. The HTML entry inlines the same file
 * through a `?inline` import, so the stylesheet is authored once and published twice (and a live edition package
 * publishes its sibling's copy under its own name).
 */
function copySkinCss(dir: string, stylesheet: string): Plugin {
  return {
    name: 'player-style:copy-skin-css',
    async writeBundle(options) {
      const outDir = options.dir ?? join(dir, 'dist');

      await mkdir(outDir, { recursive: true });
      await copyFile(join(dir, stylesheet), join(outDir, 'skin.css'));
    },
  };
}

/**
 * Turn the shadow-DOM template into light-DOM markup a page owns, as Video.js 10's registry does for its own skins:
 * the default `<slot>` becomes a placeholder comment for the media element, and every named slot is unwrapped into a
 * `<!-- name -->` marker followed by its fallback content (nothing, when the slot had none).
 */
export function createSourceOwnedHtml(template: string): string {
  const mediaSlot = /<slot>\s*<\/slot>/;
  if (!mediaSlot.test(template)) throw new Error('Skin template has no default media slot.');

  return (
    template
      // A comment introducing the default slot ("the media lands here") would only repeat the placeholder.
      .replace(/^([ \t]*)<!--[^\n]*-->\n(?=\1<slot>\s*<\/slot>)/m, '')
      .replace(mediaSlot, MEDIA_PLACEHOLDER)
      .replace(
        /^([ \t]*)<slot\b[^>]*\bname="([^"]+)"[^>]*>([\s\S]*?)<\/slot>/gm,
        (_match, indent: string, name: string, inner: string) => {
          const marker = `${indent}<!-- ${name} -->`;
          const content = inner.trim();
          if (!content) return marker;

          // The fallback sat one level inside the slot; bring it back out to the slot's own indentation.
          const lines = content.split('\n').map((line, index) => {
            if (index === 0) return line;

            return line.startsWith(`${indent}  `) ? line.slice(2) : line;
          });

          return `${marker}\n${indent}${lines.join('\n')}`;
        }
      )
  );
}

/** The `@videojs/html` imports (elements, icons, i18n) and any `registerIcons()` calls the HTML entry makes. */
export function createRegistration(htmlEntry: string): string {
  const imports = [...htmlEntry.matchAll(/^import\s+(?:[\s\S]*?\s+from\s+)?['"]@videojs\/html[^'"]*['"];?$/gm)].map(
    (match) => match[0]
  );
  const registrations = [...htmlEntry.matchAll(/^registerIcons\([\s\S]*?\);$/gm)].map((match) => match[0]);

  return [...imports, ...(registrations.length ? ['', ...registrations] : [])].join('\n');
}

interface OpenEditionSources {
  name: string;
  template: string;
  css: string;
  htmlEntry: string;
  reactEntry: string;
}

interface OpenEditionFiles {
  'skin.html': string;
  'skin.css': string;
  'register.ts': string;
  'Skin.tsx': string;
  'README.md': string;
}

/**
 * The open edition: the same skin as source files a project owns and edits, next to the packaged element and
 * component. Video.js 10 ships its own skins this way through its registry; this is the equivalent for a third-party
 * package, without a registry. A package on the live-video preset (a `<name>-live` skin) documents that preset's host
 * (`<live-video-player>`, `LiveVideoPlayer`) in place of the video one.
 */
export function createOpenEdition({
  name,
  template,
  css,
  htmlEntry,
  reactEntry,
}: OpenEditionSources): OpenEditionFiles {
  const slug = name.replace(/^@player\.style\//, '');
  const preset = detectPreset(template);
  const { player, playerImport, reactPlayer, reactMedia, reactImport, media } = PRESETS[preset];
  const component = reactEntry.match(/export function (\w+Skin)\b/)?.[1] ?? 'Skin';
  // A live edition package keeps its on-demand sibling's root class, so read it off the markup rather than the slug.
  const rootClass = template.match(/<media-container\b[^>]*\bclass="media-skin (ps-[\w-]+)"/)?.[1] ?? `ps-${slug}`;
  const presetNote =
    preset === 'live-video'
      ? `\nThis is a live edition, on the Video.js live-video preset: it sits inside \`<${player}>\` /\n\`${reactPlayer}\` and shows a Live button in place of the time controls.\n`
      : '';

  const markup = template.replace(/^<!--[\s\S]*?-->\s*/, '');
  const html = `<!--
  ${name}, open edition: the skin as light-DOM markup.
  Paste it inside <${player}> and put your media element where the placeholder comment is. Needs register.ts
  imported and skin.css on the page; see README.md beside it.
-->
${createSourceOwnedHtml(markup)}`;

  const register = `/*
 * ${name}, open edition. Registers the Video.js elements skin.html uses.
 *
 * import '${playerImport}';
 * import './register';
 * import './skin.css';
 *
 * <${player}>
 *   ...skin.html, with your <${media}> in place of the media placeholder...
 * </${player}>
 */
${createRegistration(htmlEntry)}
`;

  const [directive, ...rest] = reactEntry.split('\n');
  if (directive !== "'use client';") throw new Error(`${name}: the React entry must start with 'use client'.`);

  const tsx = [directive, '', `// Source-owned copy of ${name}. Import './skin.css' next to it.`, ...rest].join('\n');

  const readme = `# ${name}, open edition

The skin as files you own and edit, generated from the package sources at build time. Both editions share
\`skin.css\`; copy the ones you need into your project.
${presetNote}
| File | Contents |
| --- | --- |
| \`skin.html\` | Light-DOM markup: the packaged element's template with the default slot replaced by \`${MEDIA_PLACEHOLDER}\` and every named slot unwrapped behind a \`<!-- name -->\` marker. |
| \`skin.css\` | The complete stylesheet, class selectors scoped under \`.${rootClass}\`; the same file as \`${name}/skin.css\`. |
| \`register.ts\` | The \`@videojs/html/ui/*\` imports (and icon registration) the markup needs. |
| \`Skin.tsx\` | The React component (\`${component}\`), a copy of the package's React edition. |

## HTML

\`\`\`ts
import '${playerImport}';
import './register';
import './skin.css';
\`\`\`

\`\`\`html
<${player}>
  <!-- paste skin.html here and put your <${media}> where the media placeholder is -->
</${player}>
\`\`\`

## React

\`\`\`tsx
import { ${reactMedia}, ${reactPlayer} } from '${reactImport}';
import { ${component} } from './Skin';
import './skin.css';

export function Player() {
  return (
    <${reactPlayer}>
      <${component}>
        <${reactMedia} src="..." />
      </${component}>
    </${reactPlayer}>
  );
}
\`\`\`
`;

  return { 'skin.html': html, 'skin.css': css, 'register.ts': register, 'Skin.tsx': tsx, 'README.md': readme };
}

/** Write `dist/open/` from the sources after the library build. */
function emitOpenEdition(dir: string, stylesheet: string): Plugin {
  return {
    name: 'player-style:open-edition',
    async writeBundle(options) {
      const outDir = join(options.dir ?? join(dir, 'dist'), 'open');
      const read = (path: string) => readFile(join(dir, path), 'utf8');
      const { name } = JSON.parse(await read('package.json')) as { name: string };
      const files = createOpenEdition({
        name,
        template: await read(SOURCES.template),
        css: await read(stylesheet),
        htmlEntry: await read(SOURCES.html),
        reactEntry: await read(SOURCES.react),
      });

      await mkdir(outDir, { recursive: true });
      await Promise.all(Object.entries(files).map(([file, content]) => writeFile(join(outDir, file), content)));
    },
  };
}

/**
 * The Vite library build shared by every skin package: `src/html/index.ts` becomes `dist/html.js` and
 * `src/react/index.tsx` becomes `dist/react.js`, both ES modules with the Video.js packages and React left external.
 * Declaration files come from `tsc -p tsconfig.build.json` in the skin's `build` script
 * (`dist/types/{html,react}/index.d.ts`); `dist/skin.css` is a copy of the stylesheet and `dist/open/` holds the open
 * edition. A live edition is its own package beside the on-demand one (`skins/<name>-live`) with the same layout,
 * pointing `stylesheet` at the sibling's file.
 */
export function defineSkinConfig({ dir, stylesheet = SOURCES.stylesheet }: SkinConfigOptions): UserConfig {
  return defineConfig({
    root: dir,
    plugins: [copySkinCss(dir, stylesheet), emitOpenEdition(dir, stylesheet)],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Class names are the skin's public styling surface, so nothing is mangled.
      minify: false,
      target: 'es2022',
      lib: {
        entry: { html: join(dir, SOURCES.html), react: join(dir, SOURCES.react) },
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
