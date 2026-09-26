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

const LIVE_SKINS = ['essentials', 'microvideo', 'demuxed-2022', 'x-mas', 'videojs-4', 'videojs-8'];

describe('skins', () => {
  it('lists one card per skin, with no separate card for a live video package', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(slugs.filter((slug) => slug.endsWith('-live'))).toEqual([]);
    for (const name of LIVE_SKINS) expect(slugs).toContain(name);
  });

  it('gives the skins with a live video package both use cases, base first', () => {
    for (const name of LIVE_SKINS) expect(thirdParty(name).useCases).toEqual(['video', 'live-video']);

    const single = skins.filter(isThirdPartySkin).filter((skin) => !LIVE_SKINS.includes(skin.slug));
    for (const skin of single) expect(skin.useCases).toHaveLength(1);
    expect(thirdParty('sutro-audio').useCases).toEqual(['audio']);
  });

  it('keeps the essentials rename pointing at the classic minimal theme', () => {
    expect(thirdParty('essentials').legacy?.theme).toBe('minimal');
  });

  it('gives the Video.js recreations their packages and no Media Chrome link', () => {
    for (const slug of ['videojs-1', 'videojs-3', 'videojs-4', 'videojs-8']) {
      const skin = thirdParty(slug);

      expect(skin).toMatchObject({ name: slug, package: `@player.style/${slug}` });
      expect(skin.legacy).toBeUndefined();
    }
    expect(getThirdPartyPackage(thirdParty('videojs-8'), 'live-video').package).toBe('@player.style/videojs-8-live');
    expect(thirdParty('yt').legacy?.url).toBe('https://media-chrome.player.style/themes/yt');
  });

  it('gives every slug exactly one card', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('getThirdPartyPackage', () => {
  it('maps the base use case to the base package and live video to the -live sibling', () => {
    const microvideo = thirdParty('microvideo');

    expect(getThirdPartyPackage(microvideo, 'video')).toEqual({
      useCase: 'video',
      name: 'microvideo',
      package: '@player.style/microvideo',
    });
    expect(getThirdPartyPackage(microvideo, 'live-video')).toEqual({
      useCase: 'live-video',
      name: 'microvideo-live',
      package: '@player.style/microvideo-live',
    });
    expect(getThirdPartyPackage(thirdParty('sutro-audio'), 'audio').package).toBe('@player.style/sutro-audio');
  });

  it('throws for a use case the skin does not cover', () => {
    expect(() => getThirdPartyPackage(thirdParty('yt'), 'live-video')).toThrow('Skin "yt" has no live-video package.');
    expect(() => getThirdPartyPackage(thirdParty('microvideo'), 'audio')).toThrow(/no audio package/);
  });
});

describe('getSkinUseCases', () => {
  it('lists a first-party skin’s one use case and each of a third-party skin’s', () => {
    const defaultLive = getSkin('default-live-video')!;

    expect(getSkinUseCases(defaultLive)).toEqual(['live-video']);
    expect(getDefaultUseCase(defaultLive)).toBe('live-video');
    expect(getSkinUseCases(thirdParty('x-mas'))).toEqual(['video', 'live-video']);
    expect(getDefaultUseCase(thirdParty('x-mas'))).toBe('video');
    expect(hasUseCase(thirdParty('x-mas'), 'live-video')).toBe(true);
    expect(hasUseCase(thirdParty('yt'), 'live-video')).toBe(false);
  });
});

describe('getSkinUseCasesLabel', () => {
  it('names a single use case as the filter does and adds "Live" for a live package', () => {
    expect(getSkinUseCasesLabel(getSkin('yt')!)).toBe('Video');
    expect(getSkinUseCasesLabel(getSkin('default-live-video')!)).toBe('Live Video');
    expect(getSkinUseCasesLabel(thirdParty('microvideo'))).toBe('Video · Live');
  });
});

describe('isFixedSizeSkin', () => {
  it('holds for a third-party skin whose preview says it draws at a fixed size, and no other', () => {
    expect(isFixedSizeSkin(thirdParty('winamp'))).toBe(true);
    expect(isFixedSizeSkin(thirdParty('microvideo'))).toBe(false);
    expect(isFixedSizeSkin(getSkin('default-video')!)).toBe(false);
    expect(skins.filter(isFixedSizeSkin).map((skin) => skin.slug)).toEqual(['winamp']);
  });
});
