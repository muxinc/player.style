import type { Framework, Preset } from 'build-skin';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { describe, expect, it } from 'vite-plus/test';

import {
  createCatalog,
  createRegistryItem,
  presetFiles,
  registryDependencies,
  registryFileTarget,
  registryItemLabel,
  registryItemName,
  registryItemUrl,
  registryNamespaceUrl,
  rewriteImports,
  type SkinSource,
} from '../index.ts';

/** A skin package with the given presets: a module per preset, a shared stylesheet (and React helper), the preview sheet. */
function source(framework: Framework = 'react', presets: Preset[] = ['video']): SkinSource {
  const files: Record<string, string> = {
    'skin.css': '/* Global styles for the skin, loaded only in the preview. */\n',
    'styles/example.css': '.ps-example {}\n',
  };

  if (framework === 'react') files['lib/cn.ts'] = 'export const cn = () => "";\n';

  for (const preset of presets) {
    if (framework === 'react') {
      files[`${preset}/skin.tsx`] =
        "'use client';\n\nimport { cn } from '@/lib/cn';\nimport '../styles/example.css';\n";
    } else {
      files[`${preset}/skin.ts`] = "import '../styles/example.css';\nimport '@videojs/html/ui/container';\n";
      files[`${preset}/skin.html`] =
        '<media-container>\n<!-- Add a compatible media component here. -->\n</media-container>\n';
    }
  }

  return {
    name: 'example',
    framework,
    manifest: {
      name: 'Example',
      framework,
      styling: 'css',
      preset: presets[0]!,
      base: 'scaffold',
      videojs: '10.2.0',
      source: 'src',
    },
    catalog: {
      title: 'Example',
      description: 'An example skin.',
      author: { name: 'Someone', github: 'someone' },
    },
    defaultPreset: presets[0]!,
    presets,
    dependencies: framework === 'react' ? ['react', 'cn', '@videojs/react'] : ['@videojs/html'],
    files,
  };
}

describe('registryItemName', () => {
  it('names the default preset after the skin, its live twin -live, and any other preset after itself', () => {
    expect(registryItemName('example', 'video', 'video')).toBe('example');
    expect(registryItemName('example', 'video', 'live-video')).toBe('example-live');
    expect(registryItemName('example', 'video', 'audio')).toBe('example-audio');
    expect(registryItemName('example', 'video', 'live-audio')).toBe('example-live-audio');
    expect(registryItemName('example', 'audio', 'live-audio')).toBe('example-live');
  });
});

describe('registryItemLabel', () => {
  it('uses the catalog title and adds the preset when it is not the default', () => {
    expect(registryItemLabel('Example', 'video', 'video')).toBe('Example');
    expect(registryItemLabel('Example', 'video', 'live-video')).toBe('Example Live');
    expect(registryItemLabel('Example', 'video', 'audio')).toBe('Example Audio');
  });
});

describe('registryItemUrl', () => {
  it('hosts one catalog per framework under /r', () => {
    expect(registryItemUrl('winamp', 'react')).toBe('https://skins.videojs.org/r/react/winamp.json');
    expect(registryNamespaceUrl('html')).toBe('https://skins.videojs.org/r/html/{name}.json');
  });
});

describe('registryFileTarget', () => {
  it('places every preset’s files in one folder named after the skin, as in the project’s src/', () => {
    expect(registryFileTarget('winamp', 'video/skin.tsx')).toBe('@components/skins/winamp/video/skin.tsx');
  });
});

describe('rewriteImports', () => {
  it('points the project’s @/ alias at the skin’s install folder, in either quote style', () => {
    expect(rewriteImports(`import { cn } from '@/lib/cn';\nimport "@/ui/button";`, 'winamp')).toBe(
      `import { cn } from '@/components/skins/winamp/lib/cn';\nimport "@/components/skins/winamp/ui/button";`
    );
    expect(rewriteImports("import '@videojs/react';", 'winamp')).toBe("import '@videojs/react';");
  });
});

describe('presetFiles', () => {
  it('takes the preset’s folder and the shared ones, but not other presets or the preview sheet', () => {
    const skin = source('react', ['video', 'live-video']);

    expect(presetFiles(skin, 'live-video')).toEqual(['lib/cn.ts', 'live-video/skin.tsx', 'styles/example.css']);
  });

  it('keeps a Tailwind skin’s src/skin.css, its Tailwind entry', () => {
    const skin = source('react', ['video']);

    expect(presetFiles({ ...skin, manifest: { ...skin.manifest, styling: 'tailwind' } }, 'video')).toContain(
      'skin.css'
    );
  });
});

describe('registryDependencies', () => {
  it('pins the Video.js packages to the skin’s release and leaves the rest unversioned', () => {
    expect(registryDependencies(source())).toEqual(['@videojs/react@10.2.0', 'cn', 'react']);
  });
});

