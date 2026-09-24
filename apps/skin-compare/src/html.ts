import { getParams, markReady, setStageWidth, skinStyle } from './params';

const params = getParams();
const { entry: skin } = params;
const stage = setStageWidth(params);

// One preset per document: the audio and video players register overlapping elements.
if (params.kind === 'audio') await import('@videojs/html/audio/player');
else await import('@videojs/html/video/player');
await skin.html();

const [player, media] = params.kind === 'audio' ? ['audio-player', 'audio'] : ['video-player', 'video'];

stage.innerHTML = `
  <${player}>
    <${skin.tag} style="${skinStyle(params)}">
      <${media} src="${params.src}" playsinline crossorigin preload="metadata"></${media}>
      <img slot="poster" src="${params.poster}" alt="" />
    </${skin.tag}>
  </${player}>
`;

markReady();
