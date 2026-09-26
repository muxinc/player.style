import type { DocsPreset, UseCase } from './skins';

/** The media types the Video.js 10 installation guide offers, keyed as its `?media=` param spells them. */
export type Renderer =
  | 'html5-video'
  | 'html5-audio'
  | 'hls'
  | 'dash'
  | 'mux-video'
  | 'mux-audio'
  | 'vimeo'
  | 'youtube'
  | 'cloudflare'
  | 'spotify'
  | 'tiktok'
  | 'twitch';

export interface MediaOption {
  id: Renderer;
  label: string;
}

export interface PresetInfo {
  /** Value of the docs `?preset=` param, and the entry group in `@videojs/html` and `@videojs/react`. */
  flag: string;
  /** Prefix of the HTML tag names (`video-skin`, `live-audio-player`). */
  tagPrefix: string;
  /** Prefix of the React component names (`VideoSkin`, `LiveAudioPlayer`). */
  componentPrefix: string;
  /** The media component the preset entry point exports. */
  mediaComponent: 'Video' | 'Audio';
  live: boolean;
  /** Media options in docs order; the first one is the docs default and stays out of the URL. */
  media: readonly MediaOption[];
}

// Mirrors INSTALLATION_PRESETS in the Video.js 10 docs (`site/src/utils/installation/types.ts`).
export const PRESETS: Record<DocsPreset, PresetInfo> = {
  'default-video': {
    flag: 'video',
    tagPrefix: 'video',
    componentPrefix: 'Video',
    mediaComponent: 'Video',
    live: false,
    media: [
      { id: 'html5-video', label: 'Video file' },
      { id: 'hls', label: 'HLS' },
      { id: 'dash', label: 'DASH' },
      { id: 'mux-video', label: 'Mux' },
      { id: 'vimeo', label: 'Vimeo' },
      { id: 'youtube', label: 'YouTube' },
      { id: 'cloudflare', label: 'Cloudflare Stream' },
      { id: 'tiktok', label: 'TikTok' },
      { id: 'twitch', label: 'Twitch' },
    ],
  },
  'default-audio': {
    flag: 'audio',
    tagPrefix: 'audio',
    componentPrefix: 'Audio',
    mediaComponent: 'Audio',
    live: false,
    media: [
      { id: 'html5-audio', label: 'Audio file' },
      { id: 'mux-audio', label: 'Mux' },
      { id: 'spotify', label: 'Spotify' },
    ],
  },
  'live-video': {
    flag: 'live-video',
    tagPrefix: 'live-video',
    componentPrefix: 'LiveVideo',
    mediaComponent: 'Video',
    live: true,
    media: [
      { id: 'hls', label: 'HLS' },
      { id: 'mux-video', label: 'Mux' },
    ],
  },
  'live-audio': {
    flag: 'live-audio',
    tagPrefix: 'live-audio',
    componentPrefix: 'LiveAudio',
    mediaComponent: 'Audio',
    live: true,
    media: [{ id: 'mux-audio', label: 'Mux' }],
  },
};

export const DEFAULT_PRESET: DocsPreset = 'default-video';

/** The installation preset whose player hosts a skin for the use case. */
export const USE_CASE_PRESETS: Record<UseCase, DocsPreset> = {
  video: 'default-video',
  audio: 'default-audio',
  'live-video': 'live-video',
  'live-audio': 'live-audio',
};

export function getMediaOptions(preset: DocsPreset): readonly MediaOption[] {
  return PRESETS[preset].media;
}

/** The media the picker falls back to: the preset's first option, matching the docs default. */
export function resolveRenderer(preset: DocsPreset, value: string | null | undefined): Renderer {
  const options = getMediaOptions(preset);
  const match = options.find((option) => option.id === value);

  return (match ?? options[0]!).id;
}

interface RendererInfo {
  /** The custom element (`hlsjs-video`) or native tag (`video`) that plays the media. */
  tag: string;
  /** The React media component (`HlsJsVideo`). */
  component: string;
  /** Subpath under `@videojs/html/media/` and `@videojs/react/media/`; `null` when the preset entry ships the media. */
  subpath: string | null;
  /** The adapter package installed beside `@videojs/html` or `@videojs/react`; `null` when none is needed. */
  adapter: string | null;
}

// Mirrors getRendererTag, getRendererComponent, getMediaSubpath, and getAdapterPackage in the Video.js 10 docs
// (`site/src/utils/installation/{types,codegen}.ts`).
export const RENDERERS: Record<Renderer, RendererInfo> = {
  'html5-video': { tag: 'video', component: 'Video', subpath: null, adapter: null },
  'html5-audio': { tag: 'audio', component: 'Audio', subpath: null, adapter: null },
  hls: { tag: 'hlsjs-video', component: 'HlsJsVideo', subpath: 'hlsjs-video', adapter: '@videojs/hlsjs-video' },
  dash: { tag: 'dash-video', component: 'DashVideo', subpath: 'dash-video', adapter: '@videojs/dash-video' },
  'mux-video': { tag: 'mux-video', component: 'MuxVideo', subpath: 'mux-video', adapter: '@videojs/mux-video' },
  'mux-audio': { tag: 'mux-audio', component: 'MuxAudio', subpath: 'mux-audio', adapter: '@videojs/mux-audio' },
  vimeo: { tag: 'vimeo-video', component: 'VimeoVideo', subpath: 'vimeo-video', adapter: '@videojs/vimeo-video' },
  youtube: {
    tag: 'youtube-video',
    component: 'YouTubeVideo',
    subpath: 'youtube-video',
    adapter: '@videojs/youtube-video',
  },
  cloudflare: {
    tag: 'cloudflare-video',
    component: 'CloudflareVideo',
    subpath: 'cloudflare-video',
    adapter: '@videojs/cloudflare-video',
  },
  spotify: {
    tag: 'spotify-audio',
    component: 'SpotifyAudio',
    subpath: 'spotify-audio',
    adapter: '@videojs/spotify-audio',
  },
  tiktok: { tag: 'tiktok-video', component: 'TikTokVideo', subpath: 'tiktok-video', adapter: '@videojs/tiktok-video' },
  twitch: { tag: 'twitch-video', component: 'TwitchVideo', subpath: 'twitch-video', adapter: '@videojs/twitch-video' },
};

/** Mux media pair with the separate Mux Data extension by default, as the Video.js installation examples do. */
export const MUX_DATA_PACKAGE = '@videojs/mux-data';
export const MUX_DATA_SUBPATH = 'mux-data';

export function isMuxRenderer(renderer: Renderer): boolean {
  return renderer === 'mux-video' || renderer === 'mux-audio';
}

/** Whether the media element takes `playsinline`: embeds render an iframe and audio renders audio, so neither does. */
export function isVideoLikeRenderer(renderer: Renderer): boolean {
  return renderer === 'html5-video' || renderer === 'hls' || renderer === 'dash' || renderer === 'mux-video';
}
