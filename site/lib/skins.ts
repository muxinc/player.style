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

export interface ThirdPartySkin {
  kind: 'third-party';
  slug: string;
  /** The base package's basename, which names the tag and component: `@player.style/<name>`, `<name>-skin`. */
  name: string;
  /**
   * The use cases the skin covers, each its own package: the first is the base package's (`video` or `audio`), and
   * `live-video` follows when the sibling `@player.style/<name>-live` package exists. The first is the default.
   */
  useCases: readonly UseCase[];
  title: string;
  description: string;
  author: { name: string; url?: string; github?: string };
  /** The base package; a live use case installs the same name with `-live`. */
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
    /** The skin is mobile-first, so it plays the portrait demo asset. */
    portrait?: boolean;
  };
}

/** The package that serves one of a third-party skin's use cases. */
export interface ThirdPartyPackage {
  useCase: UseCase;
  /** The package basename, `<name>` or `<name>-live`: it keys the tags, preview loader, open files, and registry item. */
  name: string;
  package: string;
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

type ThirdPartyEntry = Omit<ThirdPartySkin, 'kind' | 'name' | 'useCases' | 'package' | 'legacy'> & {
  useCase: 'video' | 'audio';
  /** The skin also ships a sibling package `<slug>-live` on the live video preset. */
  live?: true;
};

type PortedSkin = ThirdPartyEntry & {
  /** The Media Chrome theme's slug when it differs from the skin's (the classic `minimal` became `essentials`). */
  legacyTheme?: string;
};

/**
 * A skin packaged as `@player.style/<slug>`, with HTML and React entries. A skin that also ships
 * `@player.style/<slug>-live` keeps one card that covers both use cases, not a second card.
 */
function thirdParty({ live, useCase, ...skin }: ThirdPartyEntry): ThirdPartySkin {
  return {
    kind: 'third-party',
    name: skin.slug,
    useCases: live ? [useCase, 'live-video'] : [useCase],
    ...skin,
    package: `@player.style/${skin.slug}`,
  };
}

/** A Media Chrome theme ported to Video.js 10, which links back to the theme it came from. */
function ported({ legacyTheme, ...skin }: PortedSkin): ThirdPartySkin {
  const theme = legacyTheme ?? skin.slug;

  return { ...thirdParty(skin), legacy: { theme, url: `https://media-chrome.player.style/themes/${theme}` } };
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
  // Third-party skins follow the first-party ones: video first, then audio. The Media Chrome ports carry a `legacy`
  // link; the recreations of other players' skins (Video.js, Plyr, and the rest), which never were Media Chrome
  // themes, do not.
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
    live: true,
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
    preview: { portrait: true },
  }),
  ported({
    slug: 'microvideo',
    title: 'Microvideo',
    description:
      'Optimized for shorter content that doesn’t need the robust playback controls that longer content typically requires.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
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
    live: true,
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
    live: true,
  }),
  ported({
    slug: 'winamp',
    title: 'Winamp',
    description: 'A retro theme inspired by the classic Winamp media player.',
    useCase: 'video',
    author: MAVE_AUTHOR,
    preview: { fixedSize: true },
  }),
  thirdParty({
    slug: 'videojs-1',
    title: 'Video.js 1',
    description:
      'The original 2010 Video.js skin, recreated: floating aqua pills, CSS-drawn icons, and six stepped volume bars.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  thirdParty({
    slug: 'videojs-3',
    title: 'Video.js 3',
    description:
      'The 2011 Video.js 3 skin, recreated: a glossy black bar, embossed sprite icons, and the progress row above it.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  thirdParty({
    slug: 'videojs-4',
    title: 'Video.js 4',
    description:
      'The 2013 Video.js redesign, recreated: a translucent bar, a striped cyan progress bar, and the big play button up in the corner.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
  }),
  thirdParty({
    slug: 'videojs-8',
    title: 'Video.js 8',
    description:
      'The Video.js default from 5.0 through 8.x, recreated: the slate bar, round white handles, time tooltips, and a centered big play button.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
  }),
  thirdParty({
    slug: 'plyr',
    title: 'Plyr',
    description:
      'The Plyr player, recreated: a black gradient under white icons, round blue sliders with white thumbs, and the big blue play button in the middle.',
    useCase: 'video',
    author: MUX_AUTHOR,
  }),
  thirdParty({
    slug: 'vidstack',
    title: 'Vidstack',
    description:
      'The Vidstack default video layout, recreated: a soft black gradient, a thin time slider above round, tooltip-labelled buttons, and a volume slider that opens out of mute.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
  }),
  thirdParty({
    slug: 'media-chrome',
    title: 'Media Chrome',
    description:
      'Media Chrome’s default look, recreated: a bare dark strip where every control paints its own translucent background, thin range tracks, and tooltips on every button.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
  }),
  thirdParty({
    slug: 'mux-player',
    title: 'Mux Player',
    description:
      'Mux Player’s default Gerwig theme, recreated: a transparent bar over a soft gradient, icons on a Mux pink square when hovered, and a thin seek bar with storyboard previews.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
  }),
  thirdParty({
    slug: 'mux-player-classic',
    title: 'Mux Player Classic',
    description:
      'Mux Player’s original theme, recreated: a translucent black control bar under a thin full-width time range, storyboard previews, and outlined play and seek glyphs.',
    useCase: 'video',
    author: MUX_AUTHOR,
    live: true,
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

/**
 * One badge's worth of label for every use case a skin covers: the default's label, then "Live" for a live package
 * beside it ("Video · Live"), so a skin with two packages reads as one card with a live option.
 */
export function getSkinUseCasesLabel(skin: Skin): string {
  const [first, ...rest] = getSkinUseCases(skin);

  return [first!, ...rest]
    .map((useCase, index) => (index > 0 && isLiveUseCase(useCase) ? 'Live' : getUseCaseLabel(useCase)))
    .join(' · ');
}

export function isFirstPartySkin(skin: Skin): skin is FirstPartySkin {
  return skin.kind === 'first-party';
}

export function isThirdPartySkin(skin: Skin): skin is ThirdPartySkin {
  return skin.kind === 'third-party';
}

export function isLiveUseCase(useCase: UseCase): boolean {
  return useCase === 'live-video' || useCase === 'live-audio';
}

/** Every use case a card covers: a first-party skin's one, or each of a third-party skin's packages'. */
export function getSkinUseCases(skin: Skin): readonly UseCase[] {
  return isFirstPartySkin(skin) ? [skin.useCase] : skin.useCases;
}

/** The use case a skin shows by default: its only one, or a third-party skin's base package's. */
export function getDefaultUseCase(skin: Skin): UseCase {
  return getSkinUseCases(skin)[0]!;
}

export function hasUseCase(skin: Skin, useCase: UseCase): boolean {
  return getSkinUseCases(skin).includes(useCase);
}

/**
 * The package that serves one of the skin's use cases: the base package for its first, and the `<name>-live` sibling
 * for a live one. Asking for a use case the skin does not cover throws rather than inventing a package.
 */
export function getThirdPartyPackage(skin: ThirdPartySkin, useCase: UseCase): ThirdPartyPackage {
  if (useCase === getDefaultUseCase(skin)) return { useCase, name: skin.name, package: skin.package };
  if (!hasUseCase(skin, useCase) || !isLiveUseCase(useCase)) {
    throw new Error(`Skin "${skin.slug}" has no ${useCase} package.`);
  }

  return { useCase, name: `${skin.name}-live`, package: `${skin.package}-live` };
}

/**
 * Whether a skin draws at its own fixed size (Winamp's 275px windows) and centres itself, rather than filling the width
 * it gets. A narrow phone leaves such a skin barely enough room, so its previews give it the full width.
 */
export function isFixedSizeSkin(skin: Skin): boolean {
  return skin.kind === 'third-party' && !!skin.preview?.fixedSize;
}

/** Whether a skin lays out as a compact bar (audio) rather than a 16:9 stage (video). */
export function isAudioSkin(skin: Skin): boolean {
  const useCase = getDefaultUseCase(skin);

  return useCase === 'audio' || useCase === 'live-audio';
}
