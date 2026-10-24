import { type Framework, type Preset, presetModule, PRESETS, type SkinCatalog, type SkinManifest } from 'build-skin';
import { type Registry, type RegistryItem, registrySchema } from 'shadcn/schema';

import {
  IMPORT_DIRECTORY,
  INSTALL_DIRECTORY,
  REGISTRY_ORIGIN,
  registryItemLabel,
  registryItemName,
  registryItemUrl,
  usageCode,
} from './names.ts';

export * from './names.ts';

/** The `name` of every catalog's `registry.json`. */
export const REGISTRY_NAME = 'skins';

/** One skin package as the build reads it from `skins/<name>/<framework>/`. */
export interface SkinSource {
  /** The `skins/*` folder, which names the items and the install directory. */
  name: string;
  framework: Framework;
  manifest: SkinManifest;
  catalog: SkinCatalog;
  /** The skin's default preset across both frameworks; its item is the bare `<name>`. */
  defaultPreset: Preset;
  /** The package's presets, from its `src/<preset>/` folders. */
  presets: readonly Preset[];
  /** The packages the skin's code needs: its `package.json` dependencies and peers, by name. */
  dependencies: readonly string[];
  /** Every file under `src/`, keyed by its path relative to `src/`. */
  files: Readonly<Record<string, string>>;
}

/**
 * One entry of a catalog's `catalog.json`, the index of what the registry hosts. It follows Video.js 10's catalog
 * entries (`label`, `preset`, `media`, `live`, `component`, `registryItem`, `directory`) and adds the skin's page, the
 * item URL and the installed files.
 */
export interface CatalogEntry {
  name: string;
  label: string;
  description: string;
  preset: Preset;
  media: 'audio' | 'video';
  live: boolean;
  /** React: the component the preset module exports (`VideoSkin`). */
  component?: string;
  /** HTML: the player the markup goes in (`video-player`). */
  player?: string;
  registryItem: string;
  /** Where the files land, under the components alias's `skins/` directory: the skin's name, for every preset. */
  directory: string;
  docs: string;
  url: string;
  files: string[];
}

/** Where each framework's docs explain playback adapters, which the usage in `docs` links to as Video.js 10's does. */
const MEDIA_SOURCES_DOCS = {
  react: 'https://videojs.org/docs/framework/react/concepts/media-sources/',
  html: 'https://videojs.org/docs/framework/html/concepts/media-sources/',
} as const satisfies Record<Framework, string>;

/** Where the CLI writes a file of the skin: `@components/skins/<name>/<path under src>`, the same for every preset. */
export function registryFileTarget(name: string, path: string): string {
  return `@components/${INSTALL_DIRECTORY}/${name}/${path}`;
}

/**
 * The reverse of `skin create`'s import rewrite: its `@/` is the project's `src/`, which lands in
 * `components/skins/<name>/`. shadcn then maps `@/components/` onto the consumer's components alias, as it does for
 * Video.js's own `@/components/videojs/` imports, so `lib/` and `ui/` stay inside the skin's folder.
 */
export function rewriteImports(content: string, name: string): string {
  return content.replaceAll("'@/", `'${IMPORT_DIRECTORY}/${name}/`).replaceAll('"@/', `"${IMPORT_DIRECTORY}/${name}/`);
}

/**
 * The files one preset's item carries: everything under `src/` except the other presets' folders, so shared
 * `styles/`, `lib/` and `ui/` go into every preset's item (installing two just writes the same files twice). A CSS
 * skin's `src/skin.css` is `skin create`'s preview-only global sheet and stays out; a Tailwind skin's is its Tailwind
 * entry (`@source`, `@theme`) and goes in.
 */
export function presetFiles(source: SkinSource, preset: Preset): string[] {
  return Object.keys(source.files)
    .filter((path) => {
      const [folder] = path.split('/');
      if (path === 'skin.css') return source.manifest.styling === 'tailwind';

      return folder === preset || !(PRESETS as readonly string[]).includes(folder!);
    })
    .sort();
}

/** `@videojs/react@10.2.0`, `cn`, `react`: Video.js packages pinned to the skin's release, the rest unversioned. */
export function registryDependencies(source: SkinSource): string[] {
  return [...source.dependencies]
    .sort()
    .map((name) => (name.startsWith('@videojs/') ? `${name}@${source.manifest.videojs}` : name));
}

function registryAuthor({ author }: SkinCatalog): string {
  const link = author.github ? `https://github.com/${author.github}` : author.url;

  return link ? `${author.name} (${link})` : author.name;
}

/** The skin's page on the site, on the preset's use case. */
function skinPage(source: SkinSource, preset: Preset): string {
  const page = `${REGISTRY_ORIGIN}/skins/${source.name}`;

  return preset === source.defaultPreset ? page : `${page}?use-case=${preset}`;
}

