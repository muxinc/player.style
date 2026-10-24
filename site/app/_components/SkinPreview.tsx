'use client';

import { AudioPlayer, AudioSkin, NeutralAudioSkin } from '@videojs/react/audio';
import { LiveAudioPlayer, LiveAudioSkin, NeutralLiveAudioSkin } from '@videojs/react/live-audio';
import { LiveVideoPlayer, LiveVideoSkin, NeutralLiveVideoSkin } from '@videojs/react/live-video';
import { MuxAudio } from '@videojs/react/media/mux-audio';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { NeutralVideoSkin, Video, VideoPlayer, VideoSkin } from '@videojs/react/video';
import clsx from 'clsx';
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { DEMO_AUDIO_HLS, DEMO_BYLINE, DEMO_LIVE_HLS, DEMO_TITLE, getDemoPoster, getDemoVideo } from '@/lib/demo-media';
import {
  getDefaultUseCase,
  getPreviewFramework,
  isAudioSkin,
  isFixedSizeSkin,
  isPortraitPreview,
  type FirstPartySkin,
  type Skin,
  type SkinFramework,
  type SkinTier,
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
  /** Which of a third-party skin's builds to preview. Unset, or when the skin lacks that build, React comes first. */
  framework?: SkinFramework;
  preload?: 'none' | 'metadata';
  /**
   * Audio skins follow `color-scheme` through `light-dark()`, so the backdrop decides which scheme they render in.
   * Unset, the preview follows the site theme.
   */
  colorScheme?: 'light' | 'dark';
  className?: string;
};

type Preload = 'none' | 'metadata';

function accentStyle(accent: string | undefined): CSSProperties | undefined {
  if (!accent) return undefined;

  // Ported skins read `--media-accent-color`; `skin create` skins read `--media-accent`.
  return { '--media-accent-color': `#${accent}`, '--media-accent': `#${accent}` } as CSSProperties;
}

type PlayerComponent = ComponentType<{ poster?: string; title?: string; children: ReactNode }>;
type SkinComponent = ComponentType<{ className?: string; style?: CSSProperties; children?: ReactNode }>;

/**
 * Each use case's demo: the player, the first-party skins, and the media it plays. Video plays the browser's own
 * `<video>` on the demo asset (the portrait one for a mobile-first skin), with its storyboard for seek thumbnails and
 * its chapters; live video plays the live stream through Mux Video; audio plays the promo's stream, or the live one,
 * through Mux Audio.
 */
const DEMO: Record<
  UseCase,
  {
    Player: PlayerComponent;
    skins: Record<SkinTier, SkinComponent>;
    media: 'video' | 'mux-video' | 'mux-audio';
    src?: string;
  }
> = {
  video: { Player: VideoPlayer, skins: { default: VideoSkin, neutral: NeutralVideoSkin }, media: 'video' },
  audio: {
    Player: AudioPlayer,
    skins: { default: AudioSkin, neutral: NeutralAudioSkin },
    media: 'mux-audio',
    src: DEMO_AUDIO_HLS,
  },
  'live-video': {
    Player: LiveVideoPlayer,
    skins: { default: LiveVideoSkin, neutral: NeutralLiveVideoSkin },
    media: 'mux-video',
    src: DEMO_LIVE_HLS,
  },
  'live-audio': {
    Player: LiveAudioPlayer,
    skins: { default: LiveAudioSkin, neutral: NeutralLiveAudioSkin },
    media: 'mux-audio',
    src: DEMO_LIVE_HLS,
  },
};

type DemoMediaProps = { useCase: UseCase; preview?: ThirdPartySkin['preview']; preload: Preload };

/** The use case's demo media, as a React element. */
function DemoMedia({ useCase, preview, preload }: DemoMediaProps) {
  const { media, src } = DEMO[useCase];

  if (media === 'mux-audio') return <MuxAudio src={src} preload={preload} crossOrigin="anonymous" />;
  if (media === 'mux-video') return <MuxVideo src={src} preload={preload} playsInline crossOrigin="anonymous" />;

  const video = getDemoVideo(preview);

  return (
    <Video src={video.mp4} preload={preload} playsInline crossOrigin="anonymous">
      <track kind="metadata" label="thumbnails" src={video.storyboard} default />
      {video.chapters && <track kind="chapters" src={video.chapters} srcLang="en" default />}
    </Video>
  );
}

