import '@videojs/html/video/player';
import { accentStyle, getParams, markReady, setStageWidth } from './params';
import { getSkin } from './skins';

const params = getParams();
const skin = getSkin(params.skin);
const stage = setStageWidth(params);

await skin.html();

stage.innerHTML = `
  <video-player>
    <${skin.tag} style="${accentStyle(params)}">
      <video src="${params.src}" playsinline crossorigin preload="metadata"></video>
      <img slot="poster" src="${params.poster}" alt="" />
    </${skin.tag}>
  </video-player>
`;

markReady();
