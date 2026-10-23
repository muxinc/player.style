'use client';

import { AudioPlayer, AudioSkin, NeutralAudioSkin } from '@videojs/react/audio';
import { LiveAudioPlayer, LiveAudioSkin, NeutralLiveAudioSkin } from '@videojs/react/live-audio';
import { LiveVideoPlayer, LiveVideoSkin, NeutralLiveVideoSkin } from '@videojs/react/live-video';
import { MuxAudio } from '@videojs/react/media/mux-audio';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { NeutralVideoSkin, Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
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
import {
  getDefaultUseCase,
  getPreviewFramework,
  isAudioSkin,
  isFixedSizeSkin,
  type FirstPartySkin,
  type Skin,
  type SkinFramework,
  type ThirdPartySkin,
  type UseCase,
} from '@/lib/skins';
import { HtmlSkin, ReactSkin } from '@/lib/third-party-previews';

import { useAccent } from './useAccent';

import '@videojs/react/video/skin.css';
import '@videojs/react/video/neutral-skin.css';
import '@videojs/react/audio/skin.css';
import '@videojs/react/audio/neutral-skin.css';
import '@videojs/react/live-video/skin.css';
import '@videojs/react/live-video/neutral-skin.css';
import '@videojs/react/live-audio/skin.css';
import '@videojs/react/live-audio/neutral-skin.css';

export type SkinPreviewProps = {
  skin: Skin;
  /** Which of the skin's use cases to preview, for a third-party skin that covers several; its default otherwise. */
  useCase?: UseCase;
  /**
   * The framework the page's picker holds (`react`, `html`, `vue`, `svelte`), for a third-party skin: React previews
   * its React build, the others its HTML build. Unset, or when the skin lacks that build, React comes first.
   */
  framework?: string;
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

  // Ported skins read `--media-accent-color`; `skin create` skins read `--media-accent`.
  return { '--media-accent-color': `#${accent}`, '--media-accent': `#${accent}` } as CSSProperties;
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

/** The demo media as markup for an HTML build, mirroring `DemoVideoMedia` and the Mux media below. */
function demoMediaHtml(skin: ThirdPartySkin, useCase: UseCase, preload: 'none' | 'metadata'): string {
  if (useCase === 'audio' || useCase === 'live-audio') {
    const src = useCase === 'audio' ? DEMO_AUDIO_HLS : DEMO_LIVE_HLS;

    return `<mux-audio src="${src}" preload="${preload}" crossorigin="anonymous"></mux-audio>`;
  }
  if (useCase === 'live-video') {
    return `<mux-video src="${DEMO_LIVE_HLS}" preload="${preload}" playsinline crossorigin="anonymous"></mux-video>`;
  }

  const video = skin.preview?.portrait ? DEMO_PORTRAIT_VIDEO : DEMO_VIDEO;
  const chapters = video.chapters ? `<track kind="chapters" src="${video.chapters}" srclang="en" default>` : '';

  return `<video src="${video.mp4}" preload="${preload}" playsinline crossorigin="anonymous"><track kind="metadata" label="thumbnails" src="${video.storyboard}" default>${chapters}</video>`;
}

/** The poster a use case's player shows: the live stream's, the video's (an audio skin's artwork), or none. */
function demoPoster(skin: ThirdPartySkin, useCase: UseCase): string | undefined {
  if (useCase === 'live-video') return DEMO_LIVE_POSTER;
  if (useCase === 'video') return (skin.preview?.portrait ? DEMO_PORTRAIT_VIDEO : DEMO_VIDEO).poster;

  return skin.preview?.metadata ? DEMO_VIDEO.poster : undefined;
}

/**
 * A third-party skin's build around the demo media for the use case. Video skins fill a 16:9 box unless they draw at a
 * fixed size; audio skins size to their content; live video plays the live stream on the live player. The React build
 * renders inside the React player; the HTML build is the player element with the skin's markup, mounted on the client.
 */
function ThirdPartyPlayer({
  skin,
  useCase,
  framework,
  preload,
  style,
}: PlayerProps & { skin: ThirdPartySkin; useCase: UseCase; framework: SkinFramework }) {
  const metadata = skin.preview?.metadata;
  const title = metadata ? DEMO_TITLE : undefined;
  const byline = metadata ? DEMO_BYLINE : undefined;
  const poster = demoPoster(skin, useCase);
  const className = clsx('w-full', !isAudioSkin(skin) && !isFixedSizeSkin(skin) && 'aspect-video');

  if (framework === 'html') {
    return (
      <HtmlSkin
        skin={skin}
        useCase={useCase}
        media={demoMediaHtml(skin, useCase, preload)}
        poster={poster}
        title={title}
        className={className}
        style={style}
      />
    );
  }

  const props = { skin, useCase, className, style, byline };

  switch (useCase) {
    case 'audio':
    case 'live-audio': {
      const Player = useCase === 'audio' ? AudioPlayer : LiveAudioPlayer;

      return (
        <Player title={title} poster={poster}>
          <ReactSkin {...props}>
            <MuxAudio
              src={useCase === 'audio' ? DEMO_AUDIO_HLS : DEMO_LIVE_HLS}
              preload={preload}
              crossOrigin="anonymous"
            />
          </ReactSkin>
        </Player>
      );
    }
    case 'live-video':
      return (
        <LiveVideoPlayer poster={poster} title={title}>
          <ReactSkin {...props}>
            <MuxVideo src={DEMO_LIVE_HLS} preload={preload} playsInline crossOrigin="anonymous" />
          </ReactSkin>
        </LiveVideoPlayer>
      );
    case 'video':
      return (
        <VideoPlayer poster={poster} title={title}>
          <ReactSkin {...props}>
            <DemoVideoMedia video={skin.preview?.portrait ? DEMO_PORTRAIT_VIDEO : DEMO_VIDEO} preload={preload} />
          </ReactSkin>
        </VideoPlayer>
      );
  }
}

function FirstPartyPlayer({ skin, preload, style }: PlayerProps & { skin: FirstPartySkin }) {
  const neutral = skin.tier === 'neutral';
  let player: React.ReactNode;

  switch (skin.useCase) {
    case 'video': {
      const Skin = neutral ? NeutralVideoSkin : VideoSkin;

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
      const Skin = neutral ? NeutralLiveVideoSkin : LiveVideoSkin;

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
      const Skin = neutral ? NeutralAudioSkin : AudioSkin;

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
      const Skin = neutral ? NeutralLiveAudioSkin : LiveAudioSkin;

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
 * the skins' public accent tokens.
 */
export default function SkinPreview({
  skin,
  useCase,
  framework,
  preload = 'none',
  colorScheme,
  className,
}: SkinPreviewProps) {
  const style = accentStyle(useAccent());

  return (
    <div
      className={clsx('w-full', !colorScheme && 'scheme-light dark:scheme-dark', className)}
      style={colorScheme ? { colorScheme } : undefined}
    >
      {skin.kind === 'first-party' ? (
        <FirstPartyPlayer skin={skin} preload={preload} style={style} />
      ) : (
        <ThirdPartyPlayer
          skin={skin}
          useCase={useCase ?? getDefaultUseCase(skin)}
          framework={getPreviewFramework(skin, useCase ?? getDefaultUseCase(skin), framework)}
          preload={preload}
          style={style}
        />
      )}
    </div>
  );
}
