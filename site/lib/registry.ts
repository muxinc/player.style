// `@videojs/react` does not export its package.json; the workspace catalog pins every `@videojs/*` to one release.
import videojs from '@videojs/html/package.json';
import {
  componentsJson,
  INSTALL_DIRECTORY,
  REGISTRY_NAMESPACE,
  registryItemUrl,
  registryNamespaceUrl,
} from 'build-registry/names';
import type { Framework } from 'build-skin/names';

import type { UseCase } from './skins';

/**
 * The shadcn registry the site hosts under `/r`, built by `scripts/build-registry` from every skin's sources: one
 * catalog per framework (`/r/react`, `/r/html`), one item per preset of a skin (`winamp`, `winamp-live`), every item
 * installing into the skin's folder. The commands have the shape Video.js 10 documents for its own skins
 * (`registry add` once, then `add <namespace>/<item>`). The names, URLs and `components.json` come from
 * `build-registry/names`, which the registry build uses too; these helpers add the UI's commands and paths.
 */

export { componentsJson, REGISTRY_NAMESPACE, registryItemUrl, registryNamespaceUrl };

export type RegistryFramework = Framework;
export type ShadcnRunner = 'npm' | 'pnpm' | 'yarn' | 'bun';

/**
 * Where the CLI writes a skin's files, relative to the project's components alias (`src/components` in a Vite
 * project, `components` in a Next one): `components/skins/<name>/`, laid out as the skin's `src/`.
 */
export const REGISTRY_INSTALL_DIRECTORY = `components/${INSTALL_DIRECTORY}`;

export const REGISTRY_FRAMEWORK_LABELS = {
  react: 'React',
  html: 'HTML',
} as const satisfies Record<RegistryFramework, string>;

/** The Video.js package each catalog's items install, pinned to the release every skin targets. */
export const REGISTRY_PACKAGES = {
  react: `@videojs/react@${videojs.version}`,
  html: `@videojs/html@${videojs.version}`,
} as const satisfies Record<RegistryFramework, string>;

export const SHADCN_RUNNER_NAMES = ['npm', 'pnpm', 'yarn', 'bun'] as const satisfies readonly ShadcnRunner[];

export const SHADCN_RUNNERS = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const satisfies Record<ShadcnRunner, string>;

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
 * (`components/skins/winamp/video/skin.tsx`, or `skin.ts` for HTML) and the HTML markup beside it.
 */
export function registryEntryPaths(
  name: string,
  useCase: UseCase,
  framework: RegistryFramework
): { module: string; markup: string } {
  const directory = `${registryInstallDirectory(name)}/${useCase}`;

  return { module: `${directory}/${framework === 'react' ? 'skin.tsx' : 'skin.ts'}`, markup: `${directory}/skin.html` };
}
