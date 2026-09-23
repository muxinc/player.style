import type { DocsPreset, FirstPartySkin } from './skins';

export const FRAMEWORKS = [
  { id: 'react', label: 'React' },
  { id: 'html', label: 'HTML' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'shadcn', label: 'shadcn' },
  { id: 'cdn', label: 'CDN' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['id'];

export const DEFAULT_FRAMEWORK: Framework = 'react';

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

interface PresetInfo {
  /** Value of the docs `?preset=` param. */
  flag: string;
  /** Prefix of the HTML tag names (`video-skin`, `live-audio-player`). */
  tagPrefix: string;
  /** Prefix of the React component names (`VideoSkin`, `LiveAudioPlayer`). */
  componentPrefix: string;
  /** The media component the preset entry point exports. */
  mediaComponent: 'Video' | 'Audio';
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
    media: [{ id: 'mux-audio', label: 'Mux' }],
  },
};

const DEFAULT_PRESET: DocsPreset = 'default-video';

export function isFramework(value: string | null | undefined): value is Framework {
  return FRAMEWORKS.some((framework) => framework.id === value);
}

export function getMediaOptions(skin: FirstPartySkin): readonly MediaOption[] {
  return PRESETS[skin.docs.preset].media;
}

/** The media the picker falls back to: the preset's first option, matching the docs default. */
export function resolveMedia(skin: FirstPartySkin, value: string | null | undefined): Renderer {
  const options = getMediaOptions(skin);
  const match = options.find((option) => option.id === value);

  return (match ?? options[0]!).id;
}

/**
 * Build the docs installation URL for a skin. The query mirrors `serializeInstallationSearch` in the Video.js docs:
 * every param that still sits at its default is left out so an untouched skin links to a clean URL.
 */
export function buildInstallationUrl(skin: FirstPartySkin, framework: Framework, media: Renderer): string {
  const preset = PRESETS[skin.docs.preset];
  const params = new URLSearchParams();

  if (skin.docs.preset !== DEFAULT_PRESET) params.set('preset', preset.flag);
  if (skin.docs.skin !== 'default') params.set('skin', skin.docs.skin);
  if (media !== preset.media[0]!.id) params.set('media', media);
  // The shadcn guide takes its own `?framework=react|html`; React matches the usage we show for it.
  if (framework === 'shadcn') params.set('framework', 'react');

  const query = params.toString();

  return `https://videojs.org/docs/guides/installation/${framework}${query ? `?${query}` : ''}`;
}

export interface UsageNames {
  html: { player: string; skin: string };
  react: { player: string; skin: string; media: string; entry: string };
}

/** Tag and component names for a skin, following the Video.js naming rules for presets and tiers. */
export function getUsageNames(skin: FirstPartySkin): UsageNames {
  const preset = PRESETS[skin.docs.preset];
  const minimal = skin.docs.skin === 'minimal';

  return {
    html: {
      player: `${preset.tagPrefix}-player`,
      skin: minimal ? `${preset.tagPrefix}-minimal-skin` : `${preset.tagPrefix}-skin`,
    },
    react: {
      player: `${preset.componentPrefix}Player`,
      skin: `${minimal ? 'Minimal' : ''}${preset.componentPrefix}Skin`,
      media: preset.mediaComponent,
      entry: `@videojs/react/${preset.flag}`,
    },
  };
}

export interface UsageSnippet {
  label: string;
  code: string;
}

/**
 * The one-line usage for a framework, or `undefined` when an import line would mislead: the shadcn guide copies the
 * skin's source into the project and the CDN guide loads it with script tags.
 */
export function getUsageSnippet(skin: FirstPartySkin, framework: Framework): UsageSnippet | undefined {
  const names = getUsageNames(skin);

  switch (framework) {
    case 'shadcn':
    case 'cdn':
      return undefined;
    case 'react':
      return {
        label: 'React',
        code: `import { ${names.react.player}, ${names.react.skin}, ${names.react.media} } from '${names.react.entry}'`,
      };
    default:
      return {
        label: 'HTML',
        code: `<${names.html.player}><${names.html.skin}>…</${names.html.skin}></${names.html.player}>`,
      };
  }
}
