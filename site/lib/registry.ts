import type { UseCase } from './skins';

/**
 * The shadcn registry the site hosts under `/r`, built by `scripts/build-registry` from every skin's source files:
 * one catalog per framework (`/r/react`, `/r/html`), one item per skin named after its `skins/*` directory, with the
 * same item names in both catalogs. The commands have the shape Video.js 10 documents for its own skins (`registry add`
 * once, then `add <namespace>/<item>`). These helpers give the UI the URLs, commands, and target paths; nothing here
 * touches the network or the file system.
 */

export type RegistryFramework = 'html' | 'react';
export type ShadcnRunner = 'npm' | 'pnpm' | 'yarn' | 'bun';

export const REGISTRY_ORIGIN = 'https://player.style';

/** The namespace a project points at one catalog: `shadcn add @player-style/yt`. */
export const REGISTRY_NAMESPACE = '@player-style';

/**
 * Where the CLI writes a skin's files, relative to the project's components alias (`src/components` in a Vite
 * project, `components` in a Next one): `components/player-style/<item>/<file>`.
 */
export const REGISTRY_INSTALL_DIRECTORY = 'components/player-style';

export const REGISTRY_FRAMEWORKS = ['react', 'html'] as const satisfies readonly RegistryFramework[];

export const REGISTRY_FRAMEWORK_LABELS = {
  react: 'React',
  html: 'HTML',
} as const satisfies Record<RegistryFramework, string>;

/**
 * How every skin is styled, in Video.js 10's words: one plain stylesheet, which its docs label Vanilla CSS (its
 * `/r/react/css` and `/r/html` catalogs). There is no Tailwind variant, so our React catalog is `/r/react`.
 */
export const REGISTRY_STYLING_LABEL = 'Vanilla CSS';

/** The Video.js package each catalog's items install, pinned to the skins' peer version. */
export const REGISTRY_PACKAGES = {
  react: '@videojs/react@10.0.0-rc.2',
  html: '@videojs/html@10.0.0-rc.2',
} as const satisfies Record<RegistryFramework, string>;

/** The files each catalog's item installs, in the order they land. */
export const REGISTRY_FILES = {
  react: ['Skin.tsx', 'skin.css'],
  html: ['skin.html', 'register.ts', 'skin.css'],
} as const satisfies Record<RegistryFramework, readonly string[]>;

export const SHADCN_RUNNER_NAMES = ['npm', 'pnpm', 'yarn', 'bun'] as const satisfies readonly ShadcnRunner[];

export const SHADCN_RUNNERS = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const satisfies Record<ShadcnRunner, string>;

/**
 * The registry item for a skin: its `skins/*` directory name. A live use case is its own package and directory
 * (`microvideo-live`), so a base name plus a live use case resolves to that item.
 */
export function registryItemName(name: string, useCase?: UseCase): string {
  if (useCase?.startsWith('live-') && !name.endsWith('-live')) return `${name}-live`;

  return name;
}

/** `https://player.style/r/<framework>`, where a catalog's `registry.json` and `catalog.json` live. */
export function registryCatalogUrl(framework: RegistryFramework): string {
  return `${REGISTRY_ORIGIN}/r/${framework}`;
}

/** The `{name}` template `components.json` stores for the namespace, one catalog at a time. */
export function registryNamespaceUrl(framework: RegistryFramework): string {
  return `${registryCatalogUrl(framework)}/{name}.json`;
}

/** The item's hosted URL, which `shadcn add` also takes directly without a namespace. */
export function registryItemUrl(name: string, useCase: UseCase | undefined, framework: RegistryFramework): string {
  return `${registryCatalogUrl(framework)}/${registryItemName(name, useCase)}.json`;
}

export function shadcnCommand(runner: ShadcnRunner, action: string): string {
  return `${SHADCN_RUNNERS[runner]} ${action}`;
}

