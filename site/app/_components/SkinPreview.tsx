'use client';

import { AudioPlayer, AudioSkin, MinimalAudioSkin } from '@videojs/react/audio';
import { LiveAudioPlayer, LiveAudioSkin, MinimalLiveAudioSkin } from '@videojs/react/live-audio';
import { LiveVideoPlayer, LiveVideoSkin, MinimalLiveVideoSkin } from '@videojs/react/live-video';
import { MuxAudio } from '@videojs/react/media/mux-audio';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { MinimalVideoSkin, Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import clsx from 'clsx';
import type { CSSProperties } from 'react';

import {
  DEMO_AUDIO_HLS,
  DEMO_BYLINE,
  DEMO_LIVE_HLS,
  DEMO_LIVE_POSTER,
  DEMO_PORTRAIT_VIDEO,
  DEMO_TITLE,
  DEMO_VIDEO,
  type DemoVideo,
} from '@/lib/demo-media';
import { isAudioSkin, type FirstPartySkin, type Skin, type ThirdPartySkin } from '@/lib/skins';
import { ThirdPartySkinPreview } from '@/lib/third-party-previews';

import { useAccent } from './useAccent';

import '@videojs/react/video/skin.css';
import '@videojs/react/video/minimal-skin.css';
import '@videojs/react/audio/skin.css';
import '@videojs/react/audio/minimal-skin.css';
import '@videojs/react/live-video/skin.css';
import '@videojs/react/live-video/minimal-skin.css';
import '@videojs/react/live-audio/skin.css';
import '@videojs/react/live-audio/minimal-skin.css';

export type SkinPreviewProps = {
  skin: Skin;
  preload?: 'none' | 'metadata';
  /**
   * Audio skins follow `color-scheme` through `light-dark()`, so the backdrop decides which scheme they render in.
   * Unset, the preview follows the site theme.
   */
  colorScheme?: 'light' | 'dark';
  className?: string;
};

function accentStyle(accent: string | undefined): CSSProperties | undefined {
  if (!accent) return undefined;

  return { '--media-accent-color': `#${accent}` } as CSSProperties;
}

type PlayerProps = {
  preload: 'none' | 'metadata';
  style: CSSProperties | undefined;
};

/** The browser's own `<video>` on the demo asset, with its storyboard for seek thumbnails and its chapters. */
function DemoVideoMedia({ video, preload }: { video: DemoVideo; preload: 'none' | 'metadata' }) {
  return (
    <Video src={video.mp4} preload={preload} playsInline crossOrigin="anonymous">
      <track kind="metadata" label="thumbnails" src={video.storyboard} default />
      {video.chapters && <track kind="chapters" src={video.chapters} srcLang="en" default />}
    </Video>
  );
}

/**
 * A third-party skin's React edition around the demo media for its use case. Video skins fill a 16:9 box unless they
 * draw at a fixed size; audio skins size to their content; a live edition plays the live stream on the live player.
 */
function ThirdPartyPlayer({ skin, preload, style }: PlayerProps & { skin: ThirdPartySkin }) {
  const metadata = skin.preview?.metadata;
  const title = metadata ? DEMO_TITLE : undefined;
  const byline = metadata ? DEMO_BYLINE : undefined;
  const className = clsx('w-full', !isAudioSkin(skin) && !skin.preview?.fixedSize && 'aspect-video');

  if (isAudioSkin(skin)) {
    // An audio skin that shows metadata also shows artwork; the video's poster stands in for it.
    return (
      <AudioPlayer title={title} poster={metadata ? DEMO_VIDEO.poster : undefined}>
        <ThirdPartySkinPreview slug={skin.slug} className={className} style={style} byline={byline}>
          <MuxAudio src={DEMO_AUDIO_HLS} preload={preload} crossOrigin="anonymous" />
        </ThirdPartySkinPreview>
      </AudioPlayer>
    );
  }

  if (skin.edition === 'live') {
    return (
      <LiveVideoPlayer poster={DEMO_LIVE_POSTER} title={title}>
        <ThirdPartySkinPreview slug={skin.slug} className={className} style={style} byline={byline}>
          <MuxVideo src={DEMO_LIVE_HLS} preload={preload} playsInline crossOrigin="anonymous" />
        </ThirdPartySkinPreview>
      </LiveVideoPlayer>
    );
  }

  const video = skin.preview?.portrait ? DEMO_PORTRAIT_VIDEO : DEMO_VIDEO;

  return (
    <VideoPlayer poster={video.poster} title={title}>
      <ThirdPartySkinPreview slug={skin.slug} className={className} style={style} byline={byline}>
        <DemoVideoMedia video={video} preload={preload} />
      </ThirdPartySkinPreview>
    </VideoPlayer>
  );
}

function FirstPartyPlayer({ skin, preload, style }: PlayerProps & { skin: FirstPartySkin }) {
  const minimal = skin.tier === 'minimal';
  let player: React.ReactNode;

  switch (skin.useCase) {
    case 'video': {
      const Skin = minimal ? MinimalVideoSkin : VideoSkin;

      player = (
        <VideoPlayer poster={DEMO_VIDEO.poster}>
          <Skin className="aspect-video w-full" style={style}>
            <DemoVideoMedia video={DEMO_VIDEO} preload={preload} />
          </Skin>
        </VideoPlayer>
      );
      break;
    }
    case 'live-video': {
      const Skin = minimal ? MinimalLiveVideoSkin : LiveVideoSkin;

      player = (
        <LiveVideoPlayer poster={DEMO_LIVE_POSTER}>
          <Skin className="aspect-video w-full" style={style}>
            <MuxVideo src={DEMO_LIVE_HLS} preload={preload} playsInline crossOrigin="anonymous" />
          </Skin>
        </LiveVideoPlayer>
      );
      break;
    }
    case 'audio': {
      const Skin = minimal ? MinimalAudioSkin : AudioSkin;

      player = (
        <AudioPlayer>
          <Skin className="w-full" style={style}>
            <MuxAudio src={DEMO_AUDIO_HLS} preload={preload} crossOrigin="anonymous" />
          </Skin>
        </AudioPlayer>
      );
      break;
    }
    case 'live-audio': {
      const Skin = minimal ? MinimalLiveAudioSkin : LiveAudioSkin;

      player = (
        <LiveAudioPlayer>
          <Skin className="w-full" style={style}>
            <MuxAudio src={DEMO_LIVE_HLS} preload={preload} crossOrigin="anonymous" />
          </Skin>
        </LiveAudioPlayer>
      );
      break;
    }
  }

  return player;
}

/**
 * A live Video.js player wearing the given skin, playing the shared demo media. The live `?accent=` is applied through
 * the skins' public `--media-accent-color` token.
 */
export default function SkinPreview({ skin, preload = 'none', colorScheme, className }: SkinPreviewProps) {
  const style = accentStyle(useAccent());

  return (
    <div
      className={clsx('w-full', !colorScheme && 'scheme-light dark:scheme-dark', className)}
      style={colorScheme ? { colorScheme } : undefined}
    >
      {skin.kind === 'first-party' ? (
        <FirstPartyPlayer skin={skin} preload={preload} style={style} />
      ) : (
        <ThirdPartyPlayer skin={skin} preload={preload} style={style} />
      )}
    </div>
  );
}
