import {
  componentsJsonSnippet,
  registryInstallCommands,
  registryInstallDirectory,
  registryItemName,
  registryTargetPaths,
  shadcnAddUrlCommand,
  SHADCN_RUNNER_NAMES,
  type RegistryFramework,
  type ShadcnRunner,
} from './registry';
import type { ThirdPartySkin, UseCase } from './skins';
import type { Framework } from './third-party-usage';

/** One runner's commands, shaped for a `CodeTabs` file switcher: the tab is the runner, the code its commands. */
export interface OpenInstallCommand {
  name: ShadcnRunner;
  /** `registry add` then `add`, one per line. */
  namespaced: string;
  /** The single `add <url>` line that needs no namespace. */
  url: string;
}

/** Everything the Open picker shows for a skin, use case, and framework: the shadcn commands and where the files land. */
export interface OpenInstall {
  /** The catalog the framework installs from: React gets the React item, everything else the HTML one. */
  registryFramework: RegistryFramework;
  /** The registry item, `<name>` or `<name>-live`. */
  item: string;
  commands: OpenInstallCommand[];
  /** A minimal `components.json` for a project that never ran `shadcn init`. */
  componentsJson: string;
  /** `components/player-style/<item>`, relative to the project's components alias. */
  directory: string;
  /** The files the catalog installs, as paths under the components alias. */
  targetPaths: string[];
}

/** Vue and Svelte render the HTML edition, so they install from the HTML catalog. */
export function getRegistryFramework(framework: Framework): RegistryFramework {
  return framework === 'react' ? 'react' : 'html';
}

export function getOpenInstall(skin: ThirdPartySkin, useCase: UseCase, framework: Framework): OpenInstall {
  const registryFramework = getRegistryFramework(framework);
  const item = registryItemName(skin.name, useCase);

  return {
    registryFramework,
    item,
    commands: SHADCN_RUNNER_NAMES.map((runner) => ({
      name: runner,
      namespaced: registryInstallCommands(runner, registryFramework, skin.name, useCase),
      url: shadcnAddUrlCommand(runner, skin.name, useCase, registryFramework),
    })),
    componentsJson: componentsJsonSnippet(registryFramework),
    directory: registryInstallDirectory(skin.name, useCase),
    targetPaths: registryTargetPaths(skin.name, useCase, registryFramework),
  };
}

/**
 * The import specifier a usage snippet uses for the installed files, from the file the snippet lives in: `index.html`
 * and the React component sit beside `components/`, a Vue component inside it, and a Svelte component in `lib/`
 * beside it. Copying the files by hand into the same directory gives the same paths.
 */
export function getOpenImportBase(skin: ThirdPartySkin, useCase: UseCase, framework: Framework): string {
  const directory = registryInstallDirectory(skin.name, useCase);

  switch (framework) {
    case 'vue':
      return `./${directory.replace(/^components\//, '')}`;
    case 'svelte':
      return `../${directory}`;
    default:
      return `./${directory}`;
  }
}
