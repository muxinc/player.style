/*
 * Generate the harness media: a 10-second WebM/VP8 test pattern and a matching poster, into public/media/.
 *
 * Headless Chromium has no H.264 decoder, so the panes need WebM to reach a playing state, and a synthetic pattern
 * keeps the composite screenshots small and reproducible. Frames are drawn on a canvas in Chromium and encoded with
 * the ffmpeg that ships beside the Playwright browsers (it has libvpx, but no lavfi, so frames come from a browser).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { launchBrowser, BROWSERS_PATH } from './browser.mjs';

const OUT_DIR = join(import.meta.dirname, '../public/media');
const WIDTH = 640;
const HEIGHT = 360;
const FPS = 12;
const SECONDS = 10;

function findFfmpeg() {
  const fromEnv = process.env.FFMPEG_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const dir = readdirSync(BROWSERS_PATH).find((entry) => entry.startsWith('ffmpeg-'));
  const candidate = dir ? join(BROWSERS_PATH, dir, 'ffmpeg-linux') : null;
  if (!candidate || !existsSync(candidate)) throw new Error('No ffmpeg found; set FFMPEG_PATH.');

  return candidate;
}

const FRAME_PAGE = `<!doctype html><body style="margin:0;background:#000">
<canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  window.draw = (t, poster) => {
    ctx.fillStyle = poster ? '#1d3557' : '#264653';
    ctx.fillRect(0, 0, ${WIDTH}, ${HEIGHT});
    const bands = ['#e9c46a', '#f4a261', '#e76f51', '#2a9d8f'];
    bands.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(i * ${WIDTH / 4}, 0, ${WIDTH / 4}, 60); });
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(poster ? 'POSTER' : t.toFixed(1) + 's', ${WIDTH / 2}, ${HEIGHT / 2 + 26});
    if (!poster) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, ${HEIGHT - 40}, (${WIDTH} * t) / ${SECONDS}, 12);
      ctx.beginPath();
      ctx.arc(${WIDTH / 2} + Math.cos(t * 2) * 200, ${HEIGHT / 2} + Math.sin(t * 2) * 100, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#e63946';
      ctx.fill();
    }
  };
</script></body>`;

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

await page.setContent(FRAME_PAGE);
mkdirSync(OUT_DIR, { recursive: true });

await page.evaluate(() => window.draw(0, true));
writeFileSync(join(OUT_DIR, 'poster.png'), await page.screenshot({ type: 'png' }));

const ffmpeg = spawn(findFfmpeg(), [
  '-hide_banner',
  '-loglevel',
  'error',
  '-f',
  'image2pipe',
  '-c:v',
  'mjpeg',
  '-framerate',
  String(FPS),
  '-i',
  'pipe:0',
  '-c:v',
  'libvpx',
  '-b:v',
  '500k',
  '-pix_fmt',
  'yuv420p',
  '-y',
  join(OUT_DIR, 'sample.webm'),
]);

ffmpeg.stderr.pipe(process.stderr);

const done = new Promise((resolve, reject) => {
  ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
});

for (let i = 0; i < FPS * SECONDS; i++) {
  await page.evaluate((t) => window.draw(t, false), i / FPS);

  const frame = await page.screenshot({ type: 'jpeg', quality: 85 });

  if (!ffmpeg.stdin.write(frame)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
}

ffmpeg.stdin.end();
await done;
await browser.close();

console.log(`Wrote ${OUT_DIR}/sample.webm and poster.png`);
