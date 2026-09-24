import { accentStyle, getParams, markReady, setStageWidth } from './params';
import { getSkin } from './skins';

const params = getParams();
const skin = getSkin(params.skin);
const stage = setStageWidth(params);

/* The published Media Chrome edition, from jsDelivr's ESM bundle; it carries its own media-chrome. */
await import(/* @vite-ignore */ `https://cdn.jsdelivr.net/npm/${skin.legacy.pkg}@${skin.legacy.version}/+esm`);

const { tag } = skin.legacy;

stage.innerHTML = `
  <${tag} style="${accentStyle(params)}">
    <video slot="media" src="${params.src}" playsinline crossorigin preload="metadata"></video>
    <img slot="poster" src="${params.poster}" alt="" />
  </${tag}>
`;

markReady();
