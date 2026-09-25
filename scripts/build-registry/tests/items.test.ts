import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { describe, expect, it } from 'vite-plus/test';

import {
  createCatalog,
  createRegistryItem,
  detectPreset,
  exportedComponentName,
  frameworkDependency,
  registryFileTarget,
  registryItemLabel,
  registryItemTitle,
  registryItemUrl,
  registryNamespaceUrl,
  type SkinSource,
} from '../index.ts';

/** A minimal skin source; `preset` lands on the markup root and `name` picks the item name. */
function source(name = 'example', preset = 'video', overrides: Partial<SkinSource> = {}): SkinSource {
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
    expect(detectPreset(source('a', 'audio').files['skin.html'])).toBe('audio');
    expect(detectPreset(source('a', 'live-video').files['skin.html'])).toBe('live-video');
    expect(detectPreset('<media-container class="x">')).toBe('video');
    expect(detectPreset('<media-container class="x" data-preset="background">')).toBe('video');
  });
});

describe('registryItemLabel', () => {
  it('title-cases the slug, keeps the overrides, and spells the live suffix', () => {
    expect(registryItemLabel('sutro-audio')).toBe('Sutro Audio');
    expect(registryItemLabel('demuxed-2022')).toBe('Demuxed 2022');
    expect(registryItemLabel('yt')).toBe('YT');
    expect(registryItemLabel('x-mas')).toBe('X-mas');
    expect(registryItemLabel('videojs-8')).toBe('Video.js 8');
    expect(registryItemLabel('microvideo-live')).toBe('Microvideo Live');
  });
});

describe('registryItemTitle', () => {
  it('suffixes the label with Skin, as Video.js 10 titles its items', () => {
    expect(registryItemTitle('yt')).toBe('YT Skin');
    expect(registryItemTitle('microvideo-live')).toBe('Microvideo Live Skin');
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
    expect(frameworkDependency(source(), 'react')).toBe('@videojs/react@10.0.0-rc.2');
    expect(frameworkDependency(source(), 'html')).toBe('@videojs/html@10.0.0-rc.2');
  });

  it('refuses a missing or ranged peer', () => {
    expect(() => frameworkDependency(source('a', 'video', { peerDependencies: {} }), 'react')).toThrow(/exact/);
    expect(() =>
      frameworkDependency(source('a', 'video', { peerDependencies: { '@videojs/react': '^10' } }), 'react')
    ).toThrow(/exact/);
  });
});

describe('exportedComponentName', () => {
  it('reads the exported component from Skin.tsx', () => {
    expect(exportedComponentName(source('sutro-audio'))).toBe('SutroAudioSkin');
  });
});

