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
  /** How the gallery previews the skin, when it differs from the defaults. */
  preview?: {
    /**
     * The skin draws at a fixed size and centres itself, so the preview gives it no 16:9 box and lets it keep its own
     * height (a video skin otherwise fills an `aspect-video` box; an audio skin always sizes to its content).
     */
    fixedSize?: boolean;
    /** The skin shows the media's title and a byline, so the preview passes the demo ones. */
    metadata?: boolean;
  };
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
const LUWES_AUTHOR = { name: 'Wesley Luyten', github: 'luwes' } as const;
const DAVEKISS_AUTHOR = { name: 'Dave Kiss', github: 'davekiss' } as const;
const MAVE_AUTHOR = { name: 'mave.io', url: 'https://mave.io', github: 'maveio' } as const;
const QUALABS_AUTHOR = { name: 'Qualabs', url: 'https://www.qualabs.com', github: 'qualabs' } as const;

type PortedSkin = Omit<ThirdPartySkin, 'kind' | 'frameworks' | 'package' | 'legacy'> & {
  /** The Media Chrome theme's slug when it differs from the skin's (the classic `minimal` became `essentials`). */
  legacyTheme?: string;
};

/** A Media Chrome theme ported to Video.js 10 as `@player.style/<slug>`, with HTML and React editions. */
function ported({ legacyTheme, ...skin }: PortedSkin): ThirdPartySkin {
  const theme = legacyTheme ?? skin.slug;

  return {
    kind: 'third-party',
    ...skin,
    frameworks: ['html', 'react'],
    package: `@player.style/${skin.slug}`,
    legacy: { theme, url: `https://media-chrome.player.style/themes/${theme}` },
  };
}

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
  // Third-party skins follow the first-party ones: video first, then audio. The Media Chrome ports carry a `legacy` link.
  ported({
    slug: 'yt',
    title: 'YT',
    description:
      'An homage to the modern, ubiquitous YouTube player. Recreated with web components, or at least as close as we could get.',
    useCase: 'video',
    author: HEFF_AUTHOR,
  }),
  ported({
    slug: 'sutro',
    title: 'Sutro',
    description:
      'A sleek and modern theme lovingly named after our favorite SF TV antenna, which is neither sleek nor modern.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  ported({
    slug: 'essentials',
    title: 'Essentials',
    description:
      'Pares the Mux Player experience down to the bare-bones controls viewers need; the classic player.style Minimal theme.',
    useCase: 'video',
    author: MUX_AUTHOR,
    legacyTheme: 'minimal',
  }),
  ported({
    slug: 'notflix',
    title: 'Notflix',
    description: 'Everything but the big red N and long bus rides to Los Gatos.',
    useCase: 'video',
    author: HEFF_AUTHOR,
  }),
  ported({
    slug: 'vimeonova',
    title: 'Vimeonova',
    description: 'A fresh take on the classic Vimeo player design.',
    useCase: 'video',
    author: LUWES_AUTHOR,
    preview: { metadata: true },
  }),
  ported({
    slug: 'instaplay',
    title: 'Instaplay',
    description: 'A mobile-first theme inspired by playback experiences you can find in popular social media apps.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  ported({
    slug: 'microvideo',
    title: 'Microvideo',
    description:
      'Optimized for shorter content that doesn’t need the robust playback controls that longer content typically requires.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  ported({
    slug: 'reelplay',
    title: 'Reelplay',
    description: 'A nostalgic media player inspired by the media players of a bygone era.',
    useCase: 'video',
    author: DAVEKISS_AUTHOR,
  }),
  ported({
    slug: 'demuxed-2022',
    title: 'Demuxed 2022',
    description: 'A media player theme created for Demuxed 2022.',
    useCase: 'video',
    author: MAVE_AUTHOR,
  }),
  ported({
    slug: 'halloween',
    title: 'Halloween',
    description: 'Bring the spooky season to your video player with this Halloween theme.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  ported({
    slug: 'x-mas',
    title: 'X-mas',
    description:
      'A festive Christmas theme with cozy red and green tones, twinkling lights, and a warm holiday vibe—perfect for spreading seasonal cheer!',
    useCase: 'video',
    author: QUALABS_AUTHOR,
  }),
  ported({
    slug: 'winamp',
    title: 'Winamp',
    description: 'A retro theme inspired by the classic Winamp media player.',
    useCase: 'video',
    author: MAVE_AUTHOR,
    preview: { fixedSize: true },
  }),
  ported({
    slug: 'sutro-audio',
    title: 'Sutro Audio',
    description:
      'Sutro’s audio sibling: a rounded, deep-blue card with artwork, title, and byline, named after our favorite SF TV antenna.',
    useCase: 'audio',
    author: MUX_AUTHOR,
    preview: { metadata: true },
  }),
  ported({
    slug: 'tailwind-audio',
    title: 'Tailwind Audio',
    description: 'A slick, minimal audio player theme made with Tailwind CSS.',
    useCase: 'audio',
    author: LUWES_AUTHOR,
  }),
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
