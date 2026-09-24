import { describe, expect, it } from 'vite-plus/test';

import { filterSkins, getGalleryUseCase } from '../filter-skins';
import { getSkin, skins, type ThirdPartySkin } from '../skins';

const community: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'community-video',
  name: 'community-video',
  useCases: ['video'],
  title: 'Community',
  description: 'A community skin.',
  author: { name: 'Someone' },
  package: '@someone/community-skin',
};

const all = [...skins, community];

describe('filterSkins', () => {
  it('returns everything when both groups are empty', () => {
    expect(filterSkins(all, { useCases: [], sources: [] })).toEqual(all);
  });

  it('ORs within the use-case group', () => {
    const result = filterSkins(all, { useCases: ['audio', 'live-audio'], sources: [] });

    expect(result.map((skin) => skin.slug)).toEqual([
      'default-audio',
      'minimal-audio',
      'default-live-audio',
      'minimal-live-audio',
      'sutro-audio',
      'tailwind-audio',
    ]);
  });

  it('ANDs across groups', () => {
    const result = filterSkins(all, { useCases: ['audio'], sources: ['third-party'] });

    expect(result.map((skin) => skin.slug)).toEqual(['sutro-audio', 'tailwind-audio']);
    expect(filterSkins(all, { useCases: ['video'], sources: ['third-party'] })).toContainEqual(community);
  });

  it('matches a skin with a live video package under both Video and Live Video, once', () => {
    const live = filterSkins(all, { useCases: ['live-video'], sources: ['third-party'] }).map((skin) => skin.slug);
    const video = filterSkins(all, { useCases: ['video'], sources: ['third-party'] }).map((skin) => skin.slug);
    const both = filterSkins(all, { useCases: ['video', 'live-video'], sources: [] }).map((skin) => skin.slug);

    expect(live).toEqual(['essentials', 'microvideo', 'demuxed-2022', 'x-mas']);
    expect(video).toEqual(expect.arrayContaining(['essentials', 'microvideo', 'demuxed-2022', 'x-mas', 'yt']));
    expect(both.filter((slug) => slug === 'microvideo')).toHaveLength(1);
    expect(filterSkins(all, { useCases: ['live-video'], sources: ['first-party'] }).map((skin) => skin.slug)).toEqual([
      'default-live-video',
      'minimal-live-video',
    ]);
  });

  it('is empty when a source has no skins', () => {
    const firstParty = skins.filter((skin) => skin.kind === 'first-party');

    expect(filterSkins(firstParty, { useCases: [], sources: ['third-party'] })).toEqual([]);
  });
});

describe('getGalleryUseCase', () => {
  const microvideo = getSkin('microvideo')!;

  it('opens a skin on its default use case unless the filter keeps only another one it covers', () => {
    expect(getGalleryUseCase(microvideo, [])).toBe('video');
    expect(getGalleryUseCase(microvideo, ['video'])).toBe('video');
    expect(getGalleryUseCase(microvideo, ['video', 'live-video'])).toBe('video');
    expect(getGalleryUseCase(microvideo, ['live-video'])).toBe('live-video');
    expect(getGalleryUseCase(microvideo, ['live-video', 'live-audio'])).toBe('live-video');
  });

  it('keeps a single-use-case skin on its one use case', () => {
    expect(getGalleryUseCase(getSkin('yt')!, ['live-video'])).toBe('video');
    expect(getGalleryUseCase(getSkin('default-live-video')!, ['live-video'])).toBe('live-video');
  });
});
