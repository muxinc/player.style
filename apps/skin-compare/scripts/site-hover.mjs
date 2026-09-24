/*
 * The site is the skins' real host: the React edition in light DOM, under Tailwind's preflight and a Lightning CSS
 * pipeline. Visit each third-party skin page, hover the controls, the volume and the time slider, measure the parts,
 * and save a 2x crop of the control bar per state.
 *
 *   node scripts/site-hover.mjs [<base-url>] [<skin…>] [--out <dir>]
 *
 * The base defaults to the branch's Vercel preview. Writes `<out>/<page>-<state>.png` and `<out>/report.json`, and
 * prints per page the thumb's offset from its track's centre line and whether the storyboard thumbnail showed.
 *
 * Headless Chromium plays no H.264, so the demo's progressive MP4 is answered with the harness's WebM pattern (ten
 * seconds): the media reaches metadata and the preview shows real times and the demo's own storyboard tiles. HLS
 * pages (audio, live) keep their stream and stay without metadata.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { launchBrowser } from './browser.mjs';
import { collect } from './collect.mjs';
import { APP_DIR, REPO_DIR, SCRATCH, sleep } from './panes.mjs';

const PREVIEW = 'https://player-style-git-claude-hopeful-davinci-y72ako-mux.vercel.app';
/* Each page, the package whose template names its parts, and the root class the page renders. */
const PAGES = [
  ...[
    'yt',
    'sutro',
    'essentials',
    'notflix',
    'vimeonova',
    'instaplay',
    'microvideo',
    'reelplay',
    'demuxed-2022',
    'halloween',
    'x-mas',
    'winamp',
    'sutro-audio',
    'tailwind-audio',
  ].map((slug) => ({ id: slug, path: `/skins/${slug}`, pkg: slug })),
  ...['essentials', 'microvideo', 'demuxed-2022', 'x-mas'].map((slug) => ({
    id: `${slug}-live`,
    path: `/skins/${slug}?use-case=live-video`,
    pkg: `${slug}-live`,
  })),
];

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { out: { type: 'string', default: join(SCRATCH, 'qa-hover') } },
});
const base = positionals[0]?.startsWith('http') ? positionals.shift() : PREVIEW;
const wanted = new Set(positionals);
const pages = wanted.size ? PAGES.filter((page) => wanted.has(page.id)) : PAGES;

mkdirSync(values.out, { recursive: true });

const classSelector = (list) => `.${list.trim().split(/\s+/).join('.')}`;
const classOf = (markup, tag) => markup.match(new RegExp(`<${tag}\\b[^>]*\\bclass="([^"]+)"`))?.[1];

/**
 * The class selectors of the parts `collect` looks for, read from the package's template (the React edition renders
 * the same classes). One map per time slider, since a skin may swap two by width.
 */
function partMaps(pkg) {
  const template = readFileSync(join(REPO_DIR, 'skins', pkg, 'src/html/template.html'), 'utf8');
  const sliders = (tag) => [
    ...template.matchAll(new RegExp(`<${tag}\\b[^>]*\\bclass="([^"]+)"[^>]*>([\\s\\S]*?)</${tag}>`, 'g')),
  ];
  const parts = (prefix, match) =>
    Object.fromEntries(
      ['track', 'fill', 'thumb', 'preview', 'thumbnail'].map((part) => {
        const found = classOf(match?.[2] ?? '', `media-slider-${part}`);

        return [`${prefix}${part}`, found ? classSelector(found) : null];
      })
    );
  const volume = sliders('media-volume-slider')[0];
  const shared = {
    volumeRoot: volume ? classSelector(volume[1]) : null,
    ...parts('volume.', volume),
    mute: classOf(template, 'media-mute-button') && classSelector(classOf(template, 'media-mute-button')),
    captions: classOf(template, 'media-captions-button') && classSelector(classOf(template, 'media-captions-button')),
    live: classOf(template, 'media-live-button') && classSelector(classOf(template, 'media-live-button')),
    tooltip: classOf(template, 'media-tooltip') && classSelector(classOf(template, 'media-tooltip')),
  };
  const times = sliders('media-time-slider');
  if (!times.length) return [{ ...shared, timeRoot: null }];

  return times.map((match) => ({ ...shared, timeRoot: classSelector(match[1]), ...parts('time.', match) }));
}

const browser = await launchBrowser();
const report = {};

