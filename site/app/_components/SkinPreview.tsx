'use client';

import { Audio, AudioPlayer, AudioSkin, MinimalAudioSkin } from '@videojs/react/audio';
import { LiveAudioPlayer, LiveAudioSkin, MinimalLiveAudioSkin } from '@videojs/react/live-audio';
import { LiveVideoPlayer, LiveVideoSkin, MinimalLiveVideoSkin } from '@videojs/react/live-video';
import { MuxAudio } from '@videojs/react/media/mux-audio';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { MinimalVideoSkin, Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import clsx from 'clsx';
import type { CSSProperties } from 'react';

import { DEMO_AUDIO, DEMO_LIVE_HLS, DEMO_VIDEO } from '@/lib/demo-media';
import type { FirstPartySkin } from '@/lib/skins';

import '@videojs/react/video/skin.css';
import '@videojs/react/video/minimal-skin.css';
import '@videojs/react/audio/skin.css';
import '@videojs/react/audio/minimal-skin.css';
import '@videojs/react/live-video/skin.css';
import '@videojs/react/live-video/minimal-skin.css';
import '@videojs/react/live-audio/skin.css';
import '@videojs/react/live-audio/minimal-skin.css';

export type SkinPreviewProps = {
  skin: FirstPartySkin;
  /** Six-digit hex accent without the `#`, applied through the skins' public `--media-accent-color` token. */
  accent?: string;
  preload?: 'none' | 'metadata';
  /** Audio skins follow `color-scheme` through `light-dark()`, so the backdrop decides which scheme they render in. */
  colorScheme?: 'light' | 'dark';
  className?: string;
};

function accentStyle(accent: string | undefined): CSSProperties | undefined {
  if (!accent) return undefined;

  return { '--media-accent-color': `#${accent}` } as CSSProperties;
}

/** A live Video.js player wearing the given first-party skin, playing the shared demo media. */
export default function SkinPreview({
  skin,
  accent,
  preload = 'none',
  colorScheme = 'light',
  className,
}: SkinPreviewProps) {
  const style = accentStyle(accent);
  const minimal = skin.tier === 'minimal';
  let player: React.ReactNode;

  switch (skin.useCase) {
    case 'video': {
      const Skin = minimal ? MinimalVideoSkin : VideoSkin;

      player = (
        <VideoPlayer poster={DEMO_VIDEO.poster}>
          <Skin className="aspect-video w-full" style={style}>
            <Video src={DEMO_VIDEO.mp4} preload={preload} playsInline crossOrigin="anonymous" />
          </Skin>
        </VideoPlayer>
      );
      break;
    }
    case 'live-video': {
      const Skin = minimal ? MinimalLiveVideoSkin : LiveVideoSkin;

      player = (
        <LiveVideoPlayer>
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
            <Audio src={DEMO_AUDIO} preload={preload} crossOrigin="anonymous" />
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

  return (
    <div className={clsx('w-full', className)} style={{ colorScheme }}>
      {player}
    </div>
  );
}

/** Whether a skin lays out as a compact bar (audio) rather than a 16:9 stage (video). */
export function isAudioSkin(skin: FirstPartySkin): boolean {
  return skin.useCase === 'audio' || skin.useCase === 'live-audio';
}
