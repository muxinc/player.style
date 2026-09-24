import { describe, expect, it } from 'vite-plus/test';

import { getOpenImportBase, getOpenInstall, getRegistryFramework } from '../open-install';
import type { ThirdPartySkin } from '../skins';

const skin: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'microvideo',
  name: 'microvideo',
  edition: 'on-demand',
  title: 'Microvideo',
  description: 'Compact.',
  useCase: 'video',
  author: { name: 'Someone' },
  package: '@player.style/microvideo',
};

const live: ThirdPartySkin = {
  ...skin,
  slug: 'microvideo-live',
  name: 'microvideo-live',
  package: '@player.style/microvideo-live',
  edition: 'live',
  useCase: 'live-video',
};

describe('getRegistryFramework', () => {
  it('installs React from the React catalog and every HTML-edition framework from the HTML one', () => {
    expect(getRegistryFramework('react')).toBe('react');
    expect(getRegistryFramework('html')).toBe('html');
    expect(getRegistryFramework('vue')).toBe('html');
    expect(getRegistryFramework('svelte')).toBe('html');
  });
});

describe('getOpenInstall', () => {
  it('builds the namespaced two-step and the URL form for every runner', () => {
    const install = getOpenInstall(skin, 'react');

    expect(install.registryFramework).toBe('react');
    expect(install.item).toBe('microvideo');
    expect(install.commands.map((command) => command.name)).toEqual(['npm', 'pnpm', 'yarn', 'bun']);
    expect(install.commands[0]).toEqual({
      name: 'npm',
      namespaced: [
        'npx shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json',
        'npx shadcn@latest add @player-style/microvideo',
      ].join('\n'),
      url: 'npx shadcn@latest add https://player.style/r/react/microvideo.json',
    });
    expect(install.commands[3]).toEqual({
      name: 'bun',
      namespaced: [
        'bunx --bun shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json',
        'bunx --bun shadcn@latest add @player-style/microvideo',
      ].join('\n'),
      url: 'bunx --bun shadcn@latest add https://player.style/r/react/microvideo.json',
    });
  });

  it('points Vue and Svelte at the HTML catalog with the HTML files', () => {
    const vue = getOpenInstall(skin, 'vue');

    expect(vue.registryFramework).toBe('html');
    expect(vue.commands[1]?.namespaced).toBe(
      [
        'pnpm dlx shadcn@latest registry add @player-style=https://player.style/r/html/{name}.json',
        'pnpm dlx shadcn@latest add @player-style/microvideo',
      ].join('\n')
    );
    expect(vue.commands[2]?.url).toBe('yarn dlx shadcn@latest add https://player.style/r/html/microvideo.json');
    expect(vue.targetPaths).toEqual([
      'components/player-style/microvideo/skin.html',
      'components/player-style/microvideo/register.ts',
      'components/player-style/microvideo/skin.css',
    ]);
    expect(getOpenInstall(skin, 'svelte').targetPaths).toEqual(vue.targetPaths);
    expect(getOpenInstall(skin, 'html').targetPaths).toEqual(vue.targetPaths);
  });

  it('names the live edition item and directory after the live package', () => {
    const install = getOpenInstall(live, 'react');

    expect(install.item).toBe('microvideo-live');
    expect(install.directory).toBe('components/player-style/microvideo-live');
    expect(install.commands[0]?.namespaced).toContain('add @player-style/microvideo-live');
    expect(install.commands[0]?.url).toBe('npx shadcn@latest add https://player.style/r/react/microvideo-live.json');
    expect(install.targetPaths).toEqual([
      'components/player-style/microvideo-live/Skin.tsx',
      'components/player-style/microvideo-live/skin.css',
    ]);
  });

  it('ships a components.json pointed at the chosen catalog, keeping cssVariables on', () => {
    const config = JSON.parse(getOpenInstall(skin, 'html').componentsJson);

    expect(config.registries).toEqual({ '@player-style': 'https://player.style/r/html/{name}.json' });
    expect(config.tailwind.cssVariables).toBe(true);
    expect(JSON.parse(getOpenInstall(skin, 'react').componentsJson).registries).toEqual({
      '@player-style': 'https://player.style/r/react/{name}.json',
    });
  });
});

describe('getOpenImportBase', () => {
  it('reaches the installed directory from where each framework’s snippet file lives', () => {
    expect(getOpenImportBase(skin, 'html')).toBe('./components/player-style/microvideo');
    expect(getOpenImportBase(skin, 'react')).toBe('./components/player-style/microvideo');
    expect(getOpenImportBase(skin, 'vue')).toBe('./player-style/microvideo');
    expect(getOpenImportBase(skin, 'svelte')).toBe('../components/player-style/microvideo');
    expect(getOpenImportBase(live, 'react')).toBe('./components/player-style/microvideo-live');
  });
});
