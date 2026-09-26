import { Audio, AudioPlayer } from '@videojs/react/audio';
import { LiveVideoPlayer } from '@videojs/react/live-video';
import { MuxAudio } from '@videojs/react/media/mux-audio';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { Video, VideoPlayer } from '@videojs/react/video';
import { type ComponentType, createElement, type CSSProperties, lazy, type ReactNode, use } from 'react';

import { BYLINE, type Media, TITLE } from './media';
import { SKINS, type SkinPackage } from './skins';
import type { Framework } from './state';

export interface PlayerProps {
  skin: SkinPackage;
  media: Media;
  style?: CSSProperties;
}

// The player elements and Mux media the HTML element needs, loaded only when it renders.
const HTML_PLAYERS = {
  video: () => import('@videojs/html/video/player'),
  audio: () => import('@videojs/html/audio/player'),
  'live-video': () => import('@videojs/html/live-video/player'),
};
const HTML_MUX_MEDIA = {
  audio: () => import('@videojs/html/media/mux-audio'),
  video: () => import('@videojs/html/media/mux-video'),
};

// One lazy component per package, made once, so returning to a skin reuses its loaded module.
const REACT_SKINS = Object.fromEntries(
  SKINS.map((skin) => [skin.name, lazy(() => skin.react().then((component) => ({ default: component })))])
);

// `use()` needs the same promise on every render, so the HTML element loads once per skin and media kind.
const loads = new Map<string, Promise<unknown>>();

function load(key: string, start: () => Promise<unknown>) {
  if (!loads.has(key)) loads.set(key, start());

  return loads.get(key)!;
}

function isAudio(skin: SkinPackage) {
  return skin.preset === 'audio';
}

/** Audio skins without metadata draw no artwork, so they get no poster. */
function posterFor({ skin, media }: PlayerProps) {
  return isAudio(skin) && !skin.metadata ? undefined : media.poster;
}

function playerClass(skin: SkinPackage) {
  return isAudio(skin) || skin.fixedSize ? 'player' : 'player player-video';
}

/** The React component: `@player.style/<name>/react` inside the Video.js React player for the skin's preset. */
export function ReactPlayer(props: PlayerProps) {
  const { skin, media, style } = props;
  const Skin = REACT_SKINS[skin.name];
  const poster = posterFor(props);
  let children: ReactNode;

  if (isAudio(skin)) {
    children = media.mux ? (
      <MuxAudio src={media.src} crossOrigin="anonymous" />
    ) : (
      <Audio src={media.src} crossOrigin="anonymous" />
    );
  } else {
    children = media.mux ? (
      <MuxVideo src={media.src} playsInline crossOrigin="anonymous" />
    ) : (
      <Video src={media.src} playsInline crossOrigin="anonymous" />
    );
  }

  const player = (
    <Skin className={playerClass(skin)} style={style} byline={skin.metadata ? BYLINE : undefined}>
      {children}
    </Skin>
  );

  if (skin.preset === 'audio') {
    return (
      <AudioPlayer title={TITLE} poster={poster}>
        {player}
      </AudioPlayer>
    );
  }

  if (skin.preset === 'live-video') {
    return (
      <LiveVideoPlayer title={TITLE} poster={poster}>
        {player}
      </LiveVideoPlayer>
    );
  }

  return (
    <VideoPlayer title={TITLE} poster={poster}>
      {player}
    </VideoPlayer>
  );
}

/**
 * The HTML element: `@player.style/<name>/html` defines `<name>-skin`, rendered here as plain custom elements, the
 * markup a page would write: `<video-player><yt-skin><video>…</video></yt-skin></video-player>`.
 */
export function HtmlPlayer(props: PlayerProps) {
  const { skin, media, style } = props;
  const audio = isAudio(skin);
  const kind = audio ? 'audio' : 'video';

  use(
    load(`${skin.name}:html:${media.mux ? 'mux' : 'native'}`, () =>
      Promise.all([skin.html(), HTML_PLAYERS[skin.preset](), media.mux ? HTML_MUX_MEDIA[kind]() : undefined])
    )
  );

  const poster = posterFor(props);
  const mediaElement = createElement(media.mux ? `mux-${kind}` : kind, {
    src: media.src,
    crossOrigin: 'anonymous',
    playsInline: audio ? undefined : true,
  });

  return createElement(
    `${skin.preset}-player`,
    { 'content-title': TITLE },
    createElement(
      `${skin.name}-skin`,
      { className: playerClass(skin), style },
      mediaElement,
      poster ? <img slot="poster" src={poster} alt="" /> : null,
      skin.metadata ? <span slot="byline">{BYLINE}</span> : null
    )
  );
}

export const FRAMEWORK_PLAYERS: Record<Framework, ComponentType<PlayerProps>> = {
  react: ReactPlayer,
  html: HtmlPlayer,
};
