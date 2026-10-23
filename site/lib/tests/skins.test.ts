import { describe, expect, it } from 'vite-plus/test';

import {
  getDefaultUseCase,
  getSkin,
  getSkinUseCases,
  getSkinUseCasesLabel,
  getThirdPartyPackage,
  hasUseCase,
  isFixedSizeSkin,
  isThirdPartySkin,
  skins,
  type ThirdPartySkin,
} from '../skins';

function thirdParty(slug: string): ThirdPartySkin {
  const found = getSkin(slug);
  if (!found || !isThirdPartySkin(found)) throw new Error(`Missing third-party skin: ${slug}`);

  return found;
}

/** A skin with a live video package, `@player.style/example-live`; no listed skin has one. */
const live: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'example',
  name: 'example',
  useCases: ['video', 'live-video'],
  title: 'Example',
  description: 'A skin with a live video package.',
  author: { name: 'Someone' },
  package: '@player.style/example',
};

describe('skins', () => {
  it('lists one card per skin, with no separate card for a live video package', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(slugs.filter((slug) => slug.endsWith('-live'))).toEqual([]);
  });

  it('gives each third-party skin its base package’s use case', () => {
    for (const skin of skins.filter(isThirdPartySkin)) expect(skin.useCases).toHaveLength(1);
    expect(thirdParty('yt').useCases).toEqual(['video']);
    expect(thirdParty('sutro-audio').useCases).toEqual(['audio']);
  });

  it('links each port to the Media Chrome theme of the same name', () => {
    expect(thirdParty('yt').legacy).toEqual({ theme: 'yt', url: 'https://media-chrome.player.style/themes/yt' });
  });

  it('gives every slug exactly one card', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getThirdPartyPackage', () => {
  it('maps the base use case to the base package and live video to the -live sibling', () => {
    expect(getThirdPartyPackage(live, 'video')).toEqual({
      useCase: 'video',
      name: 'example',
      package: '@player.style/example',
    });
    expect(getThirdPartyPackage(live, 'live-video')).toEqual({
      useCase: 'live-video',
      name: 'example-live',
      package: '@player.style/example-live',
    });
    expect(getThirdPartyPackage(thirdParty('sutro-audio'), 'audio').package).toBe('@player.style/sutro-audio');
  });

  it('throws for a use case the skin does not cover', () => {
    expect(() => getThirdPartyPackage(thirdParty('yt'), 'live-video')).toThrow('Skin "yt" has no live-video package.');
    expect(() => getThirdPartyPackage(live, 'audio')).toThrow(/no audio package/);
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
    expect(hasUseCase(thirdParty('yt'), 'live-video')).toBe(false);
  });
});

describe('getSkinUseCasesLabel', () => {
  it('names a single use case as the filter does and adds "Live" for a live package', () => {
    expect(getSkinUseCasesLabel(getSkin('yt')!)).toBe('Video');
    expect(getSkinUseCasesLabel(getSkin('default-live-video')!)).toBe('Live Video');
    expect(getSkinUseCasesLabel(live)).toBe('Video · Live');
  });
});

describe('isFixedSizeSkin', () => {
  it('holds for a third-party skin whose preview says it draws at a fixed size, and no other', () => {
    expect(isFixedSizeSkin(thirdParty('winamp'))).toBe(true);
    expect(isFixedSizeSkin(thirdParty('yt'))).toBe(false);
    expect(isFixedSizeSkin(getSkin('default-video')!)).toBe(false);
    expect(skins.filter(isFixedSizeSkin).map((skin) => skin.slug)).toEqual(['winamp']);
  });
});
