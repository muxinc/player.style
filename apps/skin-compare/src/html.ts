import { getParams, markReady, setStageWidth, skinStyle } from './params';

const params = getParams();
const { entry: skin } = params;
const stage = setStageWidth(params);

// One preset per document: the audio, video and live-video players register overlapping elements.
if (params.kind === 'audio') await import('@videojs/html/audio/player');
else if (params.kind === 'live-video') await import('@videojs/html/live-video/player');
else await import('@videojs/html/video/player');
await skin.html();

const [player, media] =
  params.kind === 'audio'
    ? ['audio-player', 'audio']
    : params.kind === 'live-video'
      ? ['live-video-player', 'video']
      : ['video-player', 'video'];

stage.innerHTML = `
  <${player}>
    <${skin.tag} style="${skinStyle(params)}">
      <${media} src="${params.src}" playsinline crossorigin preload="metadata"></${media}>
      <img slot="poster" src="${params.poster}" alt="" />
    </${skin.tag}>
  </${player}>
`;

markReady();
