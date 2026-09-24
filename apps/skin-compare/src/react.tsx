import { Audio, AudioPlayer } from '@videojs/react/audio';
import { LiveVideoPlayer } from '@videojs/react/live-video';
import { Video, VideoPlayer } from '@videojs/react/video';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

import { getParams, markReady, setStageWidth } from './params';

const params = getParams();
const { entry: skin } = params;
const stage = setStageWidth(params);

const [{ Skin }] = await Promise.all([skin.react(), skin.css()]);
const style = {
  ...(params.accent ? { '--media-accent-color': `#${params.accent}` } : {}),
  ...(params.aspect ? { aspectRatio: params.aspect } : {}),
} as CSSProperties;

createRoot(stage).render(
  params.kind === 'audio' ? (
    <AudioPlayer poster={params.poster}>
      <Skin style={style}>
        <Audio src={params.src} crossOrigin="anonymous" preload="metadata" />
      </Skin>
    </AudioPlayer>
  ) : params.kind === 'live-video' ? (
    <LiveVideoPlayer poster={params.poster}>
      <Skin style={style}>
        <Video src={params.src} playsInline crossOrigin="anonymous" preload="metadata" />
      </Skin>
    </LiveVideoPlayer>
  ) : (
    <VideoPlayer poster={params.poster}>
      <Skin style={style}>
        <Video src={params.src} playsInline crossOrigin="anonymous" preload="metadata" />
      </Skin>
    </VideoPlayer>
  )
);

markReady();