/** Points `@player-style` at one catalog; the CLI writes it into `components.json`. */
export function shadcnRegistryAddCommand(runner: ShadcnRunner, framework: RegistryFramework): string {
  return shadcnCommand(runner, `registry add ${REGISTRY_NAMESPACE}=${registryNamespaceUrl(framework)}`);
}

/** `npx shadcn@latest add @player-style/yt`: the namespaced install, after `shadcnRegistryAddCommand`. */
export function shadcnAddCommand(runner: ShadcnRunner, name: string, useCase?: UseCase): string {
  return shadcnCommand(runner, `add ${REGISTRY_NAMESPACE}/${registryItemName(name, useCase)}`);
}

/** `npx shadcn@latest add https://player.style/r/react/yt.json`: the one-line install with no namespace set up. */
export function shadcnAddUrlCommand(
  runner: ShadcnRunner,
  name: string,
  useCase: UseCase | undefined,
  framework: RegistryFramework
): string {
  return shadcnCommand(runner, `add ${registryItemUrl(name, useCase, framework)}`);
}

/** `npx shadcn@latest view @player-style/yt`: print the item before installing it, as Video.js 10's docs suggest. */
export function shadcnViewCommand(runner: ShadcnRunner, name: string, useCase?: UseCase): string {
  return shadcnCommand(runner, `view ${REGISTRY_NAMESPACE}/${registryItemName(name, useCase)}`);
}

/** `npx shadcn@latest add @player-style/yt --overwrite`: replace an installed copy with the current source files. */
export function shadcnUpdateCommand(runner: ShadcnRunner, name: string, useCase?: UseCase): string {
  return `${shadcnAddCommand(runner, name, useCase)} --overwrite`;
}

/** Every command a namespaced install needs, in order: register the namespace, then add the item. */
export function registryInstallCommands(
  runner: ShadcnRunner,
  framework: RegistryFramework,
  name: string,
  useCase?: UseCase
): string {
  return [shadcnRegistryAddCommand(runner, framework), shadcnAddCommand(runner, name, useCase)].join('\n');
}

/** The `registries` entry to paste into `components.json` by hand instead of running `registry add`. */
export function componentsJsonRegistriesSnippet(framework: RegistryFramework): string {
  return JSON.stringify({ registries: { [REGISTRY_NAMESPACE]: registryNamespaceUrl(framework) } }, null, 2);
}

/**
 * A whole `components.json` for a project that has never run `shadcn init`, such as a Vite app without Tailwind: the
 * CLI only needs the aliases (resolved through the project's tsconfig `paths`, `@/*` to `./src/*` here) and a
 * stylesheet path it can find; nothing Tailwind-specific is read for these items. `shadcn init` cannot write it there:
 * it requires Tailwind and a React framework. `cssVariables` stays `true`: with `false` the CLI rewrites every JSX
 * string literal as a class list, which breaks the skins' inline SVGs.
 */
export function componentsJsonSnippet(framework: RegistryFramework, { css = 'src/index.css' } = {}): string {
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
      registries: { [REGISTRY_NAMESPACE]: registryNamespaceUrl(framework) },
    },
    null,
    2
  );
}

/**
 * The `@/*` alias the CLI resolves `aliases.components` through, for the project's `tsconfig.json` (and
 * `tsconfig.app.json` in a Vite React scaffold). No `baseUrl`: TypeScript 6 deprecates it and `tsc` fails on it.
 */
export function tsconfigPathsSnippet(): string {
  return JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }, null, 2);
}

/** Where an item's files land, relative to the project's components alias: `components/player-style/yt/Skin.tsx`. */
export function registryInstallDirectory(name: string, useCase?: UseCase): string {
  return `${REGISTRY_INSTALL_DIRECTORY}/${registryItemName(name, useCase)}`;
}

export function registryTargetPaths(
  name: string,
  useCase: UseCase | undefined,
  framework: RegistryFramework
): string[] {
  const directory = registryInstallDirectory(name, useCase);

  return REGISTRY_FILES[framework].map((file) => `${directory}/${file}`);
}
