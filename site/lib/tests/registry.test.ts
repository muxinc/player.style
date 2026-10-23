import { describe, expect, it } from 'vite-plus/test';

import {
  componentsJsonRegistriesSnippet,
  componentsJsonSnippet,
  registryCatalogUrl,
  registryEntryPaths,
  registryInstallCommands,
  registryInstallDirectory,
  registryItemUrl,
  registryNamespaceUrl,
  shadcnAddCommand,
  shadcnAddUrlCommand,
  shadcnRegistryAddCommand,
  SHADCN_RUNNER_NAMES,
  shadcnUpdateCommand,
  shadcnViewCommand,
  tsconfigPathsSnippet,
} from '../registry';

describe('registryItemUrl', () => {
  it('hosts one catalog per framework under /r with the same item names', () => {
    expect(registryCatalogUrl('react')).toBe('https://skins.videojs.org/r/react');
    expect(registryNamespaceUrl('html')).toBe('https://skins.videojs.org/r/html/{name}.json');
    expect(registryItemUrl('yt', 'react')).toBe('https://skins.videojs.org/r/react/yt.json');
    expect(registryItemUrl('microvideo-live', 'html')).toBe('https://skins.videojs.org/r/html/microvideo-live.json');
  });
});

describe('shadcnAddCommand', () => {
  it('builds the namespaced add for every runner', () => {
    expect(SHADCN_RUNNER_NAMES.map((runner) => shadcnAddCommand(runner, 'yt'))).toEqual([
      'npx shadcn@latest add @skins/yt',
      'pnpm dlx shadcn@latest add @skins/yt',
      'yarn dlx shadcn@latest add @skins/yt',
      'bunx --bun shadcn@latest add @skins/yt',
    ]);
  });
});

describe('shadcnAddUrlCommand', () => {
  it('adds by the hosted URL without a namespace', () => {
    expect(shadcnAddUrlCommand('pnpm', 'yt', 'html')).toBe(
      'pnpm dlx shadcn@latest add https://skins.videojs.org/r/html/yt.json'
    );
  });
});

describe('shadcnRegistryAddCommand', () => {
  it('points the namespace at one catalog', () => {
    expect(shadcnRegistryAddCommand('npm', 'react')).toBe(
      'npx shadcn@latest registry add @skins=https://skins.videojs.org/r/react/{name}.json'
    );
  });
});

describe('shadcnViewCommand', () => {
  it('prints the namespaced item before installing it', () => {
    expect(shadcnViewCommand('npm', 'yt')).toBe('npx shadcn@latest view @skins/yt');
    expect(shadcnViewCommand('pnpm', 'microvideo-live')).toBe('pnpm dlx shadcn@latest view @skins/microvideo-live');
  });
});

describe('shadcnUpdateCommand', () => {
  it('re-adds the namespaced item over the installed copy', () => {
    expect(shadcnUpdateCommand('npm', 'yt')).toBe('npx shadcn@latest add @skins/yt --overwrite');
  });
});

describe('registryInstallCommands', () => {
  it('registers the namespace and then adds the item', () => {
    expect(registryInstallCommands('bun', 'html', 'sutro-audio')).toBe(
      [
        'bunx --bun shadcn@latest registry add @skins=https://skins.videojs.org/r/html/{name}.json',
        'bunx --bun shadcn@latest add @skins/sutro-audio',
      ].join('\n')
    );
  });
});

describe('componentsJsonRegistriesSnippet', () => {
  it('is the registries entry for one catalog', () => {
    expect(JSON.parse(componentsJsonRegistriesSnippet('react'))).toEqual({
      registries: { '@skins': 'https://skins.videojs.org/r/react/{name}.json' },
    });
  });
});

describe('componentsJsonSnippet', () => {
  it('is a whole components.json with the aliases the CLI resolves targets through', () => {
    const config = JSON.parse(componentsJsonSnippet('html', { css: 'src/style.css' }));

    expect(config).toMatchObject({
      $schema: 'https://ui.shadcn.com/schema.json',
      rsc: false,
      tsx: true,
      tailwind: { css: 'src/style.css', cssVariables: true, prefix: '' },
      aliases: { components: '@/components' },
      registries: { '@skins': 'https://skins.videojs.org/r/html/{name}.json' },
    });
    expect(JSON.parse(componentsJsonSnippet('react')).tailwind.css).toBe('src/index.css');
  });
});

describe('tsconfigPathsSnippet', () => {
  it('maps @/* to ./src/* without the baseUrl TypeScript 6 rejects', () => {
    expect(JSON.parse(tsconfigPathsSnippet())).toEqual({ compilerOptions: { paths: { '@/*': ['./src/*'] } } });
  });
});

describe('registryEntryPaths', () => {
  it('lists the installed preset module, and the markup beside it for HTML, under the skin’s folder', () => {
    expect(registryInstallDirectory('winamp')).toBe('components/skins/winamp');
    expect(registryEntryPaths('winamp', 'video', 'react')).toEqual(['components/skins/winamp/video/skin.tsx']);
    expect(registryEntryPaths('winamp', 'live-video', 'html')).toEqual([
      'components/skins/winamp/live-video/skin.ts',
      'components/skins/winamp/live-video/skin.html',
    ]);
  });
});
