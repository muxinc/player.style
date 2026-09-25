import { type Registry, type RegistryItem, registryItemSchema, registrySchema } from 'shadcn/schema';

/** Where the site hosts the registry; item URLs are `${REGISTRY_ORIGIN}/r/<framework>/<name>.json`. */
export const REGISTRY_ORIGIN = 'https://player.style';

/** The `name` of every catalog's `registry.json`. */
export const REGISTRY_NAME = 'player.style';

/** The namespace a project maps to one catalog in its `components.json`: `shadcn add @player-style/yt`. */
export const REGISTRY_NAMESPACE = '@player-style';

/**
 * Where the CLI writes a skin's files: `@components/` is shadcn's placeholder for the project's `aliases.components`
 * (`src/components` in a Vite scaffold, `components` in a Next one), and the skin's item name is the directory.
 * Video.js 10 does the same with `@components/videojs/<preset>`.
 */
export const INSTALL_DIRECTORY = 'player-style';

/** The specifier the usage in an item's `docs` imports the installed files from, as Video.js 10's docs do. */
export const IMPORT_DIRECTORY = `@/components/${INSTALL_DIRECTORY}`;

/** One catalog per framework, as Video.js 10's registry splits its own skins. */
export const FRAMEWORKS = ['react', 'html'] as const;

export type RegistryFramework = (typeof FRAMEWORKS)[number];

/**
 * Every skin styles itself with one plain stylesheet, which Video.js 10 calls Vanilla CSS (its `/r/react/css` and
 * `/r/html` catalogs). There is no Tailwind variant, so neither catalog needs a styling segment in its URL.
 */
export const REGISTRY_STYLING = 'css';

/** The source file names in the order each catalog publishes them. */
export const CATALOG_FILES = {
  react: ['Skin.tsx', 'skin.css'],
  html: ['skin.html', 'register.ts', 'skin.css'],
} as const;

export type SourceFileName = (typeof CATALOG_FILES)[RegistryFramework][number];

/** The Video.js package each catalog's items install, pinned to the skin's exact peer range. */
export const FRAMEWORK_PACKAGES = {
  react: '@videojs/react',
  html: '@videojs/html',
} as const;

/** The Video.js presets a skin's root `data-preset` can name, and the host player each framework documents. */
export const PRESETS = {
  video: { player: 'video-player', reactPlayer: 'VideoPlayer', reactMedia: 'Video', entry: 'video', media: 'video' },
  audio: { player: 'audio-player', reactPlayer: 'AudioPlayer', reactMedia: 'Audio', entry: 'audio', media: 'audio' },
  'live-video': {
    player: 'live-video-player',
    reactPlayer: 'LiveVideoPlayer',
    reactMedia: 'Video',
    entry: 'live-video',
    media: 'video',
  },
  'live-audio': {
    player: 'live-audio-player',
    reactPlayer: 'LiveAudioPlayer',
    reactMedia: 'Audio',
    entry: 'live-audio',
    media: 'audio',
  },
} as const;

/** A skin's preset, which is also its use case (`video`, `audio`, `live-video`, `live-audio`). */
export type Preset = keyof typeof PRESETS;

/** Where each framework's docs explain playback adapters, which the usage in `docs` links to as Video.js 10's does. */
const MEDIA_SOURCES_DOCS = {
  react: 'https://videojs.org/docs/framework/react/concepts/media-sources/',
  html: 'https://videojs.org/docs/framework/html/concepts/media-sources/',
} as const satisfies Record<RegistryFramework, string>;

/** Titles the slug cannot spell on its own; every other skin is its slug in title case. */
const TITLES: Readonly<Record<string, string>> = {
  yt: 'YT',
  'x-mas': 'X-mas',
  'videojs-1': 'Video.js 1',
  'videojs-3': 'Video.js 3',
  'videojs-4': 'Video.js 4',
  'videojs-8': 'Video.js 8',
};

/** One skin's source files as the build reads them from `skins/<name>/dist/open` and `skins/<name>/package.json`. */
export interface SkinSource {
  /** The `skins/*` directory name, which is also the registry item name (`yt`, `microvideo-live`). */
  name: string;
  /** The npm package the source files were generated from (`@player.style/yt`). */
  package: string;
  version: string;
  description: string;
  /** The skin's page on player.style; the package's `homepage`. */
  homepage?: string | undefined;
  /** The package's `author` string (`@muxinc`). */
  author?: string | undefined;
  /** The package's peer ranges; the item pins `@videojs/react` or `@videojs/html` from here. */
  peerDependencies: Readonly<Record<string, string>>;
  /** The source files by name. */
  files: Readonly<Record<SourceFileName, string>>;
}

