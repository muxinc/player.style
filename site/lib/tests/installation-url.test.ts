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
    expect(buildInstallationUrl(skin('neutral-video'))).toBe(
      'https://videojs.org/docs/guides/installation?skin=neutral'
    );
    expect(buildInstallationUrl(skin('default-audio'))).toBe(
      'https://videojs.org/docs/guides/installation?preset=audio'
    );
    expect(buildInstallationUrl(skin('neutral-live-audio'))).toBe(
      'https://videojs.org/docs/guides/installation?preset=live-audio&skin=neutral'
    );
  });
});

describe('getUsageNames', () => {
  it('derives tag and component names from the preset and tier', () => {
    expect(getUsageNames(skin('neutral-live-audio'))).toEqual({
      html: { player: 'live-audio-player', skin: 'live-audio-neutral-skin' },
      react: {
        player: 'LiveAudioPlayer',
        skin: 'NeutralLiveAudioSkin',
        media: 'Audio',
        entry: '@videojs/react/live-audio',
      },
    });
    expect(getUsageNames(skin('default-video')).html.skin).toBe('video-skin');
  });
});

describe('getUsageSnippets', () => {
  it('shows the custom elements and the React import', () => {
    expect(getUsageSnippets(skin('neutral-video'))).toEqual([
      { label: 'HTML', lang: 'html', code: '<video-player><video-neutral-skin>…</video-neutral-skin></video-player>' },
      {
        label: 'React',
        lang: 'tsx',
        code: "import { VideoPlayer, NeutralVideoSkin, Video } from '@videojs/react/video'",
      },
    ]);
  });
});
