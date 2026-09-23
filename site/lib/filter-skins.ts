import type { Skin, UseCase } from './skins';

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

/** Skins matching the filters: OR within each group, AND across groups, and an empty group matches everything. */
export function filterSkins(skins: readonly Skin[], { useCases, sources }: SkinFilters): Skin[] {
  return skins.filter(
    (skin) =>
      (useCases.length === 0 || useCases.includes(skin.useCase)) &&
      (sources.length === 0 || sources.includes(skin.kind))
  );
}
