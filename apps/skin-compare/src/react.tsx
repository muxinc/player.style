import { Video, VideoPlayer } from '@videojs/react/video';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

import { getParams, markReady, setStageWidth } from './params';
import { getSkin } from './skins';

const params = getParams();
const skin = getSkin(params.skin);
const stage = setStageWidth(params);

const [{ Skin }] = await Promise.all([skin.react(), skin.css()]);
const style = params.accent ? ({ '--media-accent-color': `#${params.accent}` } as CSSProperties) : undefined;

createRoot(stage).render(
  <VideoPlayer poster={params.poster}>
    <Skin style={style}>
      <Video src={params.src} playsInline crossOrigin="anonymous" preload="metadata" />
    </Skin>
  </VideoPlayer>
);

markReady();
