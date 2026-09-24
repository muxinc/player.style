// Demo media for the previews and snippets: the classic player.style assets, so the gallery shows the footage the
// Media Chrome edition did. The landscape promo carries a storyboard and chapters; the portrait one stands in for
// mobile-first skins; the live stream runs continuously so live skins report real live-edge state.
const LANDSCAPE_ID = 'fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ';
const PORTRAIT_ID = '1EFcsL5JET00t00mBv01t00xt00T4QeNQtsXx2cKY6DLd7RM';
const LIVE_ID = 'v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM';

export interface DemoVideo {
  /** A progressive rendition for the browser's own `<video>`. */
  mp4: string;
  /** The HLS stream for Mux and hls.js media. */
  hls: string;
  poster: string;
  /** WebVTT storyboard for seek thumbnails, attached as a `thumbnails` metadata track. */
  storyboard: string;
  /** WebVTT chapters, when the asset has them. */
  chapters?: string;
}

// These assets predate Mux's `highest.mp4` rendition name; `high.mp4` is their top progressive rendition.
export const DEMO_VIDEO: DemoVideo = {
  mp4: `https://stream.mux.com/${LANDSCAPE_ID}/high.mp4`,
  hls: `https://stream.mux.com/${LANDSCAPE_ID}.m3u8`,
  poster: `https://image.mux.com/${LANDSCAPE_ID}/thumbnail.webp?time=52`,
  storyboard: `https://image.mux.com/${LANDSCAPE_ID}/storyboard.vtt`,
  chapters: '/landscape-test-chapters.vtt',
};

export const DEMO_PORTRAIT_VIDEO: DemoVideo = {
  mp4: `https://stream.mux.com/${PORTRAIT_ID}/high.mp4`,
  hls: `https://stream.mux.com/${PORTRAIT_ID}.m3u8`,
  poster: `https://image.mux.com/${PORTRAIT_ID}/thumbnail.webp`,
  storyboard: `https://image.mux.com/${PORTRAIT_ID}/storyboard.vtt`,
};

/** The landscape promo's audio-only rendition, the file the audio snippets point at. */
export const DEMO_AUDIO = `https://stream.mux.com/${LANDSCAPE_ID}/audio.m4a`;
/** The landscape promo's stream, which the audio previews play through Mux Audio; its poster is the artwork. */
export const DEMO_AUDIO_HLS = DEMO_VIDEO.hls;

export const DEMO_LIVE_HLS = `https://stream.mux.com/${LIVE_ID}.m3u8`;
export const DEMO_LIVE_POSTER = `https://image.mux.com/${LIVE_ID}/thumbnail.webp`;

// Shown by the skins that render the media's title and a byline (`preview.metadata` in `skins.ts`).
export const DEMO_TITLE = 'Landscape Promo';
export const DEMO_BYLINE = 'by Mux';

// Standalone samples for the media types the shared assets cannot serve, matching the Video.js 10 installation guide
// (`site/src/consts.ts` in videojs/v10).
export const DEMO_DASH = 'https://dash.akamaized.net/akamai/streamroot/050714/Spring_4Ktest.mpd';
export const DEMO_VIMEO = 'https://vimeo.com/76979871';
export const DEMO_YOUTUBE = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
export const DEMO_CLOUDFLARE = 'https://watch.videodelivery.net/bfbd585059e33391d67b0f1d15fe6ea4';
export const DEMO_SPOTIFY = 'https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5';
export const DEMO_TIKTOK = 'https://www.tiktok.com/@_luwes/video/7527476667770522893';
export const DEMO_TWITCH = 'https://www.twitch.tv/videos/106400740';
