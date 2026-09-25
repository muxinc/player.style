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

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

/**
 * The gallery's display order: alphabetical by title, first-party and community skins together, so the gallery does
 * not read as the official skins with community extras. The order depends only on the input, so the server-rendered
 * page is stable across requests; pass the filtered list.
 */
export function orderGallerySkins(skins: readonly Skin[]): Skin[] {
  return [...skins].sort((a, b) => collator.compare(a.title, b.title) || collator.compare(a.slug, b.slug));
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
