import { registryItemName } from 'build-registry/names';
import {
  type Framework,
  FRAMEWORKS,
  parseSkinBuildPath,
  type Preset,
  PRESET_LABELS,
  PRESETS,
  type SkinCatalog,
} from 'build-skin/names';

/** A skin's use case is its preset: the folder its build comes from, and the Video.js player it plays in. */
export type UseCase = Preset;
export type SkinTier = 'default' | 'neutral';
export type SkinFramework = Framework;

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
  /** The skin's folder under `skins/`, which also names its registry items and install folder. */
  slug: string;
  /**
   * Which frameworks have a build of each use case, React first. The use cases the skin covers are its keys, in
   * `USE_CASES` order; the first is the default.
   */
  builds: Partial<Record<UseCase, readonly SkinFramework[]>>;
  title: string;
  description: string;
  author: { name: string; url?: string; github?: string };
  preview?: SkinCatalog['preview'];
}

export type Skin = FirstPartySkin | ThirdPartySkin;

export const USE_CASES: { id: UseCase; label: string }[] = PRESETS.map((id) => ({ id, label: PRESET_LABELS[id] }));

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

/** The community skins: one per `catalog.json` whose skin has at least one built preset module. */
function thirdPartySkins(): ThirdPartySkin[] {
  const builds = new Map<string, ThirdPartySkin['builds']>();

  const parsed = builtModules.flatMap((path) => parseSkinBuildPath(path) ?? []);

  // React first, so every skin's frameworks come out in that order.
  for (const build of parsed.sort((a, b) => FRAMEWORKS.indexOf(a.framework) - FRAMEWORKS.indexOf(b.framework))) {
    const skin = builds.get(build.name) ?? {};

    skin[build.preset] = [...(skin[build.preset] ?? []), build.framework];
    builds.set(build.name, skin);
  }

  return Object.entries(catalogs).flatMap(([path, catalog]) => {
    const name = /skins\/([^/]+)\/catalog\.json$/.exec(path)?.[1];
    const skin = name ? builds.get(name) : undefined;
    if (!name || !skin) return [];

    return [{ kind: 'third-party' as const, slug: name, builds: skin, ...catalog }];
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
 * One badge's worth of label for every use case a skin covers: the default's label, then "Live" for a live preset
 * beside it ("Video · Live"), so a skin with two presets reads as one card with a live option.
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
  return isFirstPartySkin(skin) ? [skin.useCase] : PRESETS.filter((useCase) => skin.builds[useCase]);
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
export function getRegistryItem(skin: ThirdPartySkin, useCase: UseCase): string {
  if (!hasUseCase(skin, useCase)) throw new Error(`Skin "${skin.slug}" has no ${useCase} build.`);

  return registryItemName(skin.slug, getDefaultUseCase(skin), useCase);
}

/** The frameworks a skin has a build of for the use case, React first. */
export function getSkinFrameworks(skin: ThirdPartySkin, useCase: UseCase): readonly SkinFramework[] {
  return skin.builds[useCase] ?? [];
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
