import { getDefaultUseCase, getSkinUseCases, type Skin, type UseCase } from './skins';

export type SkinSource = Skin['kind'];

export const SOURCES: { id: SkinSource; label: string; hint: string }[] = [
  { id: 'first-party', label: 'First-party', hint: 'Built by the Video.js team' },
  { id: 'third-party', label: 'Third-party', hint: 'Community skins' },
];

export interface SkinFilters {
  useCases: readonly UseCase[];
  sources: readonly SkinSource[];
}

export function isSkinSource(value: string): value is SkinSource {
  return SOURCES.some((source) => source.id === value);
}

/**
 * Skins matching the filters: OR within each group, AND across groups, and an empty group matches everything. A skin
 * that covers several use cases (a base package plus its `-live` sibling) matches any of them.
 */
export function filterSkins(skins: readonly Skin[], { useCases, sources }: SkinFilters): Skin[] {
  return skins.filter(
    (skin) =>
      (useCases.length === 0 || getSkinUseCases(skin).some((useCase) => useCases.includes(useCase))) &&
      (sources.length === 0 || sources.includes(skin.kind))
  );
}

/**
 * Merges groups so each group's items spread evenly through the result, keeping each group's own order: item `i` of a
 * group of `n` lands `(i + ½) / n` of the way through, and an earlier group wins a tie. Integer cross-multiplication
 * keeps the comparison exact.
 */
function spread<T>(groups: readonly (readonly T[])[]): T[] {
  return groups
    .flatMap((group, groupIndex) => group.map((item, index) => ({ item, groupIndex, index, size: group.length })))
    .sort((a, b) => (2 * a.index + 1) * b.size - (2 * b.index + 1) * a.size || a.groupIndex - b.groupIndex)
    .map(({ item }) => item);
}

/** One source's skins with their default use cases spread through them, so video, audio, and live all come early. */
function spreadUseCases(skins: readonly Skin[], source: SkinSource): Skin[] {
  const bySource = skins.filter((skin) => skin.kind === source);

  return spread([...Map.groupBy(bySource, getDefaultUseCase).values()]);
}

/**
 * The gallery's display order. `skins` lists first-party skins first, but the gallery should not read as the official
 * skins with community extras, so community and first-party cards interleave evenly (a first-party card every second or
 * third card with today's counts), led by a community one. Within each source the use cases spread out too. The order
 * depends only on the input, so the server-rendered page is stable across requests; pass the filtered list, and
 * whatever is left interleaves the same way.
 */
export function orderGallerySkins(skins: readonly Skin[]): Skin[] {
  return spread([spreadUseCases(skins, 'third-party'), spreadUseCases(skins, 'first-party')]);
}

/**
 * The use case a gallery card previews and links to: the skin's default, unless the use-case filter leaves it out and
 * keeps another the skin covers (only "Live Video" checked), in which case the card opens straight onto that one.
 */
export function getGalleryUseCase(skin: Skin, useCases: readonly UseCase[]): UseCase {
  const fallback = getDefaultUseCase(skin);
  if (useCases.length === 0 || useCases.includes(fallback)) return fallback;

  return getSkinUseCases(skin).find((useCase) => useCases.includes(useCase)) ?? fallback;
}
