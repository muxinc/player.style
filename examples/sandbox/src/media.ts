// The classic player.style demo assets, as the site uses them.
const LANDSCAPE = 'fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ';
const PORTRAIT = '1EFcsL5JET00t00mBv01t00xt00T4QeNQtsXx2cKY6DLd7RM';
const LIVE = 'v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM';

export type SourceId = 'mp4' | 'hls' | 'live';

export const SOURCES: { id: SourceId; label: string }[] = [
  { id: 'mp4', label: 'MP4 (native media)' },
  { id: 'hls', label: 'HLS (Mux)' },
  { id: 'live', label: 'Live stream (Mux)' },
];

export const TITLE = 'Landscape Promo';
export const BYLINE = 'by Mux';

export interface Media {
  src: string;
  poster: string;
  /** Mux media for HLS; the browser's own element for a file. */
  mux: boolean;
}

export function getMedia(source: SourceId, { audio = false, portrait = false } = {}): Media {
  if (source === 'live') {
    return {
      src: `https://stream.mux.com/${LIVE}.m3u8`,
      poster: `https://image.mux.com/${LIVE}/thumbnail.webp`,
      mux: true,
    };
  }

  const id = portrait && !audio ? PORTRAIT : LANDSCAPE;
  const poster = `https://image.mux.com/${id}/thumbnail.webp${id === LANDSCAPE ? '?time=52' : ''}`;

  if (source === 'hls') return { src: `https://stream.mux.com/${id}.m3u8`, poster, mux: true };

  // These assets predate Mux's `highest.mp4` rendition name; `high.mp4` is their top progressive rendition.
  return { src: `https://stream.mux.com/${id}/${audio ? 'audio.m4a' : 'high.mp4'}`, poster, mux: false };
}
