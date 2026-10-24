/*
 * The registry's names, URLs and snippets, which the build, the e2e and the site share. Nothing here touches Node, so
 * the site imports it as `build-registry/names`.
 */
import { type Framework, PRESET_LABELS, type Preset, presetModule } from 'build-skin/names';

/** Where the site hosts the registry; item URLs are `${REGISTRY_ORIGIN}/r/<framework>/<item>.json`. */
export const REGISTRY_ORIGIN = 'https://skins.videojs.org';

/** The namespace a project maps to one catalog in its `components.json`: `shadcn add @skins/winamp`. */
export const REGISTRY_NAMESPACE = '@skins';

/**
 * Where the CLI writes a skin's files, under the project's `aliases.components` (`src/components` in a Vite scaffold,
 * `components` in a Next one). Video.js 10 does the same with `@components/videojs/`.
 */
export const INSTALL_DIRECTORY = 'skins';

/** The specifier installed files import each other through, and the usage in an item's `docs` imports them from. */
export const IMPORT_DIRECTORY = `@/components/${INSTALL_DIRECTORY}`;

/** `<name>` for the skin's default preset, `<name>-live` for its live twin, `<name>-<preset>` for anything else. */
export function registryItemName(name: string, defaultPreset: Preset, preset: Preset): string {
  if (preset === defaultPreset) return name;
  if (preset === `live-${defaultPreset}`) return `${name}-live`;

  return `${name}-${preset}`;
}

/** `Winamp`, `Winamp Live`, `Winamp Audio`: the catalog title, then the preset when it is not the default. */
export function registryItemLabel(title: string, defaultPreset: Preset, preset: Preset): string {
  if (preset === defaultPreset) return title;
  if (preset === `live-${defaultPreset}`) return `${title} Live`;

  return `${title} ${PRESET_LABELS[preset]}`;
}

/** `${REGISTRY_ORIGIN}/r/<framework>/<item>.json`, the URL `shadcn add` takes without a namespace. */
export function registryItemUrl(item: string, framework: Framework, origin = REGISTRY_ORIGIN): string {
  return `${origin}/r/${framework}/${item}.json`;
}

/** The `{name}` template a project stores for the `@skins` namespace, one catalog at a time. */
export function registryNamespaceUrl(framework: Framework, origin = REGISTRY_ORIGIN): string {
  return `${origin}/r/${framework}/{name}.json`;
}

/**
 * A whole `components.json` for a project that has never run `shadcn init`, such as a Vite app without Tailwind: the
 * CLI only needs the aliases (resolved through the project's tsconfig `paths`, `@/*` to `./src/*`) and a stylesheet
 * path it can find; nothing Tailwind-specific is read for these items. `cssVariables` stays `true`: with `false` the
 * CLI runs its colour-mapping pass over every JSX string literal, splitting on spaces and deduplicating tokens
 * (`viewBox="0 0 24 24"` becomes `"0 24"`), which breaks the skins' inline SVGs.
 */
export function componentsJson(
  framework: Framework,
  { css = 'src/index.css', origin = REGISTRY_ORIGIN }: { css?: string; origin?: string } = {}
): string {
  return JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'new-york',
      rsc: false,
      tsx: true,
      tailwind: { config: '', css, baseColor: 'neutral', cssVariables: true, prefix: '' },
      aliases: {
        components: '@/components',
        ui: '@/components/ui',
        lib: '@/lib',
        utils: '@/lib/utils',
        hooks: '@/hooks',
      },
      registries: { [REGISTRY_NAMESPACE]: registryNamespaceUrl(framework, origin) },
    },
    null,
    2
  );
}

/**
 * The code blocks of an item's `docs`, as Markdown: React, a `Player` component around the installed preset module
 * (which imports its own CSS); HTML, the player and preset module imports and the player to paste `skin.html` into.
 * `directory` is the installed skin's folder as the code imports it (`@/components/skins/winamp`); `media` is the media
 * element the skin wraps, as the code writes it (`<Video src={src} />`, `<video>`).
 */
export function usageCode(framework: Framework, preset: Preset, directory: string, media: string): string {
  const { skinComponent, playerComponent, playerTag } = presetModule(preset);
  const installed = directory.replace(/^@\//, '');

  if (framework === 'html') {
    return `\`\`\`ts
import '@videojs/html/${preset}/player';
import '${directory}/${preset}/skin';
\`\`\`

\`\`\`html
<${playerTag}>
  <!-- Paste ${installed}/${preset}/skin.html here, with your ${media} in place of its media comment. -->
</${playerTag}>
\`\`\``;
  }

  const mediaComponent = presetModule(preset).media === 'audio' ? 'Audio' : 'Video';

  return `\`\`\`tsx
import { ${mediaComponent}, ${playerComponent} } from '@videojs/react/${preset}';

import { ${skinComponent} } from '${directory}/${preset}/skin';

export function Player({ src }: { src: string }) {
  return (
    <${playerComponent}>
      <${skinComponent}>
        ${media}
      </${skinComponent}>
    </${playerComponent}>
  );
}
\`\`\``;
}