/**
 * One entry of a catalog's `catalog.json`, the index of what the registry hosts. It follows Video.js 10's catalog
 * entries (`label`, `preset`, `media`, `live`, `component`, `registryItem`, `directory`) and adds what a third-party
 * skin needs on top: the package it came from, its page, the item URL, and the installed files.
 */
export interface CatalogEntry {
  name: string;
  /** `YT`, `Microvideo Live`; the item title is this plus ` Skin`. */
  label: string;
  description: string;
  preset: Preset;
  /** The use case the skin serves; the same id as `preset`. */
  useCase: Preset;
  media: 'audio' | 'video';
  live: boolean;
  /** The React component `Skin.tsx` exports (`YtSkin`). */
  component: string;
  /** The skin's custom element in the packaged HTML skin (`yt-skin`); the source files use none. */
  element: string;
  /** The `shadcn add @player-style/<registryItem>` name. */
  registryItem: string;
  /** Where the files land, relative to the components alias's `player-style/` directory. */
  directory: string;
  package: string;
  version: string;
  /** The skin's page on player.style. */
  docs: string;
  /** `${REGISTRY_ORIGIN}/r/<framework>/<name>.json`. */
  url: string;
  /** Where the files land, as `@components/...` targets. */
  files: string[];
}

/** The preset a skin's markup declares on its root `media-container`; `video` when it declares none. */
export function detectPreset(html: string): Preset {
  const preset = html.match(/<media-container\b[^>]*\bdata-preset="([^"]+)"/)?.[1];
  if (preset && preset in PRESETS) return preset as Preset;

  return 'video';
}

/** The catalog label: `sutro-audio` is `Sutro Audio`, `microvideo-live` is `Microvideo Live`, with `TITLES` overrides. */
export function registryItemLabel(name: string): string {
  const base = name.replace(/-live$/, '');
  const title =
    TITLES[base] ??
    base
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return name.endsWith('-live') ? `${title} Live` : title;
}

/** The item title `shadcn view` and `search` show, suffixed like Video.js 10's (`Default Video Skin`): `YT Skin`. */
export function registryItemTitle(name: string): string {
  return `${registryItemLabel(name)} Skin`;
}

/** `${REGISTRY_ORIGIN}/r/<framework>/<name>.json`, the URL `shadcn add` takes without a namespace. */
export function registryItemUrl(name: string, framework: RegistryFramework): string {
  return `${REGISTRY_ORIGIN}/r/${framework}/${name}.json`;
}

/** The `{name}` template a project stores for the `@player-style` namespace, one catalog at a time. */
export function registryNamespaceUrl(framework: RegistryFramework): string {
  return `${REGISTRY_ORIGIN}/r/${framework}/{name}.json`;
}

/** Where the CLI writes one of a skin's files: `@components/player-style/<name>/<file>`. */
export function registryFileTarget(name: string, file: SourceFileName): string {
  return `@components/${INSTALL_DIRECTORY}/${name}/${file}`;
}

/** `@videojs/react@10.0.0-rc.2`: the framework package at the skin's exact peer pin. */
export function frameworkDependency(source: SkinSource, framework: RegistryFramework): string {
  const name = FRAMEWORK_PACKAGES[framework];
  const range = source.peerDependencies[name];

  if (!range || !/^\d/.test(range)) {
    throw new Error(`${source.package} must pin ${name} to an exact version in peerDependencies; found ${range}.`);
  }

  return `${name}@${range}`;
}

/** The skin's exported React component (`YtSkin`), read from its `Skin.tsx`. */
export function exportedComponentName(source: SkinSource): string {
  const component = source.files['Skin.tsx'].match(/^export function (\w+)\b/m)?.[1];
  if (!component) throw new Error(`${source.package}: Skin.tsx exports no component.`);

  return component;
}

function registryAuthor(source: SkinSource): string {
  const author = source.author ?? '@muxinc';
  const handle = author.match(/^@([\w-]+)$/)?.[1];

  return handle ? `${author} (https://github.com/${handle})` : author;
}

function skinPage(source: SkinSource): string {
  return source.homepage ?? `${REGISTRY_ORIGIN}/skins/${source.name}`;
}

/**
 * The item's `docs`, which the CLI prints after `add`. Like Video.js 10's React skins: what the item installs, where to
 * read about playback adapters, and a code block that uses the installed files through the `@/` alias. Unlike Video.js
 * 10's files, the skin's stylesheet is not imported by its module, so the usage imports it.
 */
