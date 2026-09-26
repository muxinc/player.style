import { isSkinSource, type SkinSource } from './filter-skins';
import { getDefaultUseCase, hasUseCase, USE_CASES, type Skin, type UseCase } from './skins';

export const ACCENT_PARAM = 'accent';
export const USE_CASE_PARAM = 'use-case';
export const SOURCE_PARAM = 'source';
export const FRAMEWORK_PARAM = 'framework';
export const MEDIA_PARAM = 'media';
export const INSTALL_PARAM = 'install';

/** Search params as a Next page receives them. */
export type SearchParamsRecord = Readonly<Record<string, string | string[] | undefined>>;

/** Search params from a page's `searchParams` prop on the server, or from `useSearchParams()` on the client. */
export type SearchParamsInput = SearchParamsRecord | URLSearchParams;

const HEX_COLOR = /^[0-9a-f]{6}$/i;

export function toURLSearchParams(input: SearchParamsInput): URLSearchParams {
  if (input instanceof URLSearchParams) return new URLSearchParams(input);

  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(input)) {
    for (const item of [value ?? []].flat()) params.append(name, item);
  }

  return params;
}

/** Every value of a repeated param, in URL order. */
export function getParamValues(input: SearchParamsInput, name: string): string[] {
  return toURLSearchParams(input).getAll(name);
}

/** The first value of a param. */
export function getParamValue(input: SearchParamsInput, name: string): string | undefined {
  return getParamValues(input, name)[0];
}

/** A copy of `pathname` plus the given params with `edit` applied; an empty query leaves the bare pathname. */
export function buildHref(
  pathname: string,
  input: SearchParamsInput,
  edit?: (params: URLSearchParams) => void
): string {
  const params = toURLSearchParams(input);
  edit?.(params);

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

/** An internal href with `?accent=` set to the given accent, or removed when there is none. */
export function withAccent(href: string, accent: string | undefined): string {
  const [pathname = '', query] = href.split('?');

  return buildHref(pathname, new URLSearchParams(query), (params) => {
    if (accent) params.set(ACCENT_PARAM, accent);
    else params.delete(ACCENT_PARAM);
  });
}

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

/** The gallery state carried in the URL. */
export function parseGalleryParams(input: SearchParamsInput) {
  return {
    accent: parseAccent(getParamValue(input, ACCENT_PARAM)),
    useCases: parseUseCases(getParamValues(input, USE_CASE_PARAM)),
    sources: parseSources(getParamValues(input, SOURCE_PARAM)),
  };
}

/**
 * The use case a skin page shows: the one `?use-case=` names when the skin covers it, and otherwise the skin's default.
 * On the gallery the same param repeats as a filter; on a skin page it picks one of the skin's packages.
 */
export function parseSkinUseCase(skin: Skin, value: string | null | undefined): UseCase {
  return value && isUseCase(value) && hasUseCase(skin, value) ? value : getDefaultUseCase(skin);
}

/** A skin page's path, with `?use-case=` only when it names a use case other than the skin's default. */
export function getSkinHref(skin: Skin, useCase: UseCase = getDefaultUseCase(skin)): string {
  return buildHref(`/skins/${skin.slug}`, {}, (params) => {
    if (useCase !== getDefaultUseCase(skin)) params.set(USE_CASE_PARAM, useCase);
  });
}
