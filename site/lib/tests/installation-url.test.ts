import { describe, expect, it } from 'vite-plus/test';

import { buildInstallationUrl, getUsageNames, getUsageSnippet } from '../installation-url';
import { getSkin, type FirstPartySkin } from '../skins';

function skin(slug: string): FirstPartySkin {
  const found = getSkin(slug);
  if (!found || found.kind !== 'first-party') throw new Error(`Missing first-party skin: ${slug}`);

  return found;
}

describe('buildInstallationUrl', () => {
  it('leaves every default out of the query', () => {
    expect(buildInstallationUrl(skin('default-video'), 'react', 'html5-video')).toBe(
      'https://videojs.org/docs/guides/installation/react'
    );
  });

  it('writes the preset, skin, and media when they differ from the defaults', () => {
    expect(buildInstallationUrl(skin('minimal-live-audio'), 'html', 'mux-audio')).toBe(
      'https://videojs.org/docs/guides/installation/html?preset=live-audio&skin=minimal'
    );
    expect(buildInstallationUrl(skin('minimal-video'), 'vue', 'hls')).toBe(
      'https://videojs.org/docs/guides/installation/vue?skin=minimal&media=hls'
    );
    expect(buildInstallationUrl(skin('default-audio'), 'cdn', 'spotify')).toBe(
      'https://videojs.org/docs/guides/installation/cdn?preset=audio&media=spotify'
    );
  });

  it('asks the shadcn guide for the React variant', () => {
    expect(buildInstallationUrl(skin('default-video'), 'shadcn', 'html5-video')).toBe(
      'https://videojs.org/docs/guides/installation/shadcn?framework=react'
    );
    expect(buildInstallationUrl(skin('minimal-live-video'), 'shadcn', 'mux-video')).toBe(
      'https://videojs.org/docs/guides/installation/shadcn?preset=live-video&skin=minimal&media=mux-video&framework=react'
    );
  });
});

describe('getUsageNames', () => {
  it('derives tag and component names from the preset and tier', () => {
    expect(getUsageNames(skin('minimal-live-audio'))).toEqual({
      html: { player: 'live-audio-player', skin: 'live-audio-minimal-skin' },
      react: {
        player: 'LiveAudioPlayer',
        skin: 'MinimalLiveAudioSkin',
        media: 'Audio',
        entry: '@videojs/react/live-audio',
      },
    });
    expect(getUsageNames(skin('default-video')).html.skin).toBe('video-skin');
  });
});

describe('getUsageSnippet', () => {
  it('shows the React import for React and the custom elements for the other frameworks', () => {
    expect(getUsageSnippet(skin('minimal-video'), 'react')).toEqual({
      label: 'React',
      code: "import { VideoPlayer, MinimalVideoSkin, Video } from '@videojs/react/video'",
    });
    expect(getUsageSnippet(skin('minimal-video'), 'vue')).toEqual({
      label: 'HTML',
      code: '<video-player><video-minimal-skin>…</video-minimal-skin></video-player>',
    });
  });

  it('shows no import line for shadcn or the CDN', () => {
    expect(getUsageSnippet(skin('default-video'), 'shadcn')).toBeUndefined();
    expect(getUsageSnippet(skin('default-video'), 'cdn')).toBeUndefined();
  });
});
