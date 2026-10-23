import { SITE_URL } from './site';
import type { UseCase } from './skins';

/**
 * The shadcn registry the site hosts under `/r`, built by `scripts/build-registry` from every skin's sources: one
 * catalog per framework (`/r/react`, `/r/html`), one item per preset of a skin (`winamp`, `winamp-live`), every item
 * installing into the skin's folder. The commands have the shape Video.js 10 documents for its own skins
 * (`registry add` once, then `add <namespace>/<item>`). These helpers give the UI the URLs, commands, and paths; nothing
 * here touches the network or the file system.
 */

export type RegistryFramework = 'html' | 'react';
export type ShadcnRunner = 'npm' | 'pnpm' | 'yarn' | 'bun';

export const REGISTRY_ORIGIN = SITE_URL;

/** The namespace a project points at one catalog: `shadcn add @skins/winamp`. */
export const REGISTRY_NAMESPACE = '@skins';

/**
 * Where the CLI writes a skin's files, relative to the project's components alias (`src/components` in a Vite
 * project, `components` in a Next one): `components/skins/<name>/`, laid out as the skin's `src/`.
 */
export const REGISTRY_INSTALL_DIRECTORY = 'components/skins';

export const REGISTRY_FRAMEWORKS = ['react', 'html'] as const satisfies readonly RegistryFramework[];

export const REGISTRY_FRAMEWORK_LABELS = {
  react: 'React',
  html: 'HTML',
} as const satisfies Record<RegistryFramework, string>;

/** The Video.js package each catalog's items install, pinned to the release every skin targets. */
export const REGISTRY_PACKAGES = {
  react: '@videojs/react@10.2.0',
  html: '@videojs/html@10.2.0',
} as const satisfies Record<RegistryFramework, string>;

export const SHADCN_RUNNER_NAMES = ['npm', 'pnpm', 'yarn', 'bun'] as const satisfies readonly ShadcnRunner[];

export const SHADCN_RUNNERS = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const satisfies Record<ShadcnRunner, string>;

/** `https://skins.videojs.org/r/<framework>`, where a catalog's `registry.json` and `catalog.json` live. */
export function registryCatalogUrl(framework: RegistryFramework): string {
  return `${REGISTRY_ORIGIN}/r/${framework}`;
}

/** The `{name}` template `components.json` stores for the namespace, one catalog at a time. */
export function registryNamespaceUrl(framework: RegistryFramework): string {
  return `${registryCatalogUrl(framework)}/{name}.json`;
}

/** The item's hosted URL, which `shadcn add` also takes directly without a namespace. */
export function registryItemUrl(item: string, framework: RegistryFramework): string {
  return `${registryCatalogUrl(framework)}/${item}.json`;
}

export function shadcnCommand(runner: ShadcnRunner, action: string): string {
  return `${SHADCN_RUNNERS[runner]} ${action}`;
}

/** Points `@skins` at one catalog; the CLI writes it into `components.json`. */
export function shadcnRegistryAddCommand(runner: ShadcnRunner, framework: RegistryFramework): string {
  return shadcnCommand(runner, `registry add ${REGISTRY_NAMESPACE}=${registryNamespaceUrl(framework)}`);
}

/** `npx shadcn@latest add @skins/winamp`: the namespaced install, after `shadcnRegistryAddCommand`. */
export function shadcnAddCommand(runner: ShadcnRunner, item: string): string {
  return shadcnCommand(runner, `add ${REGISTRY_NAMESPACE}/${item}`);
}

/** `npx shadcn@latest add https://skins.videojs.org/r/react/winamp.json`: the install with no namespace set up. */
export function shadcnAddUrlCommand(runner: ShadcnRunner, item: string, framework: RegistryFramework): string {
  return shadcnCommand(runner, `add ${registryItemUrl(item, framework)}`);
}

/** `npx shadcn@latest view @skins/winamp`: print the item before installing it, as Video.js 10's docs suggest. */
export function shadcnViewCommand(runner: ShadcnRunner, item: string): string {
  return shadcnCommand(runner, `view ${REGISTRY_NAMESPACE}/${item}`);
}

/** `npx shadcn@latest add @skins/winamp --overwrite`: replace an installed copy with the current source files. */
export function shadcnUpdateCommand(runner: ShadcnRunner, item: string): string {
  return `${shadcnAddCommand(runner, item)} --overwrite`;
}

/** Every command a namespaced install needs, in order: register the namespace, then add the item. */
export function registryInstallCommands(runner: ShadcnRunner, framework: RegistryFramework, item: string): string {
  return [shadcnRegistryAddCommand(runner, framework), shadcnAddCommand(runner, item)].join('\n');
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

/** Where a skin's files land, relative to the project's components alias: `components/skins/winamp`. */
export function registryInstallDirectory(name: string): string {
  return `${REGISTRY_INSTALL_DIRECTORY}/${name}`;
}

/**
 * The installed files a usage snippet imports for a use case, relative to the components alias: the preset module
 * (`components/skins/winamp/video/skin.tsx`), and for HTML its markup beside it.
 */
export function registryEntryPaths(name: string, useCase: UseCase, framework: RegistryFramework): string[] {
  const directory = `${registryInstallDirectory(name)}/${useCase}`;

  return framework === 'react' ? [`${directory}/skin.tsx`] : [`${directory}/skin.ts`, `${directory}/skin.html`];
}
