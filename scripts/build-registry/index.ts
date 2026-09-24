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
 */
export const INSTALL_DIRECTORY = 'player-style';

/** One catalog per framework, as Video.js 10's registry splits its own skins. */
export const FRAMEWORKS = ['react', 'html'] as const;

export type RegistryFramework = (typeof FRAMEWORKS)[number];

/** The open edition file names in the order each catalog publishes them. */
export const CATALOG_FILES = {
  react: ['Skin.tsx', 'skin.css'],
  html: ['skin.html', 'register.ts', 'skin.css'],
} as const;

export type OpenEditionFileName = (typeof CATALOG_FILES)[RegistryFramework][number];

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

export type Preset = keyof typeof PRESETS;

export type Edition = 'on-demand' | 'live';

/** Titles the slug cannot spell on its own; every other skin is its slug in title case. */
const TITLES: Readonly<Record<string, string>> = {
  yt: 'YT',
  'x-mas': 'X-mas',
};

/** One skin's open edition as the build reads it from `skins/<name>/dist/open` and `skins/<name>/package.json`. */
export interface OpenEdition {
  /** The `skins/*` directory name, which is also the registry item name (`yt`, `microvideo-live`). */
  name: string;
  /** The npm package the open edition was generated from (`@player.style/yt`). */
  package: string;
  version: string;
  description: string;
  /** The skin's page on player.style; the package's `homepage`. */
  homepage?: string | undefined;
  /** The package's `author` string (`@muxinc`). */
  author?: string | undefined;
  /** The package's peer ranges; the item pins `@videojs/react` or `@videojs/html` from here. */
  peerDependencies: Readonly<Record<string, string>>;
  /** The open edition files by name. */
  files: Readonly<Record<OpenEditionFileName, string>>;
}

/** One row of a catalog's `catalog.json`, the index the site reads to list what the registry hosts. */
export interface CatalogEntry {
  name: string;
  title: string;
  description: string;
  edition: Edition;
  preset: Preset;
  package: string;
  version: string;
  /** The skin's page on player.style. */
  docs: string;
  /** `${REGISTRY_ORIGIN}/r/<framework>/<name>.json`. */
  url: string;
  /** Where the files land, as `@components/...` targets. */
  files: string[];
}

export interface Catalog {
  framework: RegistryFramework;
  /** The Video.js package every item installs, with its pin. */
  dependency: string;
  items: CatalogEntry[];
}

/** The preset a skin's open markup declares on its root `media-container`; `video` when it declares none. */
export function detectPreset(html: string): Preset {
  const preset = html.match(/<media-container\b[^>]*\bdata-preset="([^"]+)"/)?.[1];
  if (preset && preset in PRESETS) return preset as Preset;

  return 'video';
}

