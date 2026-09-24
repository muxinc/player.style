import { describe, expect, it } from 'vite-plus/test';

import { getRegistryFramework, getShadcnImportBase, getShadcnInstall } from '../shadcn-install';
import type { ThirdPartySkin } from '../skins';

const skin: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'microvideo',
  name: 'microvideo',
  useCases: ['video', 'live-video'],
  title: 'Microvideo',
  description: 'Compact.',
  author: { name: 'Someone' },
  package: '@player.style/microvideo',
};

describe('getRegistryFramework', () => {
  it('installs React from the React catalog and every HTML-element framework from the HTML one', () => {
    expect(getRegistryFramework('react')).toBe('react');
    expect(getRegistryFramework('html')).toBe('html');
    expect(getRegistryFramework('vue')).toBe('html');
    expect(getRegistryFramework('svelte')).toBe('html');
  });
});

describe('getShadcnInstall', () => {
  it('builds the namespaced two-step and the URL form for every runner', () => {
    const install = getShadcnInstall(skin, 'video', 'react');

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
      view: 'npx shadcn@latest view @player-style/microvideo',
      update: 'npx shadcn@latest add @player-style/microvideo --overwrite',
      maintain: [
        '# Read the files before adding them',
        'npx shadcn@latest view @player-style/microvideo',
        '',
        '# Later: replace your copy with the current source (commit your edits first)',
        'npx shadcn@latest add @player-style/microvideo --overwrite',
      ].join('\n'),
    });
    expect(install.commands[3]).toEqual({
      name: 'bun',
      namespaced: [
        'bunx --bun shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json',
        'bunx --bun shadcn@latest add @player-style/microvideo',
      ].join('\n'),
      url: 'bunx --bun shadcn@latest add https://player.style/r/react/microvideo.json',
      view: 'bunx --bun shadcn@latest view @player-style/microvideo',
      update: 'bunx --bun shadcn@latest add @player-style/microvideo --overwrite',
      maintain: expect.stringContaining('bunx --bun shadcn@latest view @player-style/microvideo'),
    });
  });

  it('points Vue and Svelte at the HTML catalog with the HTML files', () => {
    const vue = getShadcnInstall(skin, 'video', 'vue');

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
    expect(getShadcnInstall(skin, 'video', 'svelte').targetPaths).toEqual(vue.targetPaths);
    expect(getShadcnInstall(skin, 'video', 'html').targetPaths).toEqual(vue.targetPaths);
  });

  it('names the live video item and directory after the -live package', () => {
    const install = getShadcnInstall(skin, 'live-video', 'react');

    expect(install.item).toBe('microvideo-live');
    expect(install.directory).toBe('components/player-style/microvideo-live');
    expect(install.commands[0]?.namespaced).toContain('add @player-style/microvideo-live');
    expect(install.commands[0]?.url).toBe('npx shadcn@latest add https://player.style/r/react/microvideo-live.json');
    expect(install.commands[0]?.update).toBe('npx shadcn@latest add @player-style/microvideo-live --overwrite');
    expect(install.targetPaths).toEqual([
      'components/player-style/microvideo-live/Skin.tsx',
      'components/player-style/microvideo-live/skin.css',
    ]);
  });

  it('ships a components.json pointed at the chosen catalog, keeping cssVariables on', () => {
    const config = JSON.parse(getShadcnInstall(skin, 'video', 'html').componentsJson);

    expect(config.registries).toEqual({ '@player-style': 'https://player.style/r/html/{name}.json' });
    expect(config.tailwind.cssVariables).toBe(true);
    expect(JSON.parse(getShadcnInstall(skin, 'video', 'react').componentsJson).registries).toEqual({
      '@player-style': 'https://player.style/r/react/{name}.json',
    });
  });

  it('names the stylesheet each framework’s Vite scaffold starts with', () => {
    const css = (framework: 'html' | 'react' | 'vue' | 'svelte') =>
      JSON.parse(getShadcnInstall(skin, 'video', framework).componentsJson).tailwind.css;

    expect(css('html')).toBe('src/style.css');
    expect(css('react')).toBe('src/index.css');
    expect(css('vue')).toBe('src/style.css');
    expect(css('svelte')).toBe('src/app.css');
  });

  it('maps the @/* alias without baseUrl', () => {
    expect(JSON.parse(getShadcnInstall(skin, 'video', 'vue').tsconfigPaths)).toEqual({
      compilerOptions: { paths: { '@/*': ['./src/*'] } },
    });
  });
});

describe('getShadcnImportBase', () => {
  it('reaches the installed directory from where each framework’s snippet file lives', () => {
    expect(getShadcnImportBase(skin, 'video', 'html')).toBe('./components/player-style/microvideo');
    expect(getShadcnImportBase(skin, 'video', 'react')).toBe('./components/player-style/microvideo');
    expect(getShadcnImportBase(skin, 'video', 'vue')).toBe('./player-style/microvideo');
    expect(getShadcnImportBase(skin, 'video', 'svelte')).toBe('../components/player-style/microvideo');
    expect(getShadcnImportBase(skin, 'live-video', 'react')).toBe('./components/player-style/microvideo-live');
  });
});