/**
 * The item's `docs`, which the CLI prints after `add`. Like Video.js 10's: what the item installs, where to read about
 * playback adapters, and a code block that uses the installed files through the `@/` alias. The preset module imports
 * its own CSS, so the usage imports only the module (and, for Tailwind, the Tailwind entry).
 */
function registryDocs(source: SkinSource, preset: Preset): string {
  const { media } = presetModule(preset);
  const directory = `${IMPORT_DIRECTORY}/${source.name}`;
  const videojs = registryDependencies(source).filter((dependency) => dependency.startsWith('@videojs/'));
  const tailwind =
    source.manifest.styling === 'tailwind'
      ? ` The skin is styled with Tailwind CSS v4, which your project needs: in the stylesheet that has \`@import "tailwindcss";\`, add \`@import "./components/${INSTALL_DIRECTORY}/${source.name}/skin.css";\` after it (that path is from a Vite project's \`src/index.css\`; give the path from your stylesheet). It brings the skin's theme tokens, utilities and variants, without which its \`media-*\` classes are not generated.`
      : '';
  const intro = [
    `Requires ${videojs.map((dependency) => `\`${dependency}\``).join(', ')}, installed with this item.`,
    `The native media element below handles browser-supported sources;`,
    `[install a playback adapter](${MEDIA_SOURCES_DOCS[source.framework]}) for HLS, DASH, embeds, or another engine.`,
    `Skin page: ${skinPage(source, preset)}${tailwind}`,
  ].join(' ');

  const element = source.framework === 'html' ? `<${media}>` : `<${media === 'audio' ? 'Audio' : 'Video'} src={src} />`;

  return `${intro}\n\n${usageCode(source.framework, preset, directory, element)}`;
}

/**
 * One shadcn registry item for one preset of a skin package: a `registry:block` of its source files, each with an
 * explicit `@components/skins/<name>/...` target so the layout matches the `skin create` project. React modules are
 * `registry:component`; everything else is `registry:file`, which shadcn writes verbatim, as Video.js 10 types its HTML
 * skins' files (shadcn's transform drops a `.ts` component's leading comment, its CSS pass a stylesheet's).
 */
export function createRegistryItem(source: SkinSource, preset: Preset): RegistryItem {
  const { skinComponent, playerTag, media } = presetModule(preset);
  const files = presetFiles(source, preset).map((path) => ({
    path: `${source.name}/${path}`,
    type:
      source.framework === 'react' && /\.tsx?$/.test(path)
        ? ('registry:component' as const)
        : ('registry:file' as const),
    target: registryFileTarget(source.name, path),
    content: rewriteImports(source.files[path]!, source.name),
  }));

  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: registryItemName(source.name, source.defaultPreset, preset),
    type: 'registry:block',
    title: `${registryItemLabel(source.catalog.title, source.defaultPreset, preset)} Skin`,
    description: source.catalog.description,
    author: registryAuthor(source.catalog),
    dependencies: registryDependencies(source),
    files,
    docs: registryDocs(source, preset),
    categories: ['media', 'skins', preset],
    meta: {
      role: 'skin',
      framework: source.framework,
      styling: source.manifest.styling,
      preset,
      media,
      ...(source.framework === 'react' ? { component: skinComponent } : { player: playerTag }),
    },
  };
}

/** A catalog's `registry.json` (validated, items included) and its `catalog.json` entries: one item per preset of each package. */
export function createCatalog(
  sources: readonly SkinSource[],
  framework: Framework
): { registry: Registry; catalog: CatalogEntry[] } {
  const pairs = sources
    .filter((source) => source.framework === framework)
    .flatMap((source) => source.presets.map((preset) => ({ source, preset })));
  const items = pairs.map(({ source, preset }) => createRegistryItem(source, preset));
  const names = items.map((item) => item.name);
  const duplicate = names.find((name, index) => names.indexOf(name) !== index);
  if (duplicate) throw new Error(`Two ${framework} items are named "${duplicate}".`);

  const registry = registrySchema.parse({
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: REGISTRY_NAME,
    homepage: REGISTRY_ORIGIN,
    items,
  } satisfies Registry);

  const catalog = items.map((item, index): CatalogEntry => {
    const { source, preset } = pairs[index]!;
    const { skinComponent, playerTag, media } = presetModule(preset);

    return {
      name: item.name,
      label: registryItemLabel(source.catalog.title, source.defaultPreset, preset),
      description: item.description ?? '',
      preset,
      media,
      live: preset.startsWith('live-'),
      ...(framework === 'react' ? { component: skinComponent } : { player: playerTag }),
      registryItem: item.name,
      directory: source.name,
      docs: skinPage(source, preset),
      url: registryItemUrl(item.name, framework),
      files: (item.files ?? []).map((file) => file.target!),
    };
  });

  return { registry, catalog };
}
