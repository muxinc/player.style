import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { describe, expect, it } from 'vite-plus/test';

import {
  createCatalog,
  createRegistryItem,
  detectPreset,
  exportedComponentName,
  frameworkDependency,
  type OpenEdition,
  registryFileTarget,
  registryItemTitle,
  registryItemUrl,
  registryNamespaceUrl,
} from '../index.ts';

/** A minimal open edition; `preset` lands on the markup root and `name` picks the item name. */
function edition(name = 'example', preset = 'video', overrides: Partial<OpenEdition> = {}): OpenEdition {
  const component = `${name.charAt(0).toUpperCase()}${name.slice(1).replace(/-(\w)/g, (_m, c: string) => c.toUpperCase())}Skin`;

  return {
    name,
    package: `@player.style/${name}`,
    version: '1.0.0-alpha.0',
    description: `The ${name} skin.`,
    homepage: `https://player.style/skins/${name}`,
    author: '@muxinc',
    peerDependencies: { '@videojs/html': '10.0.0-rc.2', '@videojs/react': '10.0.0-rc.2', react: '^18 || ^19' },
    files: {
      'skin.html': `<media-container class="media-skin ps-${name}" data-theme="${name}" data-preset="${preset}">\n  <!-- Add a compatible media element here. -->\n</media-container>`,
      'skin.css': `.ps-${name} {}`,
      'register.ts': "import '@videojs/html/ui/container';\n",
      'Skin.tsx': `'use client';\n\nexport function ${component}() {\n  return null;\n}\n`,
    },
    ...overrides,
  };
}

describe('detectPreset', () => {
  it('reads the root data-preset and falls back to video', () => {
    expect(detectPreset(edition('a', 'audio').files['skin.html'])).toBe('audio');
    expect(detectPreset(edition('a', 'live-video').files['skin.html'])).toBe('live-video');
    expect(detectPreset('<media-container class="x">')).toBe('video');
    expect(detectPreset('<media-container class="x" data-preset="background">')).toBe('video');
  });
});

describe('registryItemTitle', () => {
  it('title-cases the slug, keeps the overrides, and spells the live suffix', () => {
    expect(registryItemTitle('sutro-audio')).toBe('Sutro Audio');
    expect(registryItemTitle('demuxed-2022')).toBe('Demuxed 2022');
    expect(registryItemTitle('yt')).toBe('YT');
    expect(registryItemTitle('x-mas')).toBe('X-mas');
    expect(registryItemTitle('microvideo-live')).toBe('Microvideo Live');
  });
});

describe('registryItemUrl', () => {
  it('hosts one catalog per framework under /r', () => {
    expect(registryItemUrl('yt', 'react')).toBe('https://player.style/r/react/yt.json');
    expect(registryItemUrl('yt', 'html')).toBe('https://player.style/r/html/yt.json');
    expect(registryNamespaceUrl('react')).toBe('https://player.style/r/react/{name}.json');
  });
});

describe('registryFileTarget', () => {
  it('places every file under the components alias in a directory named after the item', () => {
    expect(registryFileTarget('yt', 'Skin.tsx')).toBe('@components/player-style/yt/Skin.tsx');
    expect(registryFileTarget('microvideo-live', 'skin.html')).toBe(
      '@components/player-style/microvideo-live/skin.html'
    );
  });
});

describe('frameworkDependency', () => {
  it('pins the framework package to the exact peer version', () => {
    expect(frameworkDependency(edition(), 'react')).toBe('@videojs/react@10.0.0-rc.2');
    expect(frameworkDependency(edition(), 'html')).toBe('@videojs/html@10.0.0-rc.2');
  });

  it('refuses a missing or ranged peer', () => {
    expect(() => frameworkDependency(edition('a', 'video', { peerDependencies: {} }), 'react')).toThrow(/exact/);
    expect(() =>
      frameworkDependency(edition('a', 'video', { peerDependencies: { '@videojs/react': '^10' } }), 'react')
    ).toThrow(/exact/);
  });
});

describe('exportedComponentName', () => {
  it('reads the exported component from Skin.tsx', () => {
    expect(exportedComponentName(edition('sutro-audio'))).toBe('SutroAudioSkin');
  });
});

