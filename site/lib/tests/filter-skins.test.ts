import { describe, expect, it } from 'vite-plus/test';

import { filterSkins } from '../filter-skins';
import { skins, type ThirdPartySkin } from '../skins';

const community: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'community-video',
  title: 'Community',
  description: 'A community skin.',
  useCase: 'video',
  author: { name: 'Someone' },
  frameworks: ['react'],
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

  it('is empty when a source has no skins', () => {
    const firstParty = skins.filter((skin) => skin.kind === 'first-party');

    expect(filterSkins(firstParty, { useCases: [], sources: ['third-party'] })).toEqual([]);
  });
});
