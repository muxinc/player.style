import {
  componentsJson,
  registryInstallCommands,
  registryInstallDirectory,
  shadcnAddUrlCommand,
  shadcnUpdateCommand,
  shadcnViewCommand,
  SHADCN_RUNNER_NAMES,
  tsconfigPathsSnippet,
  type RegistryFramework,
  type ShadcnRunner,
} from './registry';
import { getRegistryItem, type ThirdPartySkin, type UseCase } from './skins';
import type { Framework } from './third-party-usage';

/** One runner's commands: the tab is the runner, the code the namespaced install. */
export interface ShadcnCommands {
  name: ShadcnRunner;
  /** `registry add` then `add`, one per line. */
  namespaced: string;
  /** The single `add <url>` line that needs no namespace. */
  url: string;
  /** `view` and `add --overwrite` as one commented script, for reviewing the item and updating it later. */
  maintain: string;
}

/** Everything the shadcn picker shows for a skin, use case, and framework. */
export interface ShadcnInstall {
  /** The catalog the framework installs from: React gets the React item, everything else the HTML one. */
  registryFramework: RegistryFramework;
  /** The registry item: `<name>`, `<name>-live` or `<name>-<preset>`. */
  item: string;
  commands: ShadcnCommands[];
  /** A minimal `components.json` for a project that never ran `shadcn init`. */
  componentsJson: string;
  /** The `@/*` alias the CLI resolves `aliases.components` through. */
  tsconfigPaths: string;
}

/** Vue and Svelte render the HTML element, so they install from the HTML catalog. */
export function getRegistryFramework(framework: Framework): RegistryFramework {
  return framework === 'react' ? 'react' : 'html';
}

/** The global stylesheet each framework's Vite scaffold starts with, which `components.json` must name. */
const SCAFFOLD_STYLESHEETS: Record<Framework, string> = {
  html: 'src/style.css',
  react: 'src/index.css',
  vue: 'src/style.css',
  svelte: 'src/app.css',
};

export function getShadcnInstall(skin: ThirdPartySkin, useCase: UseCase, framework: Framework): ShadcnInstall {
  const registryFramework = getRegistryFramework(framework);
  const item = getRegistryItem(skin, useCase);

  return {
    registryFramework,
    item,
    commands: SHADCN_RUNNER_NAMES.map((runner) => ({
      name: runner,
      namespaced: registryInstallCommands(runner, registryFramework, item),
      url: shadcnAddUrlCommand(runner, item, registryFramework),
      maintain: [
        '# Read the files before adding them',
        shadcnViewCommand(runner, item),
        '',
        '# Later: replace your copy with the current source (commit your edits first)',
        shadcnUpdateCommand(runner, item),
      ].join('\n'),
    })),
    componentsJson: componentsJson(registryFramework, { css: SCAFFOLD_STYLESHEETS[framework] }),
    tsconfigPaths: tsconfigPathsSnippet(),
  };
}

/**
 * The import specifier of the use case's installed preset folder, from the file the snippet lives in: `index.html`
 * and the React component sit beside `components/`, a Vue component inside it, and a Svelte component in `lib/`
 * beside it. Relative paths work whether or not the bundler knows the `@/` alias the CLI resolved.
 */
export function getShadcnImportBase(skin: ThirdPartySkin, useCase: UseCase, framework: Framework): string {
  const directory = `${registryInstallDirectory(skin.slug)}/${useCase}`;

  switch (framework) {
    case 'vue':
      return `./${directory.replace(/^components\//, '')}`;
    case 'svelte':
      return `../${directory}`;
    default:
      return `./${directory}`;
  }
}
