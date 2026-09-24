/*
 * The in-page half of measure.mjs and site-hover.mjs: `page.evaluate(collect, { pane, map, stage })` returns the boxes
 * of a skin's slider parts, buttons, tooltip and focus ring, relative to the `stage` element (the harness's #stage, or
 * the skin root on the site). Everything it uses lives inside the function, since Playwright serialises it.
 *
 * `pane` picks the selectors: `original` (media-chrome tags and shadow parts), `html` (Video.js 10 tags), or anything
 * else with `map`, the class selectors of the same parts (`timeRoot`, `time.track`, `volume.thumb`, `mute`, ...).
 */
export function collect({ pane, map, stage = '#stage' }) {
  const stageElement = document.querySelector(stage);
  const scope = stage === '#stage' ? document : stageElement;
  const stageRect = stageElement.getBoundingClientRect();

  function* walk(root) {
    for (const el of root.querySelectorAll('*')) {
      yield el;
      if (el.shadowRoot) yield* walk(el.shadowRoot);
    }
  }
  function* walkIn(el) {
    yield* walk(el);
    if (el.shadowRoot) yield* walk(el.shadowRoot);
  }
  const deepAll = (root, selector) =>
    [...(root === document ? walk(document) : walkIn(root))].filter((el) => el.matches(selector));
  const parentOf = (el) =>
    el.assignedSlot ?? el.parentElement ?? (el.parentNode instanceof ShadowRoot ? el.parentNode.host : null);
  const laidOut = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  };
  const opacity = (el) => {
    let value = 1;

    for (let node = el; node; node = parentOf(node)) value *= Number(getComputedStyle(node).opacity);
    return value;
  };
  /* The part of the element no ancestor clips away (a collapsed `overflow: hidden` box hides what it holds). */
  const clippedArea = (el) => {
    const rect = el.getBoundingClientRect();
    let [left, top, right, bottom] = [rect.left, rect.top, rect.right, rect.bottom];

    for (let node = parentOf(el); node; node = parentOf(node)) {
      const style = getComputedStyle(node);
      if (style.overflowX === 'visible' && style.overflowY === 'visible' && style.clipPath === 'none') continue;

      const clip = node.getBoundingClientRect();

      left = Math.max(left, clip.left);
      top = Math.max(top, clip.top);
      right = Math.min(right, clip.right);
      bottom = Math.min(bottom, clip.bottom);
    }
    return Math.max(0, right - left) * Math.max(0, bottom - top);
  };
  const box = (el) => {
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const round = (n) => Math.round(n * 100) / 100;
    const style = getComputedStyle(el);
    const alpha = opacity(el);
    const area = clippedArea(el);

    return {
      x: round(rect.x - stageRect.x),
      y: round(rect.y - stageRect.y),
      w: round(rect.width),
      h: round(rect.height),
      cx: round(rect.x - stageRect.x + rect.width / 2),
      cy: round(rect.y - stageRect.y + rect.height / 2),
      opacity: round(alpha),
      visible:
        rect.width > 0 &&
        rect.height > 0 &&
        area > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        alpha > 0.05,
    };
  };
  const union = (elements) => {
    const boxes = elements.map(box).filter((b) => b && b.w > 0 && b.h > 0);
    if (!boxes.length) return box(elements[0]);

    const x = Math.min(...boxes.map((b) => b.x));
    const y = Math.min(...boxes.map((b) => b.y));
    const w = Math.max(...boxes.map((b) => b.x + b.w)) - x;
    const h = Math.max(...boxes.map((b) => b.y + b.h)) - y;

    return { ...boxes[0], x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  };
  const first = (root, selector) => {
    const all = root ? deepAll(root, selector) : [];

    return all.find(laidOut) ?? all[0] ?? null;
  };
  const classSelector = (el) => (el?.classList.length ? `.${[...el.classList].join('.')}` : null);

  /* Where each part lives, per stack. React selectors come from the HTML pane's classes (`map`). */
  const parts =
    pane === 'original'
      ? {
          timeRoot: 'media-time-range',
          volumeRoot: 'media-volume-range',
          track: '[part~="track"]',
          fill: '[part~="progress"]',
          thumb: '[slot="thumb"], [part~="thumb"]',
          preview: '[part~="preview-box"]',
          thumbnail: 'media-preview-thumbnail',
          mute: 'media-mute-button',
          captions: 'media-captions-button',
          live: 'media-live-button',
          tooltip: 'media-tooltip',
        }
      : pane === 'html'
        ? {
            timeRoot: 'media-time-slider',
            volumeRoot: 'media-volume-slider',
            track: 'media-slider-track',
            fill: 'media-slider-fill',
            thumb: 'media-slider-thumb',
            preview: 'media-slider-preview',
            thumbnail: 'media-slider-thumbnail',
            mute: 'media-mute-button',
            captions: 'media-captions-button',
            live: 'media-live-button',
            tooltip: 'media-tooltip',
          }
        : map;

  const pick = (root, key) => (parts[key] ? first(root, parts[key]) : null);
  const slider = (rootKey, prefix) => {
    const root = parts[rootKey] ? first(scope, parts[rootKey]) : null;
    if (!root) return { elements: {}, boxes: null };

    // A slider may repeat its track per chapter; the visual track is their union.
    const tracks = parts[`${prefix}track`] ? deepAll(root, parts[`${prefix}track`]) : [];
    const thumbnails = parts[`${prefix}thumbnail`] ? deepAll(root, parts[`${prefix}thumbnail`]) : [];
    const thumbnail = thumbnails.sort((a, b) => {
      const area = (el) => el.getBoundingClientRect().width * el.getBoundingClientRect().height;

      return area(b) - area(a);
    })[0];
    const elements = {
      root,
      track: tracks.find(laidOut) ?? tracks[0] ?? null,
      fill: pick(root, `${prefix}fill`),
      thumb: pick(root, `${prefix}thumb`),
      // A slider may carry several previews (vimeonova's current-time chip); the pointer's holds the thumbnail.
      preview:
        (parts[`${prefix}preview`] ? deepAll(root, parts[`${prefix}preview`]) : []).find(
          (el) => thumbnail && (el.contains(thumbnail) || el.shadowRoot?.contains(thumbnail))
        ) ?? pick(root, `${prefix}preview`),
      thumbnail: thumbnail ?? null,
    };
    const boxes = {
      root: box(root),
      track: tracks.length ? union(tracks.filter(laidOut).length ? tracks.filter(laidOut) : tracks) : null,
      fill: box(elements.fill),
      thumb: box(elements.thumb),
      preview: box(elements.preview),
      thumbnail: box(elements.thumbnail),
    };

    return { elements, boxes };
  };

  const time = slider('timeRoot', map && pane === 'react' ? 'time.' : '');
  const volume = slider('volumeRoot', map && pane === 'react' ? 'volume.' : '');
  const mute = parts.mute ? first(scope, parts.mute) : null;
  const captions = parts.captions ? first(scope, parts.captions) : null;
  const live = parts.live ? first(scope, parts.live) : null;
  const tooltip = parts.tooltip ? deepAll(scope, parts.tooltip).find((el) => box(el).visible) : null;

  let active = document.activeElement;

  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;

  const within = (el, ancestor) => {
    for (
      let node = el;
      node;
      node = parentOf(node) ?? (node.getRootNode() instanceof ShadowRoot ? node.getRootNode().host : null)
    ) {
      if (node === ancestor) return true;
    }
    return false;
  };
  const ring = (el) => {
    for (let node = el, depth = 0; node && depth < 6; node = parentOf(node), depth++) {
      const style = getComputedStyle(node);
      const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      const shadow = style.boxShadow !== 'none';

      if (outline || shadow) {
        return {
          on: node.tagName.toLowerCase() + (node.classList.length ? classSelector(node) : ''),
          outline: outline ? `${style.outlineWidth} ${style.outlineStyle} ${style.outlineColor}` : null,
          boxShadow: shadow ? style.boxShadow : null,
          box: box(node),
        };
      }
    }
    return null;
  };
  const focusable = active && active !== document.body ? active : null;
  const media = (stage === '#stage' ? document : stageElement).querySelector('video, audio');

  /* The classes the React pane looks for, taken from this (HTML) pane's parts. */
  let classMap = null;

  if (pane === 'html') {
    classMap = {
      timeRoot: classSelector(time.elements.root),
      volumeRoot: classSelector(volume.elements.root),
      mute: classSelector(mute),
      captions: classSelector(captions),
      live: classSelector(live),
      tooltip: classSelector(deepAll(document, 'media-tooltip')[0]),
    };
    for (const [prefix, found] of [
      ['time.', time],
      ['volume.', volume],
    ]) {
      for (const key of ['track', 'fill', 'thumb', 'preview', 'thumbnail'])
        classMap[prefix + key] = classSelector(found.elements[key]);
    }
  }

  return {
    stage: { w: Math.round(stageRect.width), h: Math.round(stageRect.height) },
    time: time.boxes,
    volume: volume.boxes,
    mute: box(mute),
    captions: captions
      ? { ...box(captions), pressed: captions.getAttribute('aria-pressed') ?? captions.getAttribute('aria-checked') }
      : null,
    live: box(live),
    tooltip: box(tooltip),
    focus: focusable
      ? {
          on: focusable.tagName.toLowerCase() + (focusable.classList?.length ? classSelector(focusable) : ''),
          inTime: time.elements.root ? within(focusable, time.elements.root) : false,
          inLive: live ? within(focusable, live) : false,
          box: box(focusable),
          ring: ring(focusable),
        }
      : null,
    captionsShowing: media
      ? [...media.textTracks].some((track) => /captions|subtitles/.test(track.kind) && track.mode === 'showing')
      : null,
    classMap,
  };
}
