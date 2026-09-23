// Demo media for the previews. These mirror `site/src/consts.ts` in the Video.js 10 repository
// (VJS10_DEMO_VIDEO, VJS10_DEMO_AUDIO, VJS10_DEMO_LIVE) so the gallery shows the same footage as the docs.
const DEMO_VIDEO_ID = 'BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM';
const DEMO_LIVE_ID = 'v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM';

export const DEMO_VIDEO = {
  mp4: `https://stream.mux.com/${DEMO_VIDEO_ID}/highest.mp4`,
  poster: `https://image.mux.com/${DEMO_VIDEO_ID}/thumbnail.webp`,
} as const;

export const DEMO_AUDIO = `https://stream.mux.com/${DEMO_VIDEO_ID}/audio.m4a`;

// A continuously running live stream, so the live skins report real live-edge state.
export const DEMO_LIVE_HLS = `https://stream.mux.com/${DEMO_LIVE_ID}.m3u8`;
export const DEMO_LIVE_POSTER = `https://image.mux.com/${DEMO_LIVE_ID}/thumbnail.webp`;