describe('createRegistryItem', () => {
  it('builds a schema-valid React block of the preset’s source files', () => {
    const item = createRegistryItem(source(), 'video');

    expect(registryItemSchema.safeParse(item).success).toBe(true);
    expect(item).toMatchObject({
      name: 'example',
      type: 'registry:block',
      title: 'Example Skin',
      description: 'An example skin.',
      author: 'Someone (https://github.com/someone)',
      dependencies: ['@videojs/react@10.2.0', 'cn', 'react'],
      categories: ['media', 'skins', 'video'],
      meta: {
        role: 'skin',
        framework: 'react',
        styling: 'css',
        preset: 'video',
        media: 'video',
        component: 'VideoSkin',
      },
    });
    expect(item.files?.map((file) => [file.path, file.type, file.target])).toEqual([
      ['example/lib/cn.ts', 'registry:component', '@components/skins/example/lib/cn.ts'],
      ['example/styles/example.css', 'registry:file', '@components/skins/example/styles/example.css'],
      ['example/video/skin.tsx', 'registry:component', '@components/skins/example/video/skin.tsx'],
    ]);
    expect(item.files?.[2]?.content).toContain("import { cn } from '@/components/skins/example/lib/cn';");
  });

  it('documents the React usage over the installed preset module, which imports its own CSS', () => {
    const { docs } = createRegistryItem(source(), 'video');

    expect(docs).toMatch(/^Requires `@videojs\/react@10\.2\.0`, installed with this item\./);
    expect(docs).toContain('Skin page: https://skins.videojs.org/skins/example');
    expect(docs).toContain("import { VideoSkin } from '@/components/skins/example/video/skin';");
    expect(docs).toContain('<VideoPlayer>\n      <VideoSkin>\n        <Video src={src} />');
    expect(docs).not.toContain('.css');
  });

  it('builds an HTML block with the markup, the registrations and the stylesheet', () => {
    const item = createRegistryItem(source('html'), 'video');

    expect(item.dependencies).toEqual(['@videojs/html@10.2.0']);
    expect(item.files?.map((file) => [file.path, file.type])).toEqual([
      ['example/styles/example.css', 'registry:file'],
      ['example/video/skin.html', 'registry:file'],
      ['example/video/skin.ts', 'registry:file'],
    ]);
    expect(item.meta).toMatchObject({ framework: 'html', player: 'video-player' });
    expect(item.docs).toContain(
      "import '@videojs/html/video/player';\nimport '@/components/skins/example/video/skin';"
    );
    expect(item.docs).toContain('<video-player>\n  <!-- Paste components/skins/example/video/skin.html here');
  });

  it('names a live preset’s item -live and documents its player', () => {
    const item = createRegistryItem(source('react', ['video', 'live-video']), 'live-video');

    expect(item.name).toBe('example-live');
    expect(item.title).toBe('Example Live Skin');
    expect(item.meta).toMatchObject({ preset: 'live-video', component: 'LiveVideoSkin' });
    expect(item.docs).toContain("import { Video, LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(item.docs).toContain('Skin page: https://skins.videojs.org/skins/example?use-case=live-video');
  });

  it('documents an audio skin with the audio player and media', () => {
    const item = createRegistryItem(source('react', ['audio']), 'audio');

    expect(item.meta).toMatchObject({ preset: 'audio', media: 'audio', component: 'AudioSkin' });
    expect(item.docs).toContain('<AudioPlayer>\n      <AudioSkin>\n        <Audio src={src} />');
  });
});

describe('createCatalog', () => {
  it('emits one item per preset of the framework’s packages, with Video.js 10-shaped entries', () => {
    const sources = [source('react', ['video', 'live-video']), source('html', ['video'])];
    const { registry, catalog } = createCatalog(sources, 'react');

    expect(registrySchema.safeParse(registry).success).toBe(true);
    expect(registry).toMatchObject({ name: 'skins', homepage: 'https://skins.videojs.org' });
    expect(registry.items.map((item) => item.name)).toEqual(['example', 'example-live']);
    expect(catalog[0]).toEqual({
      name: 'example',
      label: 'Example',
      description: 'An example skin.',
      preset: 'video',
      media: 'video',
      live: false,
      component: 'VideoSkin',
      registryItem: 'example',
      directory: 'example',
      docs: 'https://skins.videojs.org/skins/example',
      url: 'https://skins.videojs.org/r/react/example.json',
      files: [
        '@components/skins/example/lib/cn.ts',
        '@components/skins/example/styles/example.css',
        '@components/skins/example/video/skin.tsx',
      ],
    });
    expect(catalog[1]).toMatchObject({ name: 'example-live', live: true, directory: 'example' });
  });

  it('lists a skin only in the catalogs of the frameworks it ships', () => {
    expect(createCatalog([source('react')], 'html').registry.items).toEqual([]);
  });

  it('refuses two items with one name', () => {
    expect(() => createCatalog([source(), source()], 'react')).toThrow('Two react items are named "example".');
  });
});
