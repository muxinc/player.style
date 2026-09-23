import { describe, expect, it } from 'vite-plus/test';

import { buildHref, parseGalleryParams, withAccent } from '../search-params';

describe('parseGalleryParams', () => {
  it('reads a page searchParams object and URLSearchParams alike', () => {
    const expected = { accent: 'f5c518', useCases: ['audio', 'video'], sources: [] };

    expect(parseGalleryParams({ accent: '#F5C518', 'use-case': ['audio', 'nope', 'video'] })).toEqual(expected);
    expect(
      parseGalleryParams(new URLSearchParams('accent=F5C518&use-case=audio&use-case=nope&use-case=video'))
    ).toEqual(expected);
  });

  it('drops an invalid accent', () => {
    expect(parseGalleryParams({ accent: 'red' }).accent).toBeUndefined();
  });
});

describe('buildHref', () => {
  it('applies the edit and leaves a bare pathname when nothing remains', () => {
    expect(buildHref('/skins/x', { framework: 'html', accent: 'ffffff' }, (params) => params.set('media', 'hls'))).toBe(
      '/skins/x?framework=html&accent=ffffff&media=hls'
    );
    expect(buildHref('/', { accent: 'ffffff' }, (params) => params.delete('accent'))).toBe('/');
  });
});

describe('withAccent', () => {
  it('sets, replaces, or removes the accent', () => {
    expect(withAccent('/', 'f5c518')).toBe('/?accent=f5c518');
    expect(withAccent('/skins/x?framework=html&accent=000000', 'f5c518')).toBe('/skins/x?framework=html&accent=f5c518');
    expect(withAccent('/skins/x?accent=000000', undefined)).toBe('/skins/x');
  });
});