describe('createRegistryItem', () => {
  it('builds a schema-valid React block with the component, its stylesheet, and the pinned package', () => {
    const item = createRegistryItem(source('yt'), 'react');

    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item).toMatchObject({
      name: 'yt',
      type: 'registry:block',
      title: 'YT Skin',
      description: 'The yt skin.',
      author: '@muxinc (https://github.com/muxinc)',
      dependencies: ['@videojs/react@10.0.0-rc.2', 'react'],
      categories: ['media', 'skins', 'video'],
      meta: {
        role: 'skin',
        framework: 'react',
        styling: 'css',
        preset: 'video',
        useCase: 'video',
        media: 'video',
        package: '@player.style/yt',
        version: '1.0.0-alpha.0',
        component: 'YtSkin',
      },
    });
    expect(item.files).toEqual([
      {
        path: 'yt/Skin.tsx',
        type: 'registry:component',
        target: '@components/player-style/yt/Skin.tsx',
        content: source('yt').files['Skin.tsx'],
      },
      {
        path: 'yt/skin.css',
        type: 'registry:file',
        target: '@components/player-style/yt/skin.css',
        content: '.ps-yt {}',
      },
    ]);
    expect(item.registryDependencies).toBeUndefined();
  });

  it('documents the React usage as a code block over the installed files, as Video.js 10 does', () => {
    const { docs } = createRegistryItem(source('yt'), 'react');

    expect(docs).toMatch(/^Requires `@videojs\/react@10\.0\.0-rc\.2`, which is installed with this item\./);
    expect(docs).toContain('https://videojs.org/docs/framework/react/concepts/media-sources/');
    expect(docs).toContain('Skin page: https://player.style/skins/yt');
    expect(docs).toContain(
      [
        '```tsx',
        "import { Video, VideoPlayer } from '@videojs/react/video';",
        '',
        "import { YtSkin } from '@/components/player-style/yt/Skin';",
        "import '@/components/player-style/yt/skin.css';",
        '',
        'export function Player({ src }: { src: string }) {',
        '  return (',
        '    <VideoPlayer>',
        '      <YtSkin>',
        '        <Video src={src} />',
        '      </YtSkin>',
        '    </VideoPlayer>',
        '  );',
        '}',
        '```',
      ].join('\n')
    );
  });

  it('builds an HTML block with the markup, the registration, and the stylesheet', () => {
    const item = createRegistryItem(source('yt'), 'html');

    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item.dependencies).toEqual(['@videojs/html@10.0.0-rc.2']);
    expect(item.files?.map((file) => [file.path, file.type, file.target])).toEqual([
      ['yt/skin.html', 'registry:file', '@components/player-style/yt/skin.html'],
      ['yt/register.ts', 'registry:file', '@components/player-style/yt/register.ts'],
      ['yt/skin.css', 'registry:file', '@components/player-style/yt/skin.css'],
    ]);
    expect(item.meta).toMatchObject({ framework: 'html', styling: 'css', useCase: 'video', element: 'yt-skin' });
    expect(item.docs).toContain('https://videojs.org/docs/framework/html/concepts/media-sources/');
    expect(item.docs).toContain(
      [
        '```ts',
        "import '@videojs/html/video/player';",
        "import '@/components/player-style/yt/register';",
        "import '@/components/player-style/yt/skin.css';",
        '```',
      ].join('\n')
    );
    expect(item.docs).toContain('<video-player>\n  <!-- Paste components/player-style/yt/skin.html here');
  });

  it('documents the live video use case as its own item', () => {
    const item = createRegistryItem(source('microvideo-live', 'live-video'), 'react');

    expect(item.name).toBe('microvideo-live');
    expect(item.title).toBe('Microvideo Live Skin');
    expect(item.categories).toEqual(['media', 'skins', 'live-video']);
    expect(item.meta).toMatchObject({ preset: 'live-video', useCase: 'live-video', component: 'MicrovideoLiveSkin' });
    expect(item.docs).toContain('<LiveVideoPlayer>\n      <MicrovideoLiveSkin>');
    expect(item.docs).toContain("from '@videojs/react/live-video'");
    expect(item.files?.[0]?.target).toBe('@components/player-style/microvideo-live/Skin.tsx');

    const html = createRegistryItem(source('microvideo-live', 'live-video'), 'html');

    expect(html.docs).toContain('<live-video-player>');
    expect(html.docs).toContain("import '@videojs/html/live-video/player';");
    expect(html.meta).toMatchObject({ useCase: 'live-video', element: 'microvideo-live-skin' });
  });

  it('documents an audio skin with the audio player and media', () => {
    const item = createRegistryItem(source('sutro-audio', 'audio'), 'react');

    expect(item.meta).toMatchObject({ useCase: 'audio', media: 'audio' });
    expect(item.docs).toContain('<AudioPlayer>\n      <SutroAudioSkin>\n        <Audio src={src} />');
    expect(createRegistryItem(source('sutro-audio', 'audio'), 'html').docs).toContain('<audio-player>');
  });

  it('falls back to the player.style page when the package has no homepage', () => {
    expect(createRegistryItem(source('yt', 'video', { homepage: undefined }), 'react').docs).toContain(
      'https://player.style/skins/yt'
    );
  });
});

describe('createCatalog', () => {
  it('emits a valid registry.json and Video.js 10-shaped catalog entries in the given order', () => {
    const sources = [source('yt'), source('microvideo-live', 'live-video'), source('sutro-audio', 'audio')];
    const { registry, catalog } = createCatalog(sources, 'react');

    expect(registrySchema.safeParse(registry).success).toBe(true);
    expect(registry).toMatchObject({ name: 'player.style', homepage: 'https://player.style' });
    expect(registry.items.map((item) => item.name)).toEqual(['yt', 'microvideo-live', 'sutro-audio']);
    expect(catalog).toEqual([
      {
        name: 'yt',
        label: 'YT',
        description: 'The yt skin.',
        preset: 'video',
        useCase: 'video',
        media: 'video',
        live: false,
        component: 'YtSkin',
        element: 'yt-skin',
        registryItem: 'yt',
        directory: 'yt',
        package: '@player.style/yt',
        version: '1.0.0-alpha.0',
        docs: 'https://player.style/skins/yt',
        url: 'https://player.style/r/react/yt.json',
        files: ['@components/player-style/yt/Skin.tsx', '@components/player-style/yt/skin.css'],
      },
      expect.objectContaining({ name: 'microvideo-live', useCase: 'live-video', live: true, media: 'video' }),
      expect.objectContaining({ name: 'sutro-audio', useCase: 'audio', live: false, media: 'audio' }),
    ]);
  });

  it('uses the same item names in the HTML catalog with the HTML files', () => {
    const { catalog } = createCatalog([source('yt')], 'html');

    expect(catalog[0]).toMatchObject({
      registryItem: 'yt',
      url: 'https://player.style/r/html/yt.json',
      files: [
        '@components/player-style/yt/skin.html',
        '@components/player-style/yt/register.ts',
        '@components/player-style/yt/skin.css',
      ],
    });
  });

  it('refuses sources that disagree on the framework pin', () => {
    const other = source('other', 'video', { peerDependencies: { '@videojs/react': '10.0.0-rc.1' } });

    expect(() => createCatalog([source(), other], 'react')).toThrow(/same framework package/);
  });
});
