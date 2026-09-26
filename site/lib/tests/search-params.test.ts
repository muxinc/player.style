import { describe, expect, it } from 'vite-plus/test';

import { buildHref, getSkinHref, parseGalleryParams, parseSkinUseCase, withAccent } from '../search-params';
import { getSkin } from '../skins';

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

describe('parseSkinUseCase', () => {
  const microvideo = getSkin('microvideo')!;

  it('picks a use case the skin covers and defaults to its first', () => {
    expect(parseSkinUseCase(microvideo, 'live-video')).toBe('live-video');
    expect(parseSkinUseCase(microvideo, 'video')).toBe('video');
    expect(parseSkinUseCase(microvideo, undefined)).toBe('video');
    expect(parseSkinUseCase(microvideo, null)).toBe('video');
  });

  it('falls back for unknown values and use cases the skin does not cover', () => {
    expect(parseSkinUseCase(microvideo, 'live')).toBe('video');
    expect(parseSkinUseCase(microvideo, 'audio')).toBe('video');
    expect(parseSkinUseCase(getSkin('yt')!, 'live-video')).toBe('video');
    expect(parseSkinUseCase(getSkin('sutro-audio')!, undefined)).toBe('audio');
  });
});

describe('getSkinHref', () => {
  it('leaves the default use case out of the URL', () => {
    const microvideo = getSkin('microvideo')!;

    expect(getSkinHref(microvideo)).toBe('/skins/microvideo');
    expect(getSkinHref(microvideo, 'video')).toBe('/skins/microvideo');
    expect(getSkinHref(microvideo, 'live-video')).toBe('/skins/microvideo?use-case=live-video');
    expect(getSkinHref(getSkin('default-live-video')!, 'live-video')).toBe('/skins/default-live-video');
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
