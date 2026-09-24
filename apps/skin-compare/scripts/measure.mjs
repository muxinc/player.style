/*
 * Measure every pane of a skin through the interaction states and report where a port's geometry departs from the
 * Media Chrome original, in px, instead of comparing composites by eye.
 *
 *   node scripts/measure.mjs <skin…> | --all  [--widths 360,720,1080] [--out <dir>] [--threshold 2] [--shots]
 *
 * Per skin, pane, width and state it records the boxes (relative to #stage) of the time slider root, track, fill,
 * thumb, preview popup and preview thumbnail; the volume slider root, track, fill and thumb; the mute, captions and
 * live buttons; any open tooltip; the keyboard-focused element and whether it draws a focus ring. It writes
 * `<out>/<skin>.json` with everything and `<out>/summary.md` with the deltas (port minus original, and React minus
 * HTML) over the threshold at 720px, plus the storyboard thumbnail check. `--shots` also saves a 2x screenshot of every 720px state.
 *
 * The original is found by media-chrome's tags and shadow parts, the HTML port by Video.js 10's tags, and the React
 * port by the classes the HTML port carries on the same parts (the two editions share one class vocabulary).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { launchBrowser } from './browser.mjs';
import { collect } from './collect.mjs';
import { assertMedia, openPane, PANES, paneUrl, SCRATCH, sleep, startHarness } from './panes.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: 'boolean', default: false },
    widths: { type: 'string', default: '360,720,1080' },
    out: { type: 'string', default: join(SCRATCH, 'measure') },
    threshold: { type: 'string', default: '2' },
    shots: { type: 'boolean', default: false },
    base: { type: 'string' },
  },
});

const WIDTHS = values.widths.split(',').map(Number);
const THRESHOLD = Number(values.threshold);
const FLAG_WIDTH = 720;
const VOD_STATES = [
  'idle',
  'hover',
  'mute-hover',
  'volume-hover',
  'scrub-hover',
  'scrub-drag',
  'slider-focus',
  'captions',
];
const LIVE_STATES = ['idle', 'hover', 'mute-hover', 'volume-hover', 'live-hover', 'live-focus', 'captions'];

assertMedia();
mkdirSync(values.out, { recursive: true });

const harness = await startHarness(values.base);
const skins = values.all ? Object.keys(harness.SKINS) : positionals;
if (!skins.length) throw new Error('Usage: measure <skin…> | --all');

const browser = await launchBrowser();

/* ------------------------------------------------------------------------------------------------------------------ */
/* Driving the states.                                                                                                 */
/* ------------------------------------------------------------------------------------------------------------------ */

/** The page-coordinates box of a part, from a collected (stage-relative) box. */
async function toPage(page, b) {
  const stage = await page.locator('#stage').boundingBox();

  return { x: stage.x + b.x, y: stage.y + b.y, w: b.w, h: b.h };
}

async function focusBy(page, predicate, map) {
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.getSelection()?.removeAllRanges();
  });
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    await sleep(60);

    const state = await page.evaluate(collect, map);

    if (state.focus && predicate(state.focus)) return true;
  }
  return false;
}

