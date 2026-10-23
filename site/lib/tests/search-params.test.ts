import { describe, expect, it } from 'vite-plus/test';

import { buildHref, getSkinHref, parseGalleryParams, parseSkinUseCase, withAccent } from '../search-params';
import { getSkin, type ThirdPartySkin } from '../skins';

/** A skin with a live video preset beside its video one. */
const live: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'example',
  name: 'example',
  useCases: ['video', 'live-video'],
  title: 'Example',
  description: 'A skin with a live video preset.',
  author: { name: 'Someone' },
  builds: { video: ['react', 'html'], 'live-video': ['react', 'html'] },
};

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
  it('picks a use case the skin covers and defaults to its first', () => {
    expect(parseSkinUseCase(live, 'live-video')).toBe('live-video');
    expect(parseSkinUseCase(live, 'video')).toBe('video');
    expect(parseSkinUseCase(live, undefined)).toBe('video');
    expect(parseSkinUseCase(live, null)).toBe('video');
  });

  it('falls back for unknown values and use cases the skin does not cover', () => {
    expect(parseSkinUseCase(live, 'live')).toBe('video');
    expect(parseSkinUseCase(live, 'audio')).toBe('video');
    expect(parseSkinUseCase({ ...live, useCases: ['audio'] }, undefined)).toBe('audio');
    expect(parseSkinUseCase(getSkin('default-audio')!, 'video')).toBe('audio');
  });
});

describe('getSkinHref', () => {
  it('leaves the default use case out of the URL', () => {
    expect(getSkinHref(live)).toBe('/skins/example');
    expect(getSkinHref(live, 'video')).toBe('/skins/example');
    expect(getSkinHref(live, 'live-video')).toBe('/skins/example?use-case=live-video');
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
