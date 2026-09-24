/*
 * Generate the harness media into public/media/:
 *
 *   node scripts/make-media.mjs              sample.webm + poster.png (640×360, the default)
 *   node scripts/make-media.mjs --portrait   pattern-portrait.webm + poster-portrait.png (360×640, for `aspect: '9 / 16'`)
 *   node scripts/make-media.mjs --audio      tone.webm (10 s of Opus, for `kind: 'audio'`)
 *   node scripts/make-media.mjs --all        all three
 *
 * Headless Chromium has no H.264 decoder, so the panes need WebM to reach a playing state, and a synthetic pattern
 * keeps the composite screenshots small and reproducible. Frames are drawn on a canvas in Chromium and encoded with
 * the ffmpeg that ships beside the Playwright browsers (it has libvpx, but no lavfi and no audio encoder, so frames
 * come from a browser). The tone is recorded by Chromium's MediaRecorder and remuxed by that ffmpeg (`-c copy`) so the
 * file carries a duration.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { launchBrowser, BROWSERS_PATH } from './browser.mjs';

const OUT_DIR = join(import.meta.dirname, '../public/media');
const FPS = 12;
const SECONDS = 10;

const { values } = parseArgs({
  options: {
    portrait: { type: 'boolean', default: false },
    audio: { type: 'boolean', default: false },
    all: { type: 'boolean', default: false },
  },
});
const wantLandscape = values.all || (!values.portrait && !values.audio);
const wantPortrait = values.all || values.portrait;
const wantAudio = values.all || values.audio;

function findFfmpeg() {
  const fromEnv = process.env.FFMPEG_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const dir = readdirSync(BROWSERS_PATH).find((entry) => entry.startsWith('ffmpeg-'));
  const candidate = dir ? join(BROWSERS_PATH, dir, 'ffmpeg-linux') : null;
  if (!candidate || !existsSync(candidate)) throw new Error('No ffmpeg found; set FFMPEG_PATH.');

  return candidate;
}

function runFfmpeg(args) {
  const ffmpeg = spawn(findFfmpeg(), ['-hide_banner', '-loglevel', 'error', ...args, '-y']);
  const done = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });

  ffmpeg.stderr.pipe(process.stderr);
  return { ffmpeg, done };
}

/** A canvas page whose `draw(t, poster)` paints one frame of the pattern at the given size. */
function framePage(width, height) {
  const scale = Math.min(width, height) / 360;
  // The label scales with the width so it clears the centre of a portrait frame, where skins put a play button.
  const text = Math.round((72 * width) / 640);

  return `<!doctype html><body style="margin:0;background:#000">
<canvas id="c" width="${width}" height="${height}"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  window.draw = (t, poster) => {
    ctx.fillStyle = poster ? '#1d3557' : '#264653';
    ctx.fillRect(0, 0, ${width}, ${height});
    const bands = ['#e9c46a', '#f4a261', '#e76f51', '#2a9d8f'];
    bands.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(i * ${width / 4}, 0, ${width / 4}, ${60 * scale}); });
    ctx.fillStyle = '#fff';
    ctx.font = 'bold ${text}px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(poster ? 'POSTER' : t.toFixed(1) + 's', ${width / 2}, ${height / 2 + text * 0.36});
    if (!poster) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, ${height - 40 * scale}, (${width} * t) / ${SECONDS}, ${12 * scale});
      ctx.beginPath();
      ctx.arc(${width / 2} + Math.cos(t * 2) * ${width / 2 - 40 * scale}, ${height / 2} + Math.sin(t * 2) * ${height / 2 - 80 * scale}, ${18 * scale}, 0, Math.PI * 2);
      ctx.fillStyle = '#e63946';
      ctx.fill();
    }
  };
</script></body>`;
}

async function makePattern(browser, { width, height, video, poster }) {
  const page = await browser.newPage({ viewport: { width, height } });

  await page.setContent(framePage(width, height));
  await page.evaluate(() => window.draw(0, true));
  writeFileSync(join(OUT_DIR, poster), await page.screenshot({ type: 'png' }));

  const { ffmpeg, done } = runFfmpeg([
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
    join(OUT_DIR, video),
  ]);

  for (let i = 0; i < FPS * SECONDS; i++) {
    await page.evaluate((t) => window.draw(t, false), i / FPS);

    const frame = await page.screenshot({ type: 'jpeg', quality: 85 });

    if (!ffmpeg.stdin.write(frame)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
  }

  ffmpeg.stdin.end();
  await done;
  await page.close();
  console.log(`Wrote ${OUT_DIR}/${video} and ${poster}`);
}

/** Ten seconds of a quiet 440 Hz tone that steps up a semitone each second, recorded as WebM/Opus in real time. */
async function makeTone(browser) {
  const page = await browser.newPage();

  await page.setContent('<!doctype html><body></body>');

  const base64 = await page.evaluate(async (seconds) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    gain.gain.value = 0.2;
    oscillator.connect(gain).connect(destination);
    for (let i = 0; i < seconds; i++) oscillator.frequency.setValueAtTime(440 * 2 ** (i / 12), context.currentTime + i);

    const recorder = new MediaRecorder(destination.stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 32000,
    });
    const chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);

    const stopped = new Promise((resolve) => (recorder.onstop = resolve));

    recorder.start();
    oscillator.start();
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    recorder.stop();
    oscillator.stop();
    await stopped;

    const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
    let binary = '';

    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }, SECONDS);

  const raw = join(OUT_DIR, 'tone.raw.webm');

  writeFileSync(raw, Buffer.from(base64, 'base64'));

  const { done } = runFfmpeg(['-i', raw, '-c', 'copy', join(OUT_DIR, 'tone.webm')]);

  await done;
  rmSync(raw);
  await page.close();
  console.log(`Wrote ${OUT_DIR}/tone.webm`);
}

const browser = await launchBrowser();

mkdirSync(OUT_DIR, { recursive: true });

if (wantLandscape) await makePattern(browser, { width: 640, height: 360, video: 'sample.webm', poster: 'poster.png' });
if (wantPortrait) {
  await makePattern(browser, {
    width: 360,
    height: 640,
    video: 'pattern-portrait.webm',
    poster: 'poster-portrait.png',
  });
}
if (wantAudio) await makeTone(browser);

await browser.close();
