/*
 * The names the build, the registry, the fit check and the site share. Nothing here touches Node, so the site and the
 * fit check's browser pages import it as `build-skin/names`.
 */

/** The presets a skin can ship, in gallery order: the first one a skin has is its default use case. */
export const PRESETS = ['video', 'audio', 'live-video', 'live-audio'] as const;

export type Preset = (typeof PRESETS)[number];

export const FRAMEWORKS = ['react', 'html'] as const;

export type Framework = (typeof FRAMEWORKS)[number];

export const PRESET_LABELS: Record<Preset, string> = {
  video: 'Video',
  audio: 'Audio',
  'live-video': 'Live Video',
  'live-audio': 'Live Audio',
};

/** The comment a `skin.html` marks the media's place with, exactly as `skin create` writes it. */
export const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

/** The names Video.js gives a preset's modules: `live-video` is `LiveVideoSkin` inside `<live-video-player>`. */
export function presetModule(preset: Preset) {
  const pascal = preset.replace(/(^|-)([a-z])/g, (_match, _dash, letter: string) => letter.toUpperCase());

  return {
    skinComponent: `${pascal}Skin`,
    playerComponent: `${pascal}Player`,
    playerTag: `${preset}-player`,
    media: preset.endsWith('audio') ? ('audio' as const) : ('video' as const),
  };
}

/** `skins/<name>/catalog.json`: what the gallery and the registry say about a skin. */
export interface SkinCatalog {
  title: string;
  description: string;
  author: { name: string; url?: string; github?: string };
  /** The Media Chrome theme the skin recreates; the site redirects `/themes/<theme>` to the skin. */
  legacyTheme?: string;
  /** How the gallery previews the skin, when it differs from the defaults. */
  preview?: {
    /**
     * The skin draws at a fixed size and centres itself, so the preview gives it no 16:9 box and lets it keep its own
     * height (a video skin otherwise fills an `aspect-video` box; an audio skin always sizes to its content).
     */
    fixedSize?: boolean;
    /** The skin shows the media's title and a byline, so the preview passes the demo ones. */
    metadata?: boolean;
    /** The skin is mobile-first, so it plays the portrait demo asset. */
    portrait?: boolean;
  };
}

/** `<name>/<framework>/<preset>`: the key of one built preset module, `skins/<name>/<framework>/dist/<preset>.js`. */
export function skinBuildKey(name: string, framework: Framework, preset: Preset): string {
  return `${name}/${framework}/${preset}`;
}

/** The skin, framework and preset of a path ending `skins/<name>/<framework>/dist/<preset>.js`, if it is one. */
export function parseSkinBuildPath(path: string): { name: string; framework: Framework; preset: Preset } | undefined {
  const [, name, framework, preset] = /skins\/([^/]+)\/(react|html)\/dist\/([^/]+)\.js$/.exec(path) ?? [];
  if (!name || !(PRESETS as readonly string[]).includes(preset!)) return undefined;

  return { name, framework: framework as Framework, preset: preset as Preset };
}
