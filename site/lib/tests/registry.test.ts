import { describe, expect, it } from 'vite-plus/test';

import {
  componentsJsonRegistriesSnippet,
  componentsJsonSnippet,
  registryCatalogUrl,
  registryInstallCommands,
  registryInstallDirectory,
  registryItemName,
  registryItemUrl,
  registryNamespaceUrl,
  registryTargetPaths,
  shadcnAddCommand,
  shadcnAddUrlCommand,
  shadcnRegistryAddCommand,
  SHADCN_RUNNER_NAMES,
} from '../registry';

describe('registryItemName', () => {
  it('names the item after the skin directory, adding the live suffix for a live use case only once', () => {
    expect(registryItemName('yt')).toBe('yt');
    expect(registryItemName('yt', 'video')).toBe('yt');
    expect(registryItemName('sutro-audio', 'audio')).toBe('sutro-audio');
    expect(registryItemName('microvideo', 'live-video')).toBe('microvideo-live');
    expect(registryItemName('microvideo-live', 'live-video')).toBe('microvideo-live');
  });
});

describe('registryItemUrl', () => {
  it('hosts one catalog per framework under /r with the same item names', () => {
    expect(registryCatalogUrl('react')).toBe('https://player.style/r/react');
    expect(registryNamespaceUrl('html')).toBe('https://player.style/r/html/{name}.json');
    expect(registryItemUrl('yt', 'video', 'react')).toBe('https://player.style/r/react/yt.json');
    expect(registryItemUrl('yt', 'video', 'html')).toBe('https://player.style/r/html/yt.json');
    expect(registryItemUrl('microvideo', 'live-video', 'react')).toBe(
      'https://player.style/r/react/microvideo-live.json'
    );
  });
});

describe('shadcnAddCommand', () => {
  it('builds the namespaced add for every runner', () => {
    expect(SHADCN_RUNNER_NAMES.map((runner) => shadcnAddCommand(runner, 'yt'))).toEqual([
      'npx shadcn@latest add @player-style/yt',
      'pnpm dlx shadcn@latest add @player-style/yt',
      'yarn dlx shadcn@latest add @player-style/yt',
      'bunx --bun shadcn@latest add @player-style/yt',
    ]);
    expect(shadcnAddCommand('npm', 'microvideo', 'live-video')).toBe(
      'npx shadcn@latest add @player-style/microvideo-live'
    );
  });
});

describe('shadcnAddUrlCommand', () => {
  it('adds by the hosted URL without a namespace', () => {
    expect(shadcnAddUrlCommand('pnpm', 'yt', 'video', 'html')).toBe(
      'pnpm dlx shadcn@latest add https://player.style/r/html/yt.json'
    );
  });
});

describe('shadcnRegistryAddCommand', () => {
  it('points the namespace at one catalog', () => {
    expect(shadcnRegistryAddCommand('npm', 'react')).toBe(
      'npx shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json'
    );
  });
});

describe('registryInstallCommands', () => {
  it('registers the namespace and then adds the item', () => {
    expect(registryInstallCommands('bun', 'html', 'sutro-audio')).toBe(
      [
        'bunx --bun shadcn@latest registry add @player-style=https://player.style/r/html/{name}.json',
        'bunx --bun shadcn@latest add @player-style/sutro-audio',
      ].join('\n')
    );
  });
});

describe('componentsJsonRegistriesSnippet', () => {
  it('is the registries entry for one catalog', () => {
    expect(JSON.parse(componentsJsonRegistriesSnippet('react'))).toEqual({
      registries: { '@player-style': 'https://player.style/r/react/{name}.json' },
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
      tailwind: { css: 'src/style.css', cssVariables: true },
      aliases: { components: '@/components' },
      registries: { '@player-style': 'https://player.style/r/html/{name}.json' },
    });
    expect(JSON.parse(componentsJsonSnippet('react')).tailwind.css).toBe('src/index.css');
  });
});

describe('registryTargetPaths', () => {
  it('lists where each catalog puts the files, under the components alias', () => {
    expect(registryInstallDirectory('yt')).toBe('components/player-style/yt');
    expect(registryTargetPaths('yt', 'video', 'react')).toEqual([
      'components/player-style/yt/Skin.tsx',
      'components/player-style/yt/skin.css',
    ]);
    expect(registryTargetPaths('microvideo', 'live-video', 'html')).toEqual([
      'components/player-style/microvideo-live/skin.html',
      'components/player-style/microvideo-live/register.ts',
      'components/player-style/microvideo-live/skin.css',
    ]);
  });
});
