import { describe, expect, it } from 'vite-plus/test';

import { getBaseSkin, getSkin, isThirdPartySkin, skins, type ThirdPartySkin } from '../skins';

function thirdParty(slug: string): ThirdPartySkin {
  const found = getSkin(slug);
  if (!found || !isThirdPartySkin(found)) throw new Error(`Missing third-party skin: ${slug}`);

  return found;
}

describe('skins', () => {
  it('lists a live card right after each skin that ships a live edition', () => {
    const slugs = skins.map((skin) => skin.slug);

    for (const name of ['essentials', 'microvideo', 'demuxed-2022', 'x-mas']) {
      expect(slugs.indexOf(`${name}-live`)).toBe(slugs.indexOf(name) + 1);
    }
    expect(slugs.filter((slug) => slug.endsWith('-live'))).toHaveLength(4);
  });

  it('derives the live card from its base skin, on the live video use case, as a sibling package', () => {
    const base = thirdParty('microvideo');
    const live = thirdParty('microvideo-live');

    expect(live).toMatchObject({
      kind: 'third-party',
      name: 'microvideo-live',
      edition: 'live',
      title: 'Microvideo Live',
      useCase: 'live-video',
      package: '@player.style/microvideo-live',
      author: base.author,
      legacy: base.legacy,
    });
    expect(base.edition).toBe('on-demand');
    expect(getBaseSkin(live)).toBe(base);
    expect(getBaseSkin(base)).toBe(base);
  });

  it('keeps the essentials rename pointing at the classic minimal theme', () => {
    expect(thirdParty('essentials').legacy?.theme).toBe('minimal');
    expect(thirdParty('essentials-live').legacy?.theme).toBe('minimal');
  });

  it('gives every slug exactly one card', () => {
    const slugs = skins.map((skin) => skin.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
