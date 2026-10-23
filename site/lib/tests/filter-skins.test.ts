import { describe, expect, it } from 'vite-plus/test';

import { filterSkins, getGalleryUseCase, orderGallerySkins } from '../filter-skins';
import { getSkin, isFirstPartySkin, skins, type ThirdPartySkin } from '../skins';

const community: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'community-video',
  name: 'community-video',
  useCases: ['video'],
  title: 'Community',
  description: 'A community skin.',
  author: { name: 'Someone' },
  builds: { video: ['react'] },
};

/** A skin with a live video preset beside its video one. */
const live: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'example',
  name: 'example',
  useCases: ['video', 'live-video'],
  title: 'Example',
  description: 'A skin with a live video preset.',
  author: { name: 'Someone' },
  builds: { video: ['react', 'html'], 'live-video': ['react', 'html'] },
};

const audio: ThirdPartySkin = {
  ...community,
  slug: 'sutro-audio',
  name: 'sutro-audio',
  title: 'Sutro Audio',
  useCases: ['audio'],
  builds: { audio: ['html'] },
};

// The first-party skins are fixed; the community skins listed depend on what is built, so fixtures stand in for them.
const firstParty = skins.filter(isFirstPartySkin);
const all = [...firstParty, community, live, audio];

describe('filterSkins', () => {
  it('returns everything when both groups are empty', () => {
    expect(filterSkins(all, { useCases: [], sources: [] })).toEqual(all);
  });

  it('ORs within the use-case group', () => {
    const result = filterSkins(all, { useCases: ['audio', 'live-audio'], sources: [] });

    expect(result.map((skin) => skin.slug)).toEqual([
      'default-audio',
      'neutral-audio',
      'default-live-audio',
      'neutral-live-audio',
      'sutro-audio',
    ]);
  });

  it('ANDs across groups', () => {
    const result = filterSkins(all, { useCases: ['audio'], sources: ['third-party'] });

    expect(result.map((skin) => skin.slug)).toEqual(['sutro-audio']);
    expect(filterSkins(all, { useCases: ['video'], sources: ['third-party'] })).toContainEqual(community);
  });

  it('matches a skin with a live video package under both Video and Live Video, once', () => {
    const liveOnly = filterSkins(all, { useCases: ['live-video'], sources: ['third-party'] }).map((skin) => skin.slug);
    const video = filterSkins(all, { useCases: ['video'], sources: ['third-party'] }).map((skin) => skin.slug);
    const both = filterSkins(all, { useCases: ['video', 'live-video'], sources: [] }).map((skin) => skin.slug);

    expect(liveOnly).toEqual(['example']);
    expect(video).toEqual(['community-video', 'example']);
    expect(both.filter((slug) => slug === 'example')).toHaveLength(1);
    expect(filterSkins(all, { useCases: ['live-video'], sources: ['first-party'] }).map((skin) => skin.slug)).toEqual([
      'default-live-video',
      'neutral-live-video',
    ]);
  });

  it('is empty when a source has no skins', () => {
    expect(filterSkins(firstParty, { useCases: [], sources: ['third-party'] })).toEqual([]);
  });
});

describe('orderGallerySkins', () => {
  const slugs = (list: readonly { slug: string }[]) => list.map((skin) => skin.slug);
  const titles = (list: readonly { title: string }[]) => list.map((skin) => skin.title);

  it('sorts every skin alphabetically by title, first-party and community together', () => {
    const ordered = orderGallerySkins(all);
    const sorted = [...titles(ordered)].sort((a, b) =>
      a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
    );

    expect(ordered).toHaveLength(all.length);
    expect(new Set(slugs(ordered))).toEqual(new Set(slugs(all)));
    expect(titles(ordered)).toEqual(sorted);
    expect(titles(ordered).slice(0, 4)).toEqual(['Community', 'Default', 'Default Audio', 'Default Live']);
    expect(titles(ordered).at(-1)).toBe('Sutro Audio');
  });

  it('keeps whatever a filter leaves in the same order', () => {
    expect(slugs(orderGallerySkins(filterSkins(all, { useCases: ['audio'], sources: [] })))).toEqual([
      'default-audio',
      'neutral-audio',
      'sutro-audio',
    ]);
  });

  it('is empty for no skins', () => {
    expect(orderGallerySkins([])).toEqual([]);
  });
});

describe('getGalleryUseCase', () => {
  it('opens a skin on its default use case unless the filter keeps only another one it covers', () => {
    expect(getGalleryUseCase(live, [])).toBe('video');
    expect(getGalleryUseCase(live, ['video'])).toBe('video');
    expect(getGalleryUseCase(live, ['video', 'live-video'])).toBe('video');
    expect(getGalleryUseCase(live, ['live-video'])).toBe('live-video');
    expect(getGalleryUseCase(live, ['live-video', 'live-audio'])).toBe('live-video');
  });

  it('keeps a single-use-case skin on its one use case', () => {
    expect(getGalleryUseCase(community, ['live-video'])).toBe('video');
    expect(getGalleryUseCase(getSkin('default-live-video')!, ['live-video'])).toBe('live-video');
  });
});