/** The item title: `sutro-audio` is `Sutro Audio`, `microvideo-live` is `Microvideo Live`, with `TITLES` overrides. */
export function registryItemTitle(name: string): string {
  const base = name.replace(/-live$/, '');
  const title =
    TITLES[base] ??
    base
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return name.endsWith('-live') ? `${title} Live` : title;
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
export function registryFileTarget(name: string, file: OpenEditionFileName): string {
  return `@components/${INSTALL_DIRECTORY}/${name}/${file}`;
}

/** `@videojs/react@10.0.0-rc.2`: the framework package at the skin's exact peer pin. */
export function frameworkDependency(edition: OpenEdition, framework: RegistryFramework): string {
  const name = FRAMEWORK_PACKAGES[framework];
  const range = edition.peerDependencies[name];

  if (!range || !/^\d/.test(range)) {
    throw new Error(`${edition.package} must pin ${name} to an exact version in peerDependencies; found ${range}.`);
  }

  return `${name}@${range}`;
}

/** The skin's exported React component (`YtSkin`), read from the open edition's `Skin.tsx`. */
export function exportedComponentName(edition: OpenEdition): string {
  const component = edition.files['Skin.tsx'].match(/^export function (\w+)\b/m)?.[1];
  if (!component) throw new Error(`${edition.package}: Skin.tsx exports no component.`);

  return component;
}

function registryAuthor(edition: OpenEdition): string {
  const author = edition.author ?? '@muxinc';
  const handle = author.match(/^@([\w-]+)$/)?.[1];

  return handle ? `${author} (https://github.com/${handle})` : author;
}

function registryDocs(edition: OpenEdition, framework: RegistryFramework, preset: Preset): string {
  const docs = edition.homepage ?? `${REGISTRY_ORIGIN}/skins/${edition.name}`;
  const dependency = frameworkDependency(edition, framework);
  const { player, reactPlayer, reactMedia, entry, media } = PRESETS[preset];
  const directory = `${INSTALL_DIRECTORY}/${edition.name}`;

  if (framework === 'html') {
    return [
      `Requires \`${dependency}\`, installed with this item. Import \`@videojs/html/${entry}/player\`,`,
      `\`${directory}/register\` and \`${directory}/skin.css\`, then paste \`${directory}/skin.html\` inside`,
      `\`<${player}>\` with your \`<${media}>\` where the media placeholder comment is. Docs: ${docs}`,
    ].join(' ');
  }

  const component = exportedComponentName(edition);

  return [
    `Requires \`${dependency}\`, installed with this item. Import \`./skin.css\` next to the component and render`,
    `\`<${reactPlayer}><${component}><${reactMedia} src="..." /></${component}></${reactPlayer}>\` from`,
    `\`@videojs/react/${entry}\`. Docs: ${docs}`,
  ].join(' ');
}

/**
 * One shadcn registry item for a skin in one catalog. The item is a `registry:block` of the open edition's files:
 * React gets `Skin.tsx` (`registry:component`) and `skin.css`; HTML gets `skin.html`, `register.ts` and `skin.css`
 * (`registry:file`, which the CLI writes verbatim). Every file carries an explicit `@components/...` target so the
 * layout is the same in every project, and `dependencies` pins the framework package the skin's peer range names.
 */
export function createRegistryItem(edition: OpenEdition, framework: RegistryFramework): RegistryItem {
  const preset = detectPreset(edition.files['skin.html']);
  const files = CATALOG_FILES[framework].map((file) => ({
    path: `${edition.name}/${file}`,
    type: file === 'Skin.tsx' ? ('registry:component' as const) : ('registry:file' as const),
    target: registryFileTarget(edition.name, file),
    content: edition.files[file],
  }));

  const item: RegistryItem = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: edition.name,
    type: 'registry:block',
    title: registryItemTitle(edition.name),
    description: edition.description,
    author: registryAuthor(edition),
    dependencies: [frameworkDependency(edition, framework)],
    files,
    docs: registryDocs(edition, framework, preset),
    categories: ['media', 'skins', preset],
    meta: {
      package: edition.package,
      version: edition.version,
      framework,
      preset,
      edition: presetEdition(preset),
      ...(framework === 'react' ? { component: exportedComponentName(edition) } : { element: `${edition.name}-skin` }),
    },
  };

  return registryItemSchema.parse(item);
}

function presetEdition(preset: Preset): Edition {
  return preset.startsWith('live-') ? 'live' : 'on-demand';
}

/** A catalog's `registry.json` (validated) and its `catalog.json` index, in the order the editions were given. */
export function createCatalog(
  editions: readonly OpenEdition[],
  framework: RegistryFramework
): { registry: Registry; catalog: Catalog } {
  const items = editions.map((edition) => createRegistryItem(edition, framework));
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

  const catalog: Catalog = {
    framework,
    dependency: [...dependencies][0]!,
    items: items.map((item, index) => {
      const edition = editions[index]!;
      const preset = detectPreset(edition.files['skin.html']);

      return {
        name: item.name,
        title: item.title ?? item.name,
        description: item.description ?? '',
        edition: presetEdition(preset),
        preset,
        package: edition.package,
        version: edition.version,
        docs: edition.homepage ?? `${REGISTRY_ORIGIN}/skins/${item.name}`,
        url: registryItemUrl(item.name, framework),
        files: (item.files ?? []).map((file) => file.target!),
      };
    }),
  };

  return { registry, catalog };
}