function registryDocs(source: SkinSource, framework: RegistryFramework, preset: Preset): string {
  const dependency = frameworkDependency(source, framework);
  const { player, reactPlayer, reactMedia, entry, media } = PRESETS[preset];
  const directory = `${IMPORT_DIRECTORY}/${source.name}`;
  const intro = [
    `Requires \`${dependency}\`, which is installed with this item. The native media element below handles`,
    `browser-supported sources; [install a playback adapter](${MEDIA_SOURCES_DOCS[framework]}) for HLS, DASH, embeds, or`,
    `another engine. Skin page: ${skinPage(source)}`,
  ].join(' ');

  if (framework === 'html') {
    return `${intro}

\`\`\`ts
import '@videojs/html/${entry}/player';
import '${directory}/register';
import '${directory}/skin.css';
\`\`\`

\`\`\`html
<${player}>
  <!-- Paste components/${INSTALL_DIRECTORY}/${source.name}/skin.html here, with your <${media}> in place of its media comment. -->
</${player}>
\`\`\``;
  }

  const component = exportedComponentName(source);

  return `${intro}

\`\`\`tsx
import { ${reactMedia}, ${reactPlayer} } from '@videojs/react/${entry}';

import { ${component} } from '${directory}/Skin';
import '${directory}/skin.css';

export function Player({ src }: { src: string }) {
  return (
    <${reactPlayer}>
      <${component}>
        <${reactMedia} src={src} />
      </${component}>
    </${reactPlayer}>
  );
}
\`\`\``;
}

/**
 * `registry:component` for the React module and `registry:file` for the rest. Video.js 10 types its `skin.css` as
 * `registry:style`, but shadcn 4.21 runs that type through its CSS pass, which drops the stylesheet's leading comment;
 * `registry:file` is written verbatim.
 */
function fileType(file: SourceFileName): 'registry:component' | 'registry:file' {
  return file === 'Skin.tsx' ? 'registry:component' : 'registry:file';
}

/**
 * One shadcn registry item for a skin in one catalog: a `registry:block` of the skin's source files. React gets
 * `Skin.tsx` and `skin.css`; HTML gets `skin.html`, `register.ts` and `skin.css`. Every file carries an explicit
 * `@components/...` target so the layout is the same in every project, and `dependencies` pins the framework package
 * the skin's peer range names (plus `react` for React items, as Video.js 10's do).
 */
export function createRegistryItem(source: SkinSource, framework: RegistryFramework): RegistryItem {
  const preset = detectPreset(source.files['skin.html']);
  const files = CATALOG_FILES[framework].map((file) => ({
    path: `${source.name}/${file}`,
    type: fileType(file),
    target: registryFileTarget(source.name, file),
    content: source.files[file],
  }));

  const item: RegistryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: source.name,
    type: 'registry:block',
    title: registryItemTitle(source.name),
    description: source.description,
    author: registryAuthor(source),
    dependencies: [frameworkDependency(source, framework), ...(framework === 'react' ? ['react'] : [])],
    files,
    docs: registryDocs(source, framework, preset),
    categories: ['media', 'skins', preset],
    meta: {
      role: 'skin',
      framework,
      styling: REGISTRY_STYLING,
      preset,
      useCase: preset,
      media: PRESETS[preset].media,
      package: source.package,
      version: source.version,
      ...(framework === 'react' ? { component: exportedComponentName(source) } : { element: `${source.name}-skin` }),
    },
  };

  return registryItemSchema.parse(item);
}

/** A catalog's `registry.json` (validated) and its `catalog.json` entries, in the order the sources were given. */
export function createCatalog(
  sources: readonly SkinSource[],
  framework: RegistryFramework
): { registry: Registry; catalog: CatalogEntry[] } {
  const items = sources.map((source) => createRegistryItem(source, framework));
  const registry = registrySchema.parse({
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: REGISTRY_NAME,
    homepage: REGISTRY_ORIGIN,
    items,
  } satisfies Registry);

  const dependencies = new Set(items.map((item) => item.dependencies?.[0]));
  if (dependencies.size !== 1) {
    throw new Error(
      `Every ${framework} item must pin the same framework package; found ${[...dependencies].join(', ')}.`
    );
  }

  const catalog = items.map((item, index): CatalogEntry => {
    const source = sources[index]!;
    const preset = detectPreset(source.files['skin.html']);

    return {
      name: item.name,
      label: registryItemLabel(item.name),
      description: item.description ?? '',
      preset,
      useCase: preset,
      media: PRESETS[preset].media,
      live: preset.startsWith('live-'),
      component: exportedComponentName(source),
      element: `${source.name}-skin`,
      registryItem: item.name,
      directory: item.name,
      package: source.package,
      version: source.version,
      docs: skinPage(source),
      url: registryItemUrl(item.name, framework),
      files: (item.files ?? []).map((file) => file.target!),
    };
  });

  return { registry, catalog };
}
