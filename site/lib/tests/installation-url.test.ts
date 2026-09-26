import { describe, expect, it } from 'vite-plus/test';

import { buildInstallationUrl, getUsageNames, getUsageSnippets } from '../installation-url';
import { getSkin, type FirstPartySkin } from '../skins';

function skin(slug: string): FirstPartySkin {
  const found = getSkin(slug);
  if (!found || found.kind !== 'first-party') throw new Error(`Missing first-party skin: ${slug}`);

  return found;
}

describe('buildInstallationUrl', () => {
  it('links the default video skin to the bare framework-agnostic route', () => {
    expect(buildInstallationUrl(skin('default-video'))).toBe('https://videojs.org/docs/guides/installation');
  });

  it('writes only the preset and skin, and only when they differ from the defaults', () => {
    expect(buildInstallationUrl(skin('minimal-video'))).toBe(
      'https://videojs.org/docs/guides/installation?skin=minimal'
    );
    expect(buildInstallationUrl(skin('default-audio'))).toBe(
      'https://videojs.org/docs/guides/installation?preset=audio'
    );
    expect(buildInstallationUrl(skin('minimal-live-audio'))).toBe(
      'https://videojs.org/docs/guides/installation?preset=live-audio&skin=minimal'
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

describe('getUsageSnippets', () => {
  it('shows the custom elements and the React import', () => {
    expect(getUsageSnippets(skin('minimal-video'))).toEqual([
      { label: 'HTML', lang: 'html', code: '<video-player><video-minimal-skin>…</video-minimal-skin></video-player>' },
      {
        label: 'React',
        lang: 'tsx',
        code: "import { VideoPlayer, MinimalVideoSkin, Video } from '@videojs/react/video'",
      },
    ]);
  });
});
