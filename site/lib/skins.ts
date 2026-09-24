export type UseCase = 'video' | 'audio' | 'live-video' | 'live-audio';
export type SkinTier = 'default' | 'minimal';

/** The Video.js installation preset a skin belongs to, as the docs flag it in `?preset=`. */
export type DocsPreset = 'default-video' | 'default-audio' | 'live-video' | 'live-audio';

export interface FirstPartySkin {
  kind: 'first-party';
  slug: string;
  title: string;
  description: string;
  useCase: UseCase;
  tier: SkinTier;
  author: { name: 'Video.js'; url: 'https://videojs.org'; github: 'videojs' };
  docs: { preset: DocsPreset; skin: SkinTier };
}

export type SkinFramework = 'html' | 'react';

export interface ThirdPartySkin {
  kind: 'third-party';
  slug: string;
  title: string;
  description: string;
  useCase: UseCase;
  author: { name: string; url?: string; github?: string };
  frameworks: SkinFramework[];
  package: string;
  /** The Media Chrome theme this skin was ported from, when it has one. */
  legacy?: { theme: string; url: string };
}

export type Skin = FirstPartySkin | ThirdPartySkin;

export const USE_CASES: { id: UseCase; label: string }[] = [
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'live-video', label: 'Live Video' },
  { id: 'live-audio', label: 'Live Audio' },
];

const VIDEOJS_AUTHOR = { name: 'Video.js', url: 'https://videojs.org', github: 'videojs' } as const;
const MUX_AUTHOR = { name: 'Mux', url: 'https://www.mux.com', github: 'muxinc' } as const;
const HEFF_AUTHOR = { name: 'Steve Heffernan', github: 'heff' } as const;

function firstParty(skin: Omit<FirstPartySkin, 'kind' | 'author' | 'docs'> & { preset: DocsPreset }): FirstPartySkin {
  const { preset, ...rest } = skin;

  return { kind: 'first-party', ...rest, author: VIDEOJS_AUTHOR, docs: { preset, skin: rest.tier } };
}

export const skins: Skin[] = [
  firstParty({
    slug: 'default-video',
    title: 'Default',
    description: 'The video preset’s default skin: full on-demand controls with the modern, frosted look.',
    useCase: 'video',
    tier: 'default',
    preset: 'default-video',
  }),
  firstParty({
    slug: 'minimal-video',
    title: 'Minimal',
    description: 'The video preset’s visually lighter skin, closer to a classic control bar.',
    useCase: 'video',
    tier: 'minimal',
    preset: 'default-video',
  }),
  firstParty({
    slug: 'default-live-video',
    title: 'Default Live',
    description: 'The live video preset’s default skin, which swaps time controls for a Live button.',
    useCase: 'live-video',
    tier: 'default',
    preset: 'live-video',
  }),
  firstParty({
    slug: 'minimal-live-video',
    title: 'Minimal Live',
    description:
      'The live video preset’s lighter skin: a classic control bar with a Live button in place of time controls.',
    useCase: 'live-video',
    tier: 'minimal',
    preset: 'live-video',
  }),
  firstParty({
    slug: 'default-audio',
    title: 'Default Audio',
    description: 'The audio preset’s default skin: a compact player for on-demand audio with the modern, frosted look.',
    useCase: 'audio',
    tier: 'default',
    preset: 'default-audio',
  }),
  firstParty({
    slug: 'minimal-audio',
    title: 'Minimal Audio',
    description: 'The audio preset’s visually lighter skin, closer to a classic control bar.',
    useCase: 'audio',
    tier: 'minimal',
    preset: 'default-audio',
  }),
  firstParty({
    slug: 'default-live-audio',
    title: 'Default Live Audio',
    description: 'The live audio preset’s default skin, which swaps time controls for a Live button.',
    useCase: 'live-audio',
    tier: 'default',
    preset: 'live-audio',
  }),
  firstParty({
    slug: 'minimal-live-audio',
    title: 'Minimal Live Audio',
    description:
      'The live audio preset’s lighter skin: a classic control bar with a Live button in place of time controls.',
    useCase: 'live-audio',
    tier: 'minimal',
    preset: 'live-audio',
  }),
  // Third-party skins follow the first-party ones. Ports of the Media Chrome themes carry a `legacy` link.
  {
    kind: 'third-party',
    slug: 'microvideo',
    title: 'Microvideo',
    description:
      'Optimized for shorter content that doesn’t need the robust playback controls that longer content typically requires.',
    useCase: 'video',
    author: MUX_AUTHOR,
    frameworks: ['html', 'react'],
    package: '@player.style/microvideo',
    legacy: { theme: 'microvideo', url: 'https://media-chrome.player.style/themes/microvideo' },
  },
  {
    kind: 'third-party',
    slug: 'instaplay',
    title: 'Instaplay',
    description: 'A mobile-first theme inspired by playback experiences you can find in popular social media apps.',
    useCase: 'video',
    author: MUX_AUTHOR,
    frameworks: ['html', 'react'],
    package: '@player.style/instaplay',
    legacy: { theme: 'instaplay', url: 'https://media-chrome.player.style/themes/instaplay' },
  },
  {
    kind: 'third-party',
    slug: 'yt',
    title: 'YT',
    description:
      'An homage to the modern, ubiquitous YouTube player. Recreated with web components, or at least as close as we could get.',
    useCase: 'video',
    author: HEFF_AUTHOR,
    frameworks: ['html', 'react'],
    package: '@player.style/yt',
    legacy: { theme: 'yt', url: 'https://media-chrome.player.style/themes/yt' },
  },
];

export function getSkin(slug: string): Skin | undefined {
  return skins.find((skin) => skin.slug === slug);
}

export function getUseCaseLabel(useCase: UseCase): string {
  return USE_CASES.find((entry) => entry.id === useCase)?.label ?? useCase;
}

export function isFirstPartySkin(skin: Skin): skin is FirstPartySkin {
  return skin.kind === 'first-party';
}

export function isThirdPartySkin(skin: Skin): skin is ThirdPartySkin {
  return skin.kind === 'third-party';
}

/** Whether a skin lays out as a compact bar (audio) rather than a 16:9 stage (video). */
export function isAudioSkin(skin: Skin): boolean {
  return skin.useCase === 'audio' || skin.useCase === 'live-audio';
}