describe('createRegistryItem', () => {
  it('builds a schema-valid React block with the component, its stylesheet, and the pinned package', () => {
    const item = createRegistryItem(edition('yt'), 'react');

    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item).toMatchObject({
      name: 'yt',
      type: 'registry:block',
      title: 'YT',
      description: 'The yt skin.',
      author: '@muxinc (https://github.com/muxinc)',
      dependencies: ['@videojs/react@10.0.0-rc.2'],
      categories: ['media', 'skins', 'video'],
      meta: {
        package: '@player.style/yt',
        framework: 'react',
        preset: 'video',
        edition: 'on-demand',
        component: 'YtSkin',
      },
    });
    expect(item.files).toEqual([
      {
        path: 'yt/Skin.tsx',
        type: 'registry:component',
        target: '@components/player-style/yt/Skin.tsx',
        content: edition('yt').files['Skin.tsx'],
      },
      {
        path: 'yt/skin.css',
        type: 'registry:file',
        target: '@components/player-style/yt/skin.css',
        content: '.ps-yt {}',
      },
    ]);
    expect(item.docs).toContain('<VideoPlayer><YtSkin><Video src="..." /></YtSkin></VideoPlayer>');
    expect(item.docs).toContain('https://player.style/skins/yt');
    expect(item.registryDependencies).toBeUndefined();
  });

  it('builds an HTML block with the markup, the registration, and the stylesheet as plain files', () => {
    const item = createRegistryItem(edition('yt'), 'html');

    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item.dependencies).toEqual(['@videojs/html@10.0.0-rc.2']);
    expect(item.files?.map((file) => [file.path, file.type, file.target])).toEqual([
      ['yt/skin.html', 'registry:file', '@components/player-style/yt/skin.html'],
      ['yt/register.ts', 'registry:file', '@components/player-style/yt/register.ts'],
      ['yt/skin.css', 'registry:file', '@components/player-style/yt/skin.css'],
    ]);
    expect(item.meta).toMatchObject({ framework: 'html', element: 'yt-skin' });
    expect(item.docs).toContain('<video-player>');
    expect(item.docs).toContain('@videojs/html/video/player');
  });

  it('documents the live edition on the live-video preset as its own item', () => {
    const item = createRegistryItem(edition('microvideo-live', 'live-video'), 'react');

    expect(item.name).toBe('microvideo-live');
    expect(item.title).toBe('Microvideo Live');
    expect(item.categories).toEqual(['media', 'skins', 'live-video']);
    expect(item.meta).toMatchObject({ preset: 'live-video', edition: 'live', component: 'MicrovideoLiveSkin' });
    expect(item.docs).toContain('<LiveVideoPlayer><MicrovideoLiveSkin>');
    expect(item.docs).toContain('@videojs/react/live-video');
    expect(item.files?.[0]?.target).toBe('@components/player-style/microvideo-live/Skin.tsx');

    const html = createRegistryItem(edition('microvideo-live', 'live-video'), 'html');

    expect(html.docs).toContain('<live-video-player>');
    expect(html.meta).toMatchObject({ element: 'microvideo-live-skin' });
  });

  it('documents an audio skin with the audio player', () => {
    const item = createRegistryItem(edition('sutro-audio', 'audio'), 'react');

    expect(item.docs).toContain('<AudioPlayer><SutroAudioSkin><Audio src="..." />');
    expect(createRegistryItem(edition('sutro-audio', 'audio'), 'html').docs).toContain('<audio-player>');
  });

  it('falls back to the player.style page when the package has no homepage', () => {
    expect(createRegistryItem(edition('yt', 'video', { homepage: undefined }), 'react').docs).toContain(
      'https://player.style/skins/yt'
    );
  });
});

describe('createCatalog', () => {
  it('emits a valid registry.json and a catalog index in the given order', () => {
    const editions = [edition('yt'), edition('microvideo-live', 'live-video'), edition('sutro-audio', 'audio')];
    const { registry, catalog } = createCatalog(editions, 'react');

    expect(registrySchema.safeParse(registry).success).toBe(true);
    expect(registry).toMatchObject({ name: 'player.style', homepage: 'https://player.style' });
    expect(registry.items.map((item) => item.name)).toEqual(['yt', 'microvideo-live', 'sutro-audio']);
    expect(catalog).toEqual({
      framework: 'react',
      dependency: '@videojs/react@10.0.0-rc.2',
      items: [
        {
          name: 'yt',
          title: 'YT',
          description: 'The yt skin.',
          edition: 'on-demand',
          preset: 'video',
          package: '@player.style/yt',
          version: '1.0.0-alpha.0',
          docs: 'https://player.style/skins/yt',
          url: 'https://player.style/r/react/yt.json',
          files: ['@components/player-style/yt/Skin.tsx', '@components/player-style/yt/skin.css'],
        },
        expect.objectContaining({ name: 'microvideo-live', edition: 'live', preset: 'live-video' }),
        expect.objectContaining({ name: 'sutro-audio', edition: 'on-demand', preset: 'audio' }),
      ],
    });
  });

  it('uses the same item names in the HTML catalog with the HTML files', () => {
    const { catalog } = createCatalog([edition('yt')], 'html');

    expect(catalog.dependency).toBe('@videojs/html@10.0.0-rc.2');
    expect(catalog.items[0]).toMatchObject({
      url: 'https://player.style/r/html/yt.json',
      files: [
        '@components/player-style/yt/skin.html',
        '@components/player-style/yt/register.ts',
        '@components/player-style/yt/skin.css',
      ],
    });
  });

  it('refuses editions that disagree on the framework pin', () => {
    const other = edition('other', 'video', { peerDependencies: { '@videojs/react': '10.0.0-rc.1' } });

    expect(() => createCatalog([edition(), other], 'react')).toThrow(/same framework package/);
  });
});