async function measurePane(skin, pane, width, ratio, live, map) {
  const url = paneUrl(harness.base, pane, skin, width);
  const { page, errors } = await openPane(browser, url, {
    width,
    ratio,
    deviceScaleFactor: values.shots && width === FLAG_WIDTH ? 2 : 1,
  });
  const results = {};
  const args = { pane, map };
  const measure = async (state) => {
    results[state] = await page.evaluate(collect, args);
    if (values.shots && width === FLAG_WIDTH) {
      const dir = join(values.out, 'shots', skin);

      mkdirSync(dir, { recursive: true });
      await page.locator('#stage').screenshot({ path: join(dir, `${pane}-${state}.png`) });
    }
    return results[state];
  };
  const stage = await page.locator('#stage').boundingBox();
  const mid = { x: stage.x + stage.width / 2, y: stage.y + stage.height / 2 };

  await page.mouse.move(1, 1);
  await sleep(300);

  const idle = await measure('idle');

  await page.mouse.move(mid.x, mid.y, { steps: 3 });
  await sleep(500);

  const hover = await measure('hover');

  if (hover.mute?.w) {
    const b = await toPage(page, hover.mute);

    await page.mouse.move(b.x + b.w / 2, b.y + b.h / 2, { steps: 4 });
    await sleep(600);

    const muteHover = await measure('mute-hover');

    if (muteHover.volume?.root?.w > 4) {
      const v = await toPage(page, muteHover.volume.root);

      await page.mouse.move(v.x + v.w / 2, v.y + v.h / 2, { steps: 4 });
      await sleep(500);
      await measure('volume-hover');
    }
  }

  if (!live && (idle.time?.root?.w || hover.time?.root?.w)) {
    await page.mouse.move(mid.x, mid.y, { steps: 2 });
    await sleep(300);

    const current = await page.evaluate(collect, args);
    const t = await toPage(page, current.time.root);

    await page.mouse.move(t.x + t.w / 2, t.y + t.h / 2, { steps: 4 });
    // The preview fades in after a delay and the storyboard image loads on first use.
    await sleep(1200);
    await measure('scrub-hover');

    // Video.js 10 starts a drag past a few pixels of travel (a shorter press seeks on release), so move well past it.
    await page.mouse.down();
    await page.mouse.move(t.x + t.w / 2 + 20, t.y + t.h / 2, { steps: 5 });
    await sleep(400);
    await measure('scrub-drag');
    await page.mouse.up();
    await sleep(300);

    await page.mouse.move(mid.x, mid.y, { steps: 2 });
    if (await focusBy(page, (focus) => focus.inTime, args)) {
      await sleep(400);
      await measure('slider-focus');
    }
  }

  if (live && hover.live?.w) {
    const b = await toPage(page, hover.live);

    await page.mouse.move(b.x + b.w / 2, b.y + b.h / 2, { steps: 4 });
    await sleep(600);
    await measure('live-hover');

    await page.mouse.move(mid.x, mid.y, { steps: 2 });
    if (await focusBy(page, (focus) => focus.inLive, args)) {
      await sleep(400);
      await measure('live-focus');
    }
  }

  await page.keyboard.press('Escape');
  await page.mouse.move(mid.x, mid.y, { steps: 2 });
  await sleep(300);

  const beforeCaptions = await page.evaluate(collect, args);

  if (beforeCaptions.captions?.visible) {
    const b = await toPage(page, beforeCaptions.captions);

    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
    await sleep(800);
    await measure('captions');
  }

  await page.close();
  return { results, errors, classMap: results.idle?.classMap ?? null };
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Deltas.                                                                                                             */
/* ------------------------------------------------------------------------------------------------------------------ */

const ELEMENTS = [
  'time.root',
  'time.track',
  'time.fill',
  'time.thumb',
  'time.preview',
  'time.thumbnail',
  'volume.root',
  'volume.track',
  'volume.fill',
  'volume.thumb',
  'mute',
  'captions',
  'live',
  'tooltip',
];

const get = (state, path) => path.split('.').reduce((node, key) => node?.[key], state);

/** Where the thumb sits against its track and fill: centre-to-centre vertically, and against the fill's end. */
function alignment(state, prefix) {
  const track = get(state, `${prefix}.track`);
  const thumb = get(state, `${prefix}.thumb`);
  const fill = get(state, `${prefix}.fill`);
  if (!track?.h || !thumb?.visible) return null;

  return {
    thumbToTrackY: Math.round((thumb.cy - track.cy) * 100) / 100,
    thumbToFillX: fill ? Math.round((thumb.cx - (fill.x + fill.w)) * 100) / 100 : null,
  };
}

function compare(original, port) {
  const rows = [];

  for (const path of ELEMENTS) {
    const o = get(original, path);
    const p = get(port, path);
    if (!o && !p) continue;

    if (!o || !p) {
      rows.push({ path, kind: 'presence', original: Boolean(o), port: Boolean(p) });
      continue;
    }
    if (o.visible !== p.visible) rows.push({ path, kind: 'visibility', original: o.visible, port: p.visible });
    if (!o.visible || !p.visible) continue;

    rows.push({
      path,
      kind: 'box',
      dx: round(p.x - o.x),
      dy: round(p.y - o.y),
      dw: round(p.w - o.w),
      dh: round(p.h - o.h),
    });
  }
  for (const prefix of ['time', 'volume']) {
    const o = alignment(original, prefix);
    const p = alignment(port, prefix);
    if (!o || !p) continue;

    rows.push({
      path: `${prefix}.thumb-vs-track`,
      kind: 'alignment',
      dy: round(p.thumbToTrackY - o.thumbToTrackY),
      dx: o.thumbToFillX != null && p.thumbToFillX != null ? round(p.thumbToFillX - o.thumbToFillX) : 0,
      original: o,
      port: p,
    });
  }
  if (original.focus || port.focus) {
    const o = Boolean(original.focus?.ring);
    const p = Boolean(port.focus?.ring);
    // The browser's own `outline: auto` means the skin's ring rule missed the element that took focus.
    const uaDefault = (focus) => /auto/.test(focus?.ring?.outline ?? '');

    if (o !== p) rows.push({ path: 'focus.ring', kind: 'visibility', original: o, port: p });
    else if (uaDefault(port.focus) && !uaDefault(original.focus)) {
      rows.push({
        path: 'focus.ring',
        kind: 'ua-default',
        original: original.focus?.ring?.on ?? null,
        port: port.focus.ring.on,
      });
    }
  }
  if (original.captionsShowing !== port.captionsShowing) {
    rows.push({
      path: 'captions.showing',
      kind: 'visibility',
      original: original.captionsShowing,
      port: port.captionsShowing,
    });
  }
  return rows;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/* Slider roots are hit areas whose extent differs between the stacks by design; their parts carry the geometry. */
function flagged(row) {
  if (/\.root$/.test(row.path)) return false;
  if (row.kind !== 'box' && row.kind !== 'alignment') return true;

  return [row.dx, row.dy, row.dw, row.dh].some((d) => Math.abs(d ?? 0) > THRESHOLD);
}

/* ------------------------------------------------------------------------------------------------------------------ */

const summary = [`# Measured deltas (port minus original, px), flagged over ${THRESHOLD}px at ${FLAG_WIDTH}px`, ''];
const thumbnailRows = [];

for (const skin of skins) {
  const entry = harness.getSkin(skin);
  const live = entry.kind === 'live-video';
  const ratio = harness.parseAspect(entry.aspect ?? null) ?? 16 / 9;
  const report = { skin, kind: entry.kind ?? 'video', widths: {} };
  const states = live ? LIVE_STATES : VOD_STATES;

  for (const width of WIDTHS) {
    const panes = {};

    panes.original = await measurePane(skin, 'original', width, ratio, live, null);
    panes.html = await measurePane(skin, 'html', width, ratio, live, null);

    const map = { ...panes.html.classMap };

    // The React pane reads nested parts relative to their root, keyed `time.track` and so on.
    panes.react = await measurePane(skin, 'react', width, ratio, live, map);

    const deltas = {};

    for (const state of states) {
      const original = panes.original.results[state];

      for (const port of ['html', 'react']) {
        const measured = panes[port].results[state];

        if (!original && !measured) continue;
        if (!original || !measured) {
          (deltas[state] ??= {})[port] = [
            { path: 'state', kind: 'presence', original: Boolean(original), port: Boolean(measured) },
          ];
          continue;
        }
        (deltas[state] ??= {})[port] = compare(original, measured);
      }

      // The two editions share one stylesheet; any gap between them is the host pipeline or a template drift.
      const html = panes.html.results[state];
      const react = panes.react.results[state];

      if (html && react) (deltas[state] ??= {})['react-vs-html'] = compare(html, react);
    }
    report.widths[width] = {
      panes: Object.fromEntries(
        PANES.map((pane) => [pane, { errors: panes[pane].errors, states: panes[pane].results }])
      ),
      deltas,
    };

    if (width === FLAG_WIDTH && !live) {
      const scrub = Object.fromEntries(
        PANES.map((pane) => [pane, panes[pane].results['scrub-hover']?.time?.thumbnail ?? null])
      );

      thumbnailRows.push({ skin, ...scrub });
    }
  }

  writeFileSync(join(values.out, `${skin}.json`), JSON.stringify(report, null, 2));

  const lines = [];

  for (const width of WIDTHS) {
    for (const [state, byPort] of Object.entries(report.widths[width].deltas)) {
      for (const [port, rows] of Object.entries(byPort)) {
        for (const row of rows.filter(flagged)) {
          if (width !== FLAG_WIDTH && row.kind !== 'alignment') continue;

          const numbers =
            row.kind === 'box' || row.kind === 'alignment'
              ? `dx ${row.dx} dy ${row.dy}${row.kind === 'box' ? ` dw ${row.dw} dh ${row.dh}` : ` (orig ${JSON.stringify(row.original)} port ${JSON.stringify(row.port)})`}`
              : `original ${row.original} port ${row.port}`;

          lines.push(`| ${width} | ${state} | ${port} | ${row.path} | ${row.kind} | ${numbers} |`);
        }
      }
    }
  }

  summary.push(`## ${skin}`, '');
  if (lines.length)
    summary.push('| width | state | pane | element | kind | delta |', '|---|---|---|---|---|---|', ...lines);
  else summary.push('No deltas over the threshold.');

  const errors = WIDTHS.flatMap((width) =>
    PANES.flatMap((pane) => report.widths[width].panes[pane].errors.map((e) => `${pane}@${width}: ${e}`))
  );

  if (errors.length) summary.push('', 'Console errors:', ...errors.map((e) => `- ${e.slice(0, 300)}`));
  summary.push('');
  console.log(`${skin}: ${lines.length} flagged row(s)`);
}

const describe = (b) => (!b ? 'none' : b.visible ? `${b.w}×${b.h}` : `hidden (${b.w}×${b.h}, opacity ${b.opacity})`);

summary.push(
  '## Storyboard thumbnail on scrub-hover (720px)',
  '',
  '| skin | original | html | react |',
  '|---|---|---|---|'
);
for (const row of thumbnailRows)
  summary.push(`| ${row.skin} | ${describe(row.original)} | ${describe(row.html)} | ${describe(row.react)} |`);

writeFileSync(join(values.out, 'summary.md'), `${summary.join('\n')}\n`);
await browser.close();
await harness.close();
console.log(`Report: ${join(values.out, 'summary.md')}`);
