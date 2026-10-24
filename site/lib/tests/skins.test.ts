import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { getRegistryFramework } from '../shadcn-install';
import {
  getDefaultUseCase,
  getPreviewFramework,
  getRegistryItem,
  getSkin,
  getSkinFrameworks,
  getSkinUseCases,
  getSkinUseCasesLabel,
  hasUseCase,
  isFixedSizeSkin,
  isThirdPartySkin,
  skins,
  type ThirdPartySkin,
} from '../skins';
import { resolveFramework } from '../third-party-usage';

const skinsDir = join(import.meta.dirname, '../../../skins');

/** A skin with a live video preset beside its video one, the live one in React only. */
const live: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'example',
  builds: { video: ['react', 'html'], 'live-video': ['react'] },
  title: 'Example',
  description: 'A skin with a live video preset.',
  author: { name: 'Someone' },
};

/** The skins whose catalog.json and a built preset module are on disk: the ones the site lists. */
const built = readdirSync(skinsDir).filter(
  (name) =>
    existsSync(join(skinsDir, name, 'catalog.json')) &&
    ['react', 'html'].some((framework) => {
      const dist = join(skinsDir, name, framework, 'dist');

      return existsSync(dist) && readdirSync(dist).some((file) => file.endsWith('.js'));
    })
);

describe('skins', () => {
  it('lists one card per skin, with no separate card for a live preset', () => {
    expect(skins.map((skin) => skin.slug).filter((slug) => slug.endsWith('-live'))).toEqual([]);
  });

  it('gives every slug exactly one card', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('lists every built skin from its catalog.json, and nothing else', () => {
    const listed = skins.filter(isThirdPartySkin);

    expect(listed.map((skin) => skin.slug).sort()).toEqual(built.sort());

    for (const skin of listed) {
      const catalog = JSON.parse(readFileSync(join(skinsDir, skin.slug, 'catalog.json'), 'utf8'));

      expect(skin).toMatchObject({ title: catalog.title, description: catalog.description });
      expect(getSkinUseCases(skin).length).toBeGreaterThan(0);
      for (const useCase of getSkinUseCases(skin)) expect(skin.builds[useCase]?.length, useCase).toBeGreaterThan(0);
    }
  });

  it.runIf(built.includes('winamp'))('reads winamp’s catalog: the fixed-size preview', () => {
    const winamp = getSkin('winamp')!;

    expect(winamp).toMatchObject({ preview: { fixedSize: true } });
    expect(getSkinUseCases(winamp)).toEqual(['video']);
  });
});

describe('getRegistryItem', () => {
  it('names the default use case after the skin and its live twin -live', () => {
    expect(getRegistryItem(live, 'video')).toBe('example');
    expect(getRegistryItem(live, 'live-video')).toBe('example-live');
    expect(getRegistryItem({ ...live, builds: { video: ['react'], audio: ['html'] } }, 'audio')).toBe('example-audio');
  });

  it('throws for a use case the skin does not cover', () => {
    expect(() => getRegistryItem(live, 'audio')).toThrow('Skin "example" has no audio build.');
  });
});

describe('getPreviewFramework', () => {
  it('previews the build asked for, React when none is, and falls back to the build that exists', () => {
    expect(getSkinFrameworks(live, 'video')).toEqual(['react', 'html']);
    expect(getPreviewFramework(live, 'video')).toBe('react');
    expect(getPreviewFramework(live, 'video', 'react')).toBe('react');
    expect(getPreviewFramework(live, 'video', 'html')).toBe('html');
    expect(getPreviewFramework(live, 'live-video', 'html')).toBe('react');
    expect(getPreviewFramework({ ...live, builds: { video: ['html'] } }, 'video')).toBe('html');
  });

  it('previews what a skin page installs: the HTML build by default, React only when there is no HTML build', () => {
    const preview = (skin: ThirdPartySkin, value?: string) =>
      getPreviewFramework(skin, 'video', getRegistryFramework(resolveFramework(skin, 'video', value)));

    expect(preview(live)).toBe('html');
    expect(preview(live, 'html')).toBe('html');
    expect(preview(live, 'vue')).toBe('html');
    expect(preview(live, 'react')).toBe('react');
    expect(preview({ ...live, builds: { video: ['react'] } })).toBe('react');
  });
});

describe('getSkinUseCases', () => {
  it('lists a first-party skin’s one use case and each of a third-party skin’s', () => {
    const defaultLive = getSkin('default-live-video')!;

    expect(getSkinUseCases(defaultLive)).toEqual(['live-video']);
    expect(getDefaultUseCase(defaultLive)).toBe('live-video');
    expect(getSkinUseCases(live)).toEqual(['video', 'live-video']);
    expect(getDefaultUseCase(live)).toBe('video');
    expect(hasUseCase(live, 'live-video')).toBe(true);
    expect(hasUseCase(live, 'audio')).toBe(false);
  });
});

describe('getSkinUseCasesLabel', () => {
  it('names a single use case as the filter does and adds "Live" for a live preset', () => {
    expect(getSkinUseCasesLabel(getSkin('neutral-video')!)).toBe('Video');
    expect(getSkinUseCasesLabel(getSkin('default-live-video')!)).toBe('Live Video');
    expect(getSkinUseCasesLabel(live)).toBe('Video · Live');
  });
});

describe('isFixedSizeSkin', () => {
  it('holds for a third-party skin whose preview says it draws at a fixed size, and no other', () => {
    expect(isFixedSizeSkin({ ...live, preview: { fixedSize: true } })).toBe(true);
    expect(isFixedSizeSkin(live)).toBe(false);
    expect(isFixedSizeSkin(getSkin('default-video')!)).toBe(false);
  });
});
