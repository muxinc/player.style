import { describe, expect, it } from 'vite-plus/test';

import { buildInstallationUrl, getUsageNames } from '../installation-url';
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