/** The same media as markup, for an HTML build. */
function demoMediaHtml({ useCase, preview, preload }: DemoMediaProps): string {
  const { media, src } = DEMO[useCase];
  const attributes = `preload="${preload}"${media === 'mux-audio' ? '' : ' playsinline'} crossorigin="anonymous"`;

  if (media !== 'video') return `<${media} src="${src}" ${attributes}></${media}>`;

  const video = getDemoVideo(preview);
  const chapters = video.chapters ? `<track kind="chapters" src="${video.chapters}" srclang="en" default>` : '';

  return `<video src="${video.mp4}" ${attributes}><track kind="metadata" label="thumbnails" src="${video.storyboard}" default>${chapters}</video>`;
}

type PlayerProps = { preload: Preload; style: CSSProperties | undefined };

/**
 * A third-party skin's build around the demo media for the use case. Video skins fill a 16:9 box (9:16 for the portrait
 * demo, which the caller caps in width) unless they draw at a fixed size; audio skins size to their content. The React build renders inside the React player; the HTML build is
 * the player element with the skin's markup, mounted on the client.
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
  const poster = getDemoPoster(useCase, skin.preview);
  const boxed = !isAudioSkin(skin) && !isFixedSizeSkin(skin);
  const className = clsx('w-full', boxed && (isPortraitPreview(skin, useCase) ? 'aspect-9/16' : 'aspect-video'));
  const media = { useCase, preview: skin.preview, preload };

  if (framework === 'html') {
    return (
      <HtmlSkin
        skin={skin}
        useCase={useCase}
        media={demoMediaHtml(media)}
        poster={poster}
        title={title}
        byline={byline}
        className={className}
        style={style}
      />
    );
  }

  const { Player } = DEMO[useCase];

  return (
    <Player poster={poster} title={title}>
      <ReactSkin skin={skin} useCase={useCase} className={className} style={style} byline={byline}>
        <DemoMedia {...media} />
      </ReactSkin>
    </Player>
  );
}

function FirstPartyPlayer({ skin, preload, style }: PlayerProps & { skin: FirstPartySkin }) {
  const { Player, skins } = DEMO[skin.useCase];
  const Skin = skins[skin.tier];

  return (
    <Player poster={getDemoPoster(skin.useCase)}>
      <Skin className={clsx('w-full', !isAudioSkin(skin) && 'aspect-video')} style={style}>
        <DemoMedia useCase={skin.useCase} preload={preload} />
      </Skin>
    </Player>
  );
}

/**
 * Closes the preview's open menus and tooltips before they reach the sticky site header. They are top-layer popovers, so
 * they would otherwise paint over the header while their player scrolls under it. The header's height is the root's
 * `scroll-padding-top`, which keeps anchored scrolls clear of it too.
 */
function useClosePopoversUnderHeader(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let frame = 0;
    // Where the preview was in the last frame drawn. An anchored popover's box catches up with a scroll a frame late,
    // so the distance the preview has moved since is where the popover is about to be drawn.
    let lastTop: number | undefined;

    const check = () => {
      frame = 0;
      const root = ref.current;
      const open = root?.querySelectorAll<HTMLElement>(':popover-open');
      if (!root || !open?.length) {
        lastTop = undefined;
        return;
      }

      const top = root.getBoundingClientRect().top;
      const moved = lastTop === undefined ? 0 : top - lastTop;
      lastTop = top;

      const headerBottom = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      for (const popover of open) {
        if (popover.getBoundingClientRect().top + moved < headerBottom) popover.hidePopover();
      }
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(check);
    };

    // `toggle` does not bubble, so it is caught on the way down.
    const onToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === 'open') lastTop = ref.current?.getBoundingClientRect().top;
    };

    const root = ref.current;
    root?.addEventListener('toggle', onToggle, { capture: true });
    // Captured, so a scrolling ancestor other than the page counts too.
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });

    return () => {
      root?.removeEventListener('toggle', onToggle, { capture: true });
      window.removeEventListener('scroll', onScroll, { capture: true });
      cancelAnimationFrame(frame);
    };
  }, [ref]);
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
  const accent = useAccent();
  // One object per accent, so the HTML preview's accent effect runs only when the accent changes.
  const style = useMemo(() => accentStyle(accent), [accent]);
  const ref = useRef<HTMLDivElement>(null);
  useClosePopoversUnderHeader(ref);

  return (
    <div
      ref={ref}
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
