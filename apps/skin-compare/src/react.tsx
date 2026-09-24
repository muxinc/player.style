import { Audio, AudioPlayer } from '@videojs/react/audio';
import { LiveVideoPlayer } from '@videojs/react/live-video';
import { Video, VideoPlayer } from '@videojs/react/video';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

// The React edition renders in the page's light DOM; give it the site's page reset (see vite.config.ts).
import 'virtual:host-reset.css';

import { getParams, markReady, setStageWidth } from './params';

const params = getParams();
const { entry: skin } = params;
const stage = setStageWidth(params);

const [{ Skin }] = await Promise.all([skin.react(), skin.css()]);
const tracks = params.tracks && (
  <>
    <track kind="metadata" label="thumbnails" src={params.tracks.thumbnails} default />
    <track kind="captions" label="English" srcLang="en" src={params.tracks.captions} />
  </>
);
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
        <Video src={params.src} playsInline crossOrigin="anonymous" preload="metadata">
          {tracks}
        </Video>
      </Skin>
    </LiveVideoPlayer>
  ) : (
    <VideoPlayer poster={params.poster}>
      <Skin style={style}>
        <Video src={params.src} playsInline crossOrigin="anonymous" preload="metadata">
          {tracks}
        </Video>
      </Skin>
    </VideoPlayer>
  )
);

markReady();
