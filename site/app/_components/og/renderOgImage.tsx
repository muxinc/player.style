import { readFile } from 'node:fs/promises';

import { ImageResponse } from 'next/og';

import { VIDEOJS_MONO_PATH } from '../logos/VideojsMonoLogo';

/*
 * The Video.js 10 OG design: the stencil wordmark over an uppercase Eurostile title on faded black, closed by the five
 * brand bars. Satori (behind `ImageResponse`) reads woff/ttf, not woff2, so the display font is the Mux-hosted woff.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = 'image/png';

const BG_COLOR = '#1e1d1d'; // faded-black
const TEXT_COLOR = '#f3e7d2'; // manila-light

const LOGO_WIDTH = 800;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH * (68 / 381));
const TITLE_GAP = 52;
const H_PADDING = 100;
const TOP_MARGIN = 30;
const COLOR_BAR_HEIGHT = 118;

const LARGE_FONT_SIZE = 48;
const SMALL_FONT_SIZE = 36;
const LARGE_SMALL_THRESHOLD = 25;

const COLOR_BARS = [
  { color: '#ffa81b', flex: 80 }, // gold
  { color: '#ff6200', flex: 60 }, // orange
  { color: '#eb3132', flex: 45 }, // red
  { color: '#cc3566', flex: 20 }, // magenta
  { color: '#922e4f', flex: 10 }, // magenta-dark
] as const;

const FONT_URL = 'https://static.mux.com/fonts/EurostileLTProBoldExtended2/font.woff';
const FONT_FAMILY = 'Eurostile LT Pro Bold Extended 2';

/** Bold system faces to fall back to when the build cannot reach static.mux.com; the first that exists wins. */
const SYSTEM_FONT_FALLBACKS = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
  'C:\\Windows\\Fonts\\arialbd.ttf',
];

type FontData = { data: ArrayBuffer; fallback: boolean };

let fontPromise: Promise<FontData> | null = null;

async function fetchDisplayFont(): Promise<ArrayBuffer> {
  const response = await fetch(FONT_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.arrayBuffer();
}

async function readSystemFont(): Promise<ArrayBuffer> {
  for (const path of SYSTEM_FONT_FALLBACKS) {
    try {
      const buffer = await readFile(/* turbopackIgnore: true */ path);

      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error('No system font found for the OG image');
}

function loadFont(): Promise<FontData> {
  fontPromise ??= fetchDisplayFont()
    .then((data) => ({ data, fallback: false }))
    .catch(async (error: unknown) => {
      console.warn(
        `OG image: could not load ${FONT_URL} (${error instanceof Error ? error.message : String(error)}); falling back to a system font.`
      );

      return { data: await readSystemFont(), fallback: true };
    })
    .catch((error: unknown) => {
      fontPromise = null;
      throw error;
    });

  return fontPromise;
}

function ColorBars() {
  return (
    <div style={{ height: COLOR_BAR_HEIGHT, display: 'flex', flexDirection: 'column', width: '100%' }}>
      {COLOR_BARS.map(({ color, flex }) => (
        <div key={color} style={{ flex, backgroundColor: color }} />
      ))}
    </div>
  );
}

/** Render the shared OG card with an optional title line under the wordmark. */
export async function renderOgImage(title?: string): Promise<ImageResponse> {
  const font = await loadFont();
  const displayTitle = title?.toUpperCase();
  const fontSize = displayTitle && displayTitle.length > LARGE_SMALL_THRESHOLD ? SMALL_FONT_SIZE : LARGE_FONT_SIZE;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: BG_COLOR }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: TOP_MARGIN,
          paddingLeft: H_PADDING,
          paddingRight: H_PADDING,
        }}
      >
        <svg viewBox="0 0 381 68" width={LOGO_WIDTH} height={LOGO_HEIGHT} xmlns="http://www.w3.org/2000/svg">
          <path d={VIDEOJS_MONO_PATH} fill={TEXT_COLOR} />
        </svg>
        {displayTitle && (
          <div
            style={{
              marginTop: TITLE_GAP,
              fontFamily: FONT_FAMILY,
              fontSize,
              fontWeight: 700,
              letterSpacing: font.fallback ? '0' : '-0.03em',
              lineHeight: 1.2,
              color: TEXT_COLOR,
              textAlign: 'center',
            }}
          >
            {displayTitle}
          </div>
        )}
      </div>
      <ColorBars />
    </div>,
    {
      ...OG_SIZE,
      fonts: [{ name: FONT_FAMILY, data: font.data, weight: 700, style: 'normal' }],
    }
  );
}
