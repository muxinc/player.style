import { type CompareSkin, getSkin } from './skins';

/** Query parameters every pane understands, with the defaults the capture script relies on. */
/** The Video.js preset the ports sit in; `live-video` hosts the live editions. */
export type PaneKind = 'video' | 'audio' | 'live-video';

export interface PaneParams {
  skin: string;
  kind: PaneKind;
  /** CSS `aspect-ratio` for the player box, from `?aspect=` or the skin's entry; null lets the skin size itself. */
  aspect: string | null;
  src: string;
  poster: string;
  width: number;
  /** Hex without `#`, applied as `--media-accent-color` on the skin. */
  accent: string | null;
}

/* Generated WebM test media (see scripts/make-media.mjs): headless Chromium cannot decode H.264. */
export const DEFAULT_SRC = '/media/sample.webm';
export const DEFAULT_POSTER = '/media/poster.png';
export const PORTRAIT_SRC = '/media/pattern-portrait.webm';
export const PORTRAIT_POSTER = '/media/poster-portrait.png';
export const AUDIO_SRC = '/media/tone.webm';

/** `'9 / 16'` → 0.5625; null for anything that is not `<number> / <number>` or a bare number. */
export function parseAspect(aspect: string | null | undefined): number | null {
  const match = aspect?.match(/^\s*([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?$/);
  if (!match) return null;

  const ratio = Number(match[1]) / Number(match[2] ?? 1);

  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}

/* Live skins play the same test pattern as video ones: headless Chromium plays no H.264, so no HLS stream. */
function defaultMedia(kind: PaneKind, aspect: string | null): { src: string; poster: string } {
  if (kind === 'audio') return { src: AUDIO_SRC, poster: DEFAULT_POSTER };

  const portrait = (parseAspect(aspect) ?? 16 / 9) < 1;

  return portrait ? { src: PORTRAIT_SRC, poster: PORTRAIT_POSTER } : { src: DEFAULT_SRC, poster: DEFAULT_POSTER };
}

export function getParams(): PaneParams & { entry: CompareSkin } {
  const query = new URLSearchParams(location.search);
  const width = Number(query.get('w'));
  const skin = query.get('skin') ?? 'microvideo';
  const entry = getSkin(skin);
  const kind = entry.kind ?? 'video';
  const aspect = query.get('aspect') ?? entry.aspect ?? null;
  const media = defaultMedia(kind, aspect);

  return {
    skin,
    entry,
    kind,
    aspect,
    src: query.get('src') ?? media.src,
    poster: query.get('poster') ?? media.poster,
    width: Number.isFinite(width) && width > 0 ? width : 640,
    accent: query.get('accent'),
  };
}

/** Inline style for the skin element: the accent and the forced aspect ratio, when either is set. */
export function skinStyle(params: PaneParams): string {
  return [
    params.accent ? `--media-accent-color: #${params.accent}` : '',
    params.aspect ? `aspect-ratio: ${params.aspect}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function setStageWidth(params: PaneParams): HTMLElement {
  const stage = document.getElementById('stage');
  if (!stage) throw new Error('The pane has no #stage element.');

  stage.style.setProperty('--stage-width', `${params.width}px`);
  return stage;
}

/** Marks the pane as mounted so the capture script can start observing it. */
export function markReady(): void {
  document.body.dataset.ready = '';
}
