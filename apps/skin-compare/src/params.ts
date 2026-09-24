/** Query parameters every pane understands, with the defaults the capture script relies on. */
export interface PaneParams {
  skin: string;
  src: string;
  poster: string;
  width: number;
  /** Hex without `#`, applied as `--media-accent-color` on the skin. */
  accent: string | null;
}

/* A generated WebM/VP8 test pattern (see scripts/make-media.mjs): headless Chromium cannot decode H.264. */
export const DEFAULT_SRC = '/media/sample.webm';
export const DEFAULT_POSTER = '/media/poster.png';

export function getParams(): PaneParams {
  const query = new URLSearchParams(location.search);
  const width = Number(query.get('w'));

  return {
    skin: query.get('skin') ?? 'microvideo',
    src: query.get('src') ?? DEFAULT_SRC,
    poster: query.get('poster') ?? DEFAULT_POSTER,
    width: Number.isFinite(width) && width > 0 ? width : 640,
    accent: query.get('accent'),
  };
}

export function accentStyle(params: PaneParams): string {
  return params.accent ? `--media-accent-color: #${params.accent}` : '';
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
