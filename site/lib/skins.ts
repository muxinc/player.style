export type UseCase = 'video' | 'audio' | 'live-video' | 'live-audio';
export type SkinTier = 'default' | 'neutral';
export type SkinFramework = 'react' | 'html';

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

/** `skins/<name>/catalog.json`: the gallery's metadata for a community skin. */
export interface SkinCatalog {
  title: string;
  description: string;
  author: { name: string; url?: string; github?: string };
  /** The Media Chrome theme the skin recreates, when its slug differs from the skin's. */
  legacyTheme?: string;
  preview?: ThirdPartySkin['preview'];
}

export interface ThirdPartySkin {
  kind: 'third-party';
  slug: string;
  /** The skin's folder under `skins/`, which names its registry items and install folder. */
  name: string;
  /**
   * The use cases the skin covers: its preset folders across both frameworks, in `USE_CASES` order. The first is the
   * default.
   */
  useCases: readonly UseCase[];
  /** Which frameworks have a build of each use case. */
  builds: Partial<Record<UseCase, readonly SkinFramework[]>>;
  title: string;
  description: string;
  author: { name: string; url?: string; github?: string };
  /** The Media Chrome theme this skin recreates, when it has one; its old `/themes/<theme>` URL redirects here. */
  legacy?: { theme: string };
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

/** The registry item that serves one of a third-party skin's use cases. */
export interface RegistryItemRef {
  useCase: UseCase;
  /** `<name>` for the default use case, `<name>-live` for its live twin, `<name>-<use case>` otherwise. */
  name: string;
}

export type Skin = FirstPartySkin | ThirdPartySkin;

export const USE_CASES: { id: UseCase; label: string }[] = [
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
  { id: 'live-video', label: 'Live Video' },
  { id: 'live-audio', label: 'Live Audio' },
];

const VIDEOJS_AUTHOR = { name: 'Video.js', url: 'https://videojs.org', github: 'videojs' } as const;

/**
 * Which preset modules are built, by path only: a lazy `?url` import is never made, so the server graph never compiles
 * the skins' modules (`skin-builds.ts` loads them, in the previews). See `skin-builds.ts` for the `base`.
 */
const builtModules = Object.keys(
  import.meta.glob(['./skins/*/react/dist/*.js', './skins/*/html/dist/*.js'], { base: '../..', query: '?url' })
);

/**
 * Every `skins/<name>/catalog.json`, read at build time. Turbopack's JSON module
 * has no `default` export where Vitest's does, so the catalog is the module or its default.
 */
const catalogs = Object.fromEntries(
  Object.entries(import.meta.glob('./skins/*/catalog.json', { eager: true, base: '../..' })).map(([path, module]) => [
    path,
    ((module as { default?: SkinCatalog }).default ?? module) as SkinCatalog,
  ])
);

/**
 * The community skins: one per `catalog.json` whose skin has at least one built preset module. A folder that is not
 * converted to the `skin create` layout, or not built, does not appear.
 */
function thirdPartySkins(): ThirdPartySkin[] {
  const builds = new Map<string, ThirdPartySkin['builds']>();

  for (const path of builtModules) {
    const [, name, framework, preset] = /skins\/([^/]+)\/(react|html)\/dist\/([^/]+)\.js$/.exec(path) ?? [];
    if (!name || !USE_CASES.some((useCase) => useCase.id === preset)) continue;

    const skin = builds.get(name) ?? {};
    const useCase = preset as UseCase;

    skin[useCase] = [...(skin[useCase] ?? []), framework as SkinFramework];
    builds.set(name, skin);
  }

  return Object.entries(catalogs).flatMap(([path, catalog]) => {
    const name = /skins\/([^/]+)\/catalog\.json$/.exec(path)?.[1];
    const skin = name ? builds.get(name) : undefined;
    if (!name || !skin) return [];

    const { legacyTheme, ...rest } = catalog;

    return [
      {
        kind: 'third-party' as const,
        slug: name,
        name,
        useCases: USE_CASES.map((useCase) => useCase.id).filter((useCase) => skin[useCase]),
        builds: skin,
        ...rest,
        ...(legacyTheme ? { legacy: { theme: legacyTheme } } : {}),
      },
    ];
  });
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
    slug: 'neutral-video',
    title: 'Neutral',
    description: 'The video preset’s visually lighter skin, closer to a classic control bar.',
    useCase: 'video',
    tier: 'neutral',
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
    slug: 'neutral-live-video',
    title: 'Neutral Live',
    description:
      'The live video preset’s lighter skin: a classic control bar with a Live button in place of time controls.',
    useCase: 'live-video',
    tier: 'neutral',
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
    slug: 'neutral-audio',
    title: 'Neutral Audio',
    description: 'The audio preset’s visually lighter skin, closer to a classic control bar.',
    useCase: 'audio',
    tier: 'neutral',
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
    slug: 'neutral-live-audio',
    title: 'Neutral Live Audio',
    description:
      'The live audio preset’s lighter skin: a classic control bar with a Live button in place of time controls.',
    useCase: 'live-audio',
    tier: 'neutral',
    preset: 'live-audio',
  }),
  ...thirdPartySkins(),
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

/** Every use case a card covers: a first-party skin's one, or each of a third-party skin's presets. */
export function getSkinUseCases(skin: Skin): readonly UseCase[] {
  return isFirstPartySkin(skin) ? [skin.useCase] : skin.useCases;
}

/** The use case a skin shows by default: its only one, or a third-party skin's first. */
export function getDefaultUseCase(skin: Skin): UseCase {
  return getSkinUseCases(skin)[0]!;
}

export function hasUseCase(skin: Skin, useCase: UseCase): boolean {
  return getSkinUseCases(skin).includes(useCase);
}

/**
 * The registry item that serves one of the skin's use cases, named as scripts/build-registry names it. Asking for a use
 * case the skin does not cover throws rather than inventing an item.
 */
export function getRegistryItem(skin: ThirdPartySkin, useCase: UseCase): RegistryItemRef {
  const fallback = getDefaultUseCase(skin);
  if (!hasUseCase(skin, useCase)) throw new Error(`Skin "${skin.slug}" has no ${useCase} build.`);
  if (useCase === fallback) return { useCase, name: skin.name };

  return { useCase, name: useCase === `live-${fallback}` ? `${skin.name}-live` : `${skin.name}-${useCase}` };
}

/** The frameworks a skin has a build of for the use case, React first. */
export function getSkinFrameworks(skin: ThirdPartySkin, useCase: UseCase): SkinFramework[] {
  const built = skin.builds[useCase] ?? [];

  return (['react', 'html'] as const).filter((framework) => built.includes(framework));
}

/**
 * Which build a preview renders: React when it is asked for or nothing is asked, HTML when an HTML-based framework
 * (HTML, Vue, Svelte) is, and otherwise whichever build exists.
 */
export function getPreviewFramework(skin: ThirdPartySkin, useCase: UseCase, requested?: string): SkinFramework {
  const built = getSkinFrameworks(skin, useCase);
  const wanted: SkinFramework = !requested || requested === 'react' ? 'react' : 'html';

  return built.includes(wanted) ? wanted : built[0]!;
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
