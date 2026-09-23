import { isSkinSource, type SkinSource } from './filter-skins';
import { USE_CASES, type UseCase } from './skins';

const HEX_COLOR = /^[0-9a-f]{6}$/i;

/** A six-digit hex accent without the `#`, as carried in `?accent=`. */
export function parseAccent(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const hex = value.replace(/^#/, '').toLowerCase();

  return HEX_COLOR.test(hex) ? hex : undefined;
}

export function isUseCase(value: string): value is UseCase {
  return USE_CASES.some((useCase) => useCase.id === value);
}

/** The use cases named by repeated `?use-case=` params, dropping anything unknown. */
export function parseUseCases(values: readonly string[]): UseCase[] {
  return values.filter(isUseCase);
}

/** The skin sources named by repeated `?source=` params, dropping anything unknown. */
export function parseSources(values: readonly string[]): SkinSource[] {
  return values.filter(isSkinSource);
}

export const ACCENT_PARAM = 'accent';
export const USE_CASE_PARAM = 'use-case';
export const SOURCE_PARAM = 'source';
export const FRAMEWORK_PARAM = 'framework';
export const MEDIA_PARAM = 'media';