for (const entry of pages) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const problems = [];
  const root = `.ps-${entry.pkg.replace(/-live$/, '')}`;
  const maps = partMaps(entry.pkg);

  page.on('pageerror', (error) => problems.push(String(error)));
  await page.route(/\.mp4(?:\?|$)/, (route) =>
    route.fulfill({
      contentType: 'video/webm',
      // The page requests it with `crossorigin`.
      headers: { 'access-control-allow-origin': '*' },
      body: readFileSync(join(APP_DIR, 'public/media/sample.webm')),
    })
  );
  await page
    .goto(new URL(entry.path, base).href, { waitUntil: 'networkidle' })
    .catch((error) => problems.push(String(error)));
  await page.waitForSelector(root, { timeout: 20_000 }).catch(() => problems.push(`no ${root} on the page`));
  await page.evaluate((selector) => document.querySelector(selector)?.scrollIntoView({ block: 'center' }), root);
  // The preview's time and thumbnail need the duration, so wait for metadata (the page may preload none).
  await page
    .waitForFunction(
      (selector) => document.querySelector(selector)?.querySelector('video, audio')?.readyState >= 1,
      root,
      {
        timeout: 20_000,
      }
    )
    .catch(() => problems.push('media metadata never loaded'));
  await sleep(1200);

  /** Measure with every candidate map and keep the one whose time slider (if any) is laid out. */
  const measure = async () => {
    const results = [];

    for (const map of maps)
      results.push(await page.evaluate(collect, { pane: 'react', map, stage: root }).catch(() => null));
    return results.find((result) => result?.time?.root?.w) ?? results.find(Boolean);
  };
  const playerBox = async () => page.locator(root).first().boundingBox();
  const pointAt = async (b, xRatio = 0.5) => {
    const player = await playerBox();

    await page.mouse.move(player.x + b.x + b.w * xRatio, player.y + b.y + b.h / 2, { steps: 4 });
  };
  /** The control bar and anything that pops above it, full player width, at 2x. */
  const crop = async (state, result) => {
    const player = await playerBox();
    const tops = [result?.time?.root, result?.time?.preview, result?.volume?.root, result?.mute, result?.tooltip]
      .filter((b) => b?.visible || b?.w)
      .map((b) => b.y);
    const top = Math.max(0, Math.min(player.height * 0.6, ...tops) - 24);

    await page.screenshot({
      path: join(values.out, `${entry.id}-${state}.png`),
      clip: { x: player.x, y: player.y + top, width: player.width, height: Math.min(player.height - top, 320) },
    });
  };
  const summary = (result) => {
    const align = (prefix) => {
      const track = result?.[prefix]?.track;
      const thumb = result?.[prefix]?.thumb;
      if (!track?.h || !thumb?.visible) return null;

      return Math.round((thumb.cy - track.cy) * 100) / 100;
    };

    return {
      timeThumbToTrackY: align('time'),
      volumeThumbToTrackY: align('volume'),
      thumbnail: result?.time?.thumbnail ?? null,
      preview: result?.time?.preview ?? null,
    };
  };
  const states = {};
  const player = await playerBox();

  if (player) {
    await page.mouse.move(player.x + player.width / 2, player.y + player.height / 2, { steps: 3 });
    await sleep(600);

    const hover = await measure();

    states.hover = summary(hover);
    await crop('hover', hover);

    if (hover?.mute?.w) {
      await pointAt(hover.mute);
      await sleep(600);

      const muteHover = await measure();

      if (muteHover?.volume?.root?.w > 4) {
        await pointAt(muteHover.volume.root);
        await sleep(500);
      }

      const volume = await measure();

      states.volume = summary(volume);
      await crop('volume', volume);
    }

    if (hover?.time?.root?.w) {
      await pointAt(hover.time.root);
      // The storyboard loads on first use and the preview fades in after a delay.
      await sleep(1800);

      const scrub = await measure();

      states.scrub = summary(scrub);
      await crop('scrub', scrub);
    }
  }

  report[entry.id] = { path: entry.path, states, problems };
  console.log(
    `${entry.id}: ${Object.entries(states)
      .map(
        ([state, s]) =>
          `${state} thumb-track ${s.timeThumbToTrackY ?? '-'} / vol ${s.volumeThumbToTrackY ?? '-'}${state === 'scrub' ? `, thumbnail ${s.thumbnail?.visible ? `${s.thumbnail.w}×${s.thumbnail.h}` : 'hidden'}` : ''}`
      )
      .join('; ')}${problems.length ? `\n  ${problems.join('\n  ')}` : ''}`
  );
  await context.close();
}

writeFileSync(join(values.out, 'report.json'), JSON.stringify({ base, report }, null, 2));
await browser.close();
console.log(`Crops and report: ${values.out}`);
