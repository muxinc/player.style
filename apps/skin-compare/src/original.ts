import { getParams, markReady, setStageWidth, skinStyle } from './params';

const params = getParams();
const { entry: skin } = params;
const stage = setStageWidth(params);

/* The published Media Chrome edition, from jsDelivr's ESM bundle; it carries its own media-chrome. */
await import(/* @vite-ignore */ `https://cdn.jsdelivr.net/npm/${skin.legacy.pkg}@${skin.legacy.version}/+esm`);

const { tag } = skin.legacy;
const media = params.kind === 'audio' ? 'audio' : 'video';
// A live entry forces the theme's live branch: the template reads `streamtype` from the theme element's attributes.
const streamType = params.kind === 'live-video' ? ' streamtype="live"' : '';

stage.innerHTML = `
  <${tag}${streamType} style="${skinStyle(params)}">
    <${media} slot="media" src="${params.src}" playsinline crossorigin preload="metadata"></${media}>
    <img slot="poster" src="${params.poster}" alt="" />
  </${tag}>
`;

markReady();
