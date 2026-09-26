/*
 * The in-page half of the fit check, bundled with the skins by ../index.ts and exposed as `window.fitCheck`. It mounts
 * one skin, puts the media in the paused state, and measures the painted layout. Everything walks the flat tree (shadow
 * roots and slots), so the same code reads the HTML element's shadow root and the React component's light DOM.
 */

/** The rules, named as the failure output names them; ../README.md documents each one and its allowances. */
export type Rule =
  | 'fit/overflow'
  | 'fit/outside-player'
  | 'text/overlap'
  | 'text/overflow'
  | 'target/size'
  | 'popover/placement';

export interface Issue {
  rule: Rule;
  /** The offending element: tag, first classes and accessible name or text. */
  element: string;
  detail: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Trigger {
  /** An index into the page's element registry, passed back to `pointOf`. */
  id: number;
  label: string;
}

export interface MountOptions {
  skin: string;
  preset: 'video' | 'audio' | 'live-video';
  /** The template has a `byline` slot (the React component a `byline` prop), so the page fills it. */
  byline: boolean;
}

/** What a framework entry does to put the skin on the page: resolves once the skin is in the document. */
export type Mount = (options: MountOptions) => Promise<void>;

/** The fixtures the local server serves; the page never reaches the network. */
export const MEDIA = {
  src: '/media/sample.webm',
  poster: '/media/poster.svg',
  captions: '/media/captions.vtt',
  title: 'Landscape Promo',
  byline: 'by Mux',
};

/** WCAG 2.5.5's target size, in CSS pixels. */
export const MIN_TARGET = 44;
/** The hit-test grid pitch: targets are measured to within this many pixels. */
const GRID = 1;
/** How far past a control's box the grid reaches, to find hit area a pseudo-element adds, on one side or both. */
const GRID_REACH = MIN_TARGET;
/** The grid is at most this wide or tall round the centre; a long slider has the same hit area along its length. */
const GRID_WINDOW = 2 * MIN_TARGET + 12;
/** Sub-pixel slack for box comparisons. */
const SLACK = 1;

const INTERACTIVE = [
  'button',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="button"]',
  '[role="slider"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
].join(',');
const TRIGGER = '[commandfor], [popovertarget], [aria-haspopup]:not([aria-haspopup="false"])';
const POPUP_ROLES = '[role="menu"], [role="listbox"], [role="dialog"]';
const SKIPPED_TAGS = new Set(['style', 'script', 'template', 'track', 'source', 'link', 'meta']);

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

let root: Element | null = null;
const registry: Element[] = [];

const round = (value: number) => Math.round(value * 10) / 10;
const size = (rect: Rect) => `${round(rect.right - rect.left)}x${round(rect.bottom - rect.top)}`;
const span = (rect: Rect) => `${round(rect.left)}..${round(rect.right)} x ${round(rect.top)}..${round(rect.bottom)}`;

// ---------------------------------------------------------------------------------------------------------------------
// The flat tree

function parentOf(element: Element): Element | null {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;

  const node = element.getRootNode();

  return node instanceof ShadowRoot ? node.host : null;
}

function childrenOf(element: Element): Element[] {
  if (element.shadowRoot) return [...element.shadowRoot.children];
  if (element instanceof HTMLSlotElement) {
    const assigned = element.assignedElements({ flatten: true });

    return assigned.length ? assigned : [...element.children];
  }
  if (element instanceof SVGElement) return [];

  return [...element.children];
}

function walk(element: Element, into: Element[] = []): Element[] {
  if (SKIPPED_TAGS.has(element.localName)) return into;

  into.push(element);
  for (const child of childrenOf(element)) walk(child, into);
  return into;
}

function flatContains(ancestor: Element, node: Element | null): boolean {
  for (let current = node; current; current = parentOf(current)) if (current === ancestor) return true;

  return false;
}

/** `elementFromPoint` through every shadow root on the way down. */
function hitAt(x: number, y: number): Element | null {
  let hit = document.elementFromPoint(x, y);

  while (hit?.shadowRoot) {
    const inner = hit.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === hit) break;

    hit = inner;
  }
  return hit;
}

function inTopLayer(element: Element): boolean {
  try {
    return element.matches(':popover-open') || element.matches('dialog:modal');
  } catch {
    return false;
  }
}

function inPopup(element: Element): boolean {
  for (let current: Element | null = element; current && current !== root; current = parentOf(current)) {
    if (inTopLayer(current) || current.matches(POPUP_ROLES)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------------------------------
// Painting

/**
 * The part of an element's border box that is painted: clipped by every clipping ancestor up to the top layer (or up
 * to `within`, whose own clip is left out), or `null` when it is not rendered, hidden, transparent, or too small to
 * see (a visually hidden label is 1px).
 */
function painted(element: Element, within?: Element): Rect | null {
  const box = element.getBoundingClientRect();
  if (box.width < 2 || box.height < 2) return null;

  const own = getComputedStyle(element);
  if (own.visibility !== 'visible' || own.contentVisibility === 'hidden') return null;

  const rect: Rect = { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
  let opacity = 1;

  for (let current: Element | null = element; current; current = parentOf(current)) {
    const style = current === element ? own : getComputedStyle(current);
    if (style.display === 'none') return null;

    opacity *= Number(style.opacity);

    if (
      current !== element &&
      current !== within &&
      current !== document.documentElement &&
      current !== document.body
    ) {
      const clipAll = style.clipPath !== 'none' || /paint|strict|content/.test(style.contain);

      if (clipAll || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
        const clip = current.getBoundingClientRect();

        if (clipAll || style.overflowX !== 'visible') {
          rect.left = Math.max(rect.left, clip.left);
          rect.right = Math.min(rect.right, clip.right);
        }
        if (clipAll || style.overflowY !== 'visible') {
          rect.top = Math.max(rect.top, clip.top);
          rect.bottom = Math.min(rect.bottom, clip.bottom);
        }
      }
    }

    // Nothing above a top-layer element clips or fades it.
    if (inTopLayer(current)) break;
  }

  if (opacity < 0.05 || rect.right - rect.left < 1 || rect.bottom - rect.top < 1) return null;

  return rect;
}

function describe(element: Element): string {
  const classes = [...element.classList]
    .filter((name) => name !== 'media-skin')
    .slice(0, 3)
    .map((name) => `.${name}`)
    .join('');
  const label =
    element.getAttribute('aria-label') ??
    (element.matches(INTERACTIVE) ? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 30) : '');

  return `${element.localName}${classes}${label ? ` "${label}"` : ''}`;
}

const intersects = (a: Rect, b: Rect, slack = SLACK) =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > slack &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > slack;

const outside = (inner: Rect, outer: Rect) =>
  inner.left < outer.left - SLACK ||
  inner.right > outer.right + SLACK ||
  inner.top < outer.top - SLACK ||
  inner.bottom > outer.bottom + SLACK;

const viewport = (): Rect => ({
  left: 0,
  top: 0,
  right: document.documentElement.clientWidth,
  bottom: window.innerHeight,
});

// ---------------------------------------------------------------------------------------------------------------------
// Rules

/** Interactive elements that are painted, outermost only: a control's own parts are part of its target. */
function controls(elements: Element[]): Element[] {
  const found = elements.filter((element) => element !== root && element.matches(INTERACTIVE) && painted(element));

  return found.filter((element) => !found.some((other) => other !== element && flatContains(other, element)));
}

/** A slider's target is its root, not the thumb that carries `role="slider"`: the pointer seeks anywhere on it. */
function targetOf(control: Element): Element {
  if (control.getAttribute('role') !== 'slider') return control;

  let target = control;

  for (let current = parentOf(control); current && current !== root; current = parentOf(current)) {
    if (current.hasAttribute('data-orientation')) target = current;
  }
  return target;
}

/**
 * The boxes a row lays out: its painted in-flow descendants, down to and including controls, sliders, graphics and
 * boxes that clip, whose insides are their own business. Positioned and top-layer elements are laid out elsewhere.
 */
function laidOut(row: Element, depth = Infinity): Element[] {
  const found: Element[] = [];
  const visit = (element: Element, level: number) => {
    for (const child of childrenOf(element)) {
      const style = getComputedStyle(child);
      if (style.display === 'none' || /absolute|fixed/.test(style.position) || inTopLayer(child)) continue;
      if (style.display === 'contents') {
        visit(child, level);
        continue;
      }
      if (!painted(child)) continue;

      found.push(child);

      const opaque =
        child.matches(INTERACTIVE) ||
        child.hasAttribute('data-orientation') ||
        child instanceof SVGElement ||
        style.overflowX !== 'visible';

      if (!opaque && level + 1 < depth) visit(child, level + 1);
    }
  };

  visit(row, 0);
  return found;
}

/** A control's box as the check reads it: a slider's root; otherwise its box, or what it draws when it paints no box. */
function controlBox(control: Element): Rect {
  const target = targetOf(control);
  const box = target.getBoundingClientRect();

  return target === control && !paintsBox(getComputedStyle(control)) ? (drawnExtent(control) ?? box) : box;
}

const visibleColor = (color: string) => !/^transparent$|^rgba\(.*,\s*0\)$|\/\s*0\)$/.test(color);

/** The element paints its own box: a background, or a visible border. */
function paintsBox(style: CSSStyleDeclaration): boolean {
  const border = ['Top', 'Right', 'Bottom', 'Left'].some(
    (side) =>
      parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0 &&
      style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== 'none' &&
      visibleColor(style.getPropertyValue(`border-${side.toLowerCase()}-color`))
  );

  return border || style.backgroundImage !== 'none' || visibleColor(style.backgroundColor);
}

const SHAPES = 'path, circle, ellipse, line, polyline, polygon, rect, text, image, use';
const NOT_DRAWN = 'defs, mask, clipPath, symbol, pattern, marker, linearGradient, radialGradient, filter';

/** The union of what an element draws: its text, its graphics' shapes, its images, and its children's boxes or drawings. */
function drawnExtent(element: Element): Rect | null {
  let union: Rect | null = null;
  const add = (rect: Rect) => {
    if (rect.right - rect.left < 0.5 || rect.bottom - rect.top < 0.5) return;

    union = union
      ? {
          left: Math.min(union.left, rect.left),
          top: Math.min(union.top, rect.top),
          right: Math.max(union.right, rect.right),
          bottom: Math.max(union.bottom, rect.bottom),
        }
      : { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  };
  const shown = (node: Element) => {
    const style = getComputedStyle(node);

    return style.display !== 'none' && style.visibility === 'visible' && Number(style.opacity) > 0;
  };

  for (const node of element.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;

    const range = document.createRange();

    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) add(rect);
  }

  for (const child of childrenOf(element)) {
    if (!shown(child)) continue;

    if (child instanceof SVGSVGElement) {
      for (const shape of child.querySelectorAll(SHAPES)) {
        if (shape.closest(NOT_DRAWN)) continue;

        let visible = true;

        for (let node: Element | null = shape; node && node !== child && visible; node = node.parentElement)
          visible = shown(node);
        if (visible) add(shape.getBoundingClientRect());
      }
    } else if (/^(img|video|canvas|picture)$/.test(child.localName) || paintsBox(getComputedStyle(child))) {
      add(child.getBoundingClientRect());
    } else {
      const inner = drawnExtent(child);

      if (inner) add(inner);
    }
  }
  return union;
}

/**
 * fit/overflow: the skin root and every row (a flex or grid box laying out two or more painted children) hold the
 * boxes they lay out, and a box that scrolls sideways has nothing to scroll. fit/outside-player: no control leaves
 * the player.
 */
function checkFit(elements: Element[], player: Rect, issues: Issue[], popups: boolean): void {
  for (const element of elements) {
    const style = getComputedStyle(element);
    if (!painted(element)) continue;

    const row = element === root || (/flex|grid/.test(style.display) && laidOut(element, 1).length >= 2);
    const scrolls = /auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth + SLACK;
    if (!row && !scrolls) continue;

    const box = element.getBoundingClientRect();
    const sticking = row
      ? laidOut(element).filter((child) => {
          const rect = child.getBoundingClientRect();

          return rect.right > box.right + SLACK || rect.left < box.left - SLACK;
        })
      : [];
    const outermost = sticking.filter(
      (child) => !sticking.some((other) => other !== child && flatContains(other, child))
    );

    if (scrolls || outermost.length) {
      issues.push({
        rule: 'fit/overflow',
        element: describe(element),
        detail: [
          scrolls ? `scrolls sideways: ${element.scrollWidth}px of content in a ${element.clientWidth}px box` : '',
          outermost.length
            ? `lays out past its ${span(box)}: ${outermost.map((child) => `${describe(child)} at ${span(child.getBoundingClientRect())}`).join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join('; '),
      });
    }
  }

  if (popups) return;

  for (const control of controls(elements)) {
    const box = controlBox(control);

    if (outside(box, player)) {
      issues.push({
        rule: 'fit/outside-player',
        element: describe(targetOf(control)),
        detail: `${targetOf(control) === control && !paintsBox(getComputedStyle(control)) ? 'drawing' : 'box'} ${span(box)} leaves the player ${span(player)}`,
      });
    }
  }
}

interface TextItem {
  element: Element;
  text: string;
  /** Line boxes as laid out. */
  lines: Rect[];
  /** Line boxes as painted, clipped by the element's clipping ancestors. */
  visible: Rect[];
  container: Element;
}

function textItems(elements: Element[]): TextItem[] {
  const items: TextItem[] = [];

  for (const element of elements) {
    if (element.shadowRoot || element instanceof SVGElement) continue;

    const nodes = [...element.childNodes].filter(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );
    if (!nodes.length) continue;

    const clip = painted(element);
    if (!clip) continue;

    const lines: Rect[] = [];

    for (const node of nodes) {
      const range = document.createRange();

      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 1 && rect.height > 1) lines.push(rect);
    }

    const visible = lines
      .map((line) => ({
        left: Math.max(line.left, clip.left),
        top: Math.max(line.top, clip.top),
        right: Math.min(line.right, clip.right),
        bottom: Math.min(line.bottom, clip.bottom),
      }))
      .filter((line) => line.right - line.left > 1 && line.bottom - line.top > 1);
    if (!visible.length) continue;

    let container = element;

    while (/^(inline|contents)$/.test(getComputedStyle(container).display)) {
      const parent = parentOf(container);
      if (!parent) break;

      container = parent;
    }

    const text = nodes
      .map((node) => node.textContent!.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .slice(0, 40);

    items.push({ element, text, lines, visible, container });
  }
  return items;
}

/** The container truncates on purpose: it clips horizontally and ends the line with an ellipsis. */
function truncates(container: Element): boolean {
  const style = getComputedStyle(container);

  return style.overflowX !== 'visible' && style.textOverflow === 'ellipsis';
}

/**
 * text/overflow: every line of text stays inside the box that holds it (horizontally, and with its vertical centre
 * inside, so a line that wraps out of its box fails while a glyph's ascender past a tight line-height does not), and
 * inside the player. text/overlap: no two painted text boxes intersect.
 */
function checkText(elements: Element[], player: Rect | null, issues: Issue[]): void {
  const items = textItems(elements);

  for (const item of items) {
    const box = item.container.getBoundingClientRect();
    const line = item.lines.find((rect) => {
      const middle = (rect.top + rect.bottom) / 2;
      const horizontal = !truncates(item.container) && (rect.left < box.left - SLACK || rect.right > box.right + SLACK);

      return horizontal || middle < box.top || middle > box.bottom;
    });

    if (line) {
      issues.push({
        rule: 'text/overflow',
        element: `${describe(item.element)} "${item.text}"`,
        detail: `line ${span(line)} leaves ${item.container === item.element ? 'its box' : describe(item.container)} ${span(box)}`,
      });
      continue;
    }

    // Text may be clipped by a box of its own (a marquee's window, a truncated title), never by the player's edge.
    const clip = player && painted(item.element, root!);
    const escaped =
      player &&
      clip &&
      item.lines
        .map((rect) => ({
          left: Math.max(rect.left, clip.left),
          top: Math.max(rect.top, clip.top),
          right: Math.min(rect.right, clip.right),
          bottom: Math.min(rect.bottom, clip.bottom),
        }))
        .find((rect) => rect.right - rect.left > SLACK && rect.bottom - rect.top > SLACK && outside(rect, player));

    if (escaped) {
      issues.push({
        rule: 'text/overflow',
        element: `${describe(item.element)} "${item.text}"`,
        detail: `line ${span(escaped)} leaves the player ${span(player)}`,
      });
    }
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!;
      const b = items[j]!;
      if (flatContains(a.element, b.element) || flatContains(b.element, a.element)) continue;

      const hit = a.visible.find((line) => b.visible.some((other) => intersects(line, other)));

      if (hit) {
        issues.push({
          rule: 'text/overlap',
          element: `${describe(a.element)} "${a.text}"`,
          detail: `overlaps ${describe(b.element)} "${b.text}" at ${span(hit)}`,
        });
      }
    }
  }
}

interface HitArea {
  /** The diameter of the largest disc of points that all hit the target, in CSS pixels, capped just above the minimum. */
  disc: number;
  /** The bounding box of every point that hits the target, within the sampled window. */
  box: Rect | null;
}

/** Grid offsets within the largest radius the check needs, nearest first. */
const OFFSETS = (() => {
  const reach = Math.ceil(MIN_TARGET / 2 / GRID) + 1;
  const offsets: [number, number, number][] = [];

  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      const distance = Math.hypot(dx, dy);

      if (distance && distance <= reach) offsets.push([dx, dy, distance * GRID]);
    }
  }
  return offsets.sort((a, b) => a[2] - b[2]);
})();

/**
 * A target's real hit area: `elementFromPoint` on a 1px grid, flood-filled from a point on the target over every point
 * whose hit lands on the target or inside it, as far as 44px past its box (within a 100px window round its centre on a
 * long control). The size is the largest disc of hit points, so a round 44px button counts as 44px where a square
 * measure would call it 31px.
 */
function hitArea(target: Element): HitArea {
  const box = target.getBoundingClientRect();
  const view = viewport();
  const cx = (box.left + box.right) / 2;
  const cy = (box.top + box.bottom) / 2;
  const halfWidth = Math.min(box.width / 2 + GRID_REACH, GRID_WINDOW / 2);
  const halfHeight = Math.min(box.height / 2 + GRID_REACH, GRID_WINDOW / 2);
  const left = Math.max(view.left, cx - halfWidth);
  const top = Math.max(view.top, cy - halfHeight);
  const columns = Math.max(0, Math.floor((Math.min(view.right, cx + halfWidth) - left) / GRID));
  const rows = Math.max(0, Math.floor((Math.min(view.bottom, cy + halfHeight) - top) / GRID));
  // 0: not sampled, 1: hits the target, 2: misses it.
  const grid = new Uint8Array(columns * rows);
  const hits: Rect = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  const sample = (c: number, r: number) => {
    const index = r * columns + c;

    if (!grid[index]) {
      const x = left + GRID * (c + 0.5);
      const y = top + GRID * (r + 0.5);

      grid[index] = flatContains(target, hitAt(x, y)) ? 1 : 2;
      if (grid[index] === 1) {
        hits.left = Math.min(hits.left, x - GRID / 2);
        hits.right = Math.max(hits.right, x + GRID / 2);
        hits.top = Math.min(hits.top, y - GRID / 2);
        hits.bottom = Math.max(hits.bottom, y + GRID / 2);
      }
    }
    return grid[index] === 1;
  };

  // Seed at the centre, or at the first point of the drawn box that hits when something covers the centre.
  const toColumn = (x: number) => Math.floor((x - left) / GRID);
  const toRow = (y: number) => Math.floor((y - top) / GRID);
  const inside = (c: number, r: number) => c >= 0 && r >= 0 && c < columns && r < rows;
  let seed: [number, number] | null =
    inside(toColumn(cx), toRow(cy)) && sample(toColumn(cx), toRow(cy)) ? [toColumn(cx), toRow(cy)] : null;

  for (let y = box.top + 1; !seed && y < box.bottom; y += 2) {
    for (let x = box.left + 1; !seed && x < box.right; x += 2) {
      if (inside(toColumn(x), toRow(y)) && sample(toColumn(x), toRow(y))) seed = [toColumn(x), toRow(y)];
    }
  }

  const queue: [number, number][] = seed ? [seed] : [];

  while (queue.length) {
    const [c, r] = queue.pop()!;

    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const column = c + dc;
      const row = r + dr;

      if (inside(column, row) && !grid[row * columns + column] && sample(column, row)) queue.push([column, row]);
    }
  }

  // Each hit point's radius is its distance to the nearest point that is not a hit (outside the window counts as one).
  const cap = OFFSETS[OFFSETS.length - 1]![2];
  let disc = 0;

  for (let r = 0; r < rows && disc < MIN_TARGET; r++) {
    for (let c = 0; c < columns && disc < MIN_TARGET; c++) {
      if (grid[r * columns + c] !== 1) continue;

      const miss = OFFSETS.find(([dc, dr]) => !inside(c + dc, r + dr) || grid[(r + dr) * columns + c + dc] !== 1);

      disc = Math.max(disc, 2 * (miss ? miss[2] : cap));
    }
  }

  return { disc: round(Math.min(disc, MIN_TARGET)), box: Number.isFinite(hits.left) ? hits : null };
}

/** The element is partly outside an ancestor that scrolls (`overflow: auto` or `scroll`). */
function scrolledOut(element: Element): boolean {
  const box = element.getBoundingClientRect();

  for (let current = parentOf(element); current && current !== root; current = parentOf(current)) {
    const style = getComputedStyle(current);

    if (/auto|scroll/.test(`${style.overflowX} ${style.overflowY}`) && outside(box, current.getBoundingClientRect())) {
      return true;
    }
  }
  return false;
}

/** A control's role and accessible name: two controls that share both do the same thing. */
function purpose(control: Element): string {
  const role = control.getAttribute('role') ?? (control.localName === 'button' ? 'button' : control.localName);
  const name = control.getAttribute('aria-label') ?? control.textContent?.trim().replace(/\s+/g, ' ') ?? '';

  return `${role}: ${name}`;
}

/**
 * target/size: every painted control can be hit over a disc at least 44px across. Two allowances, both from WCAG 2.5.5:
 * an undersized control passes when an equivalent one (same role and accessible name, such as a second seek bar) meets
 * the size, and in a skin drawn at a fixed size (`fixed`: its artwork is the presentation) a control needs to be
 * hittable over its whole drawn box, up to 44px, rather than 44px outright.
 */
function checkTargets(elements: Element[], issues: Issue[], fixed: boolean): void {
  const measured = controls(elements).map((control) => {
    const target = targetOf(control);

    // A menu row scrolled out of its list is measured where the viewer would scroll it to.
    if (scrolledOut(target)) target.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    const drawn = target.getBoundingClientRect();
    const needed = fixed ? Math.min(MIN_TARGET, Math.floor(Math.min(drawn.width, drawn.height))) : MIN_TARGET;

    return { control, target, drawn, needed, ...hitArea(target) };
  });
  const met = new Set(measured.filter(({ disc, needed }) => disc >= needed).map(({ control }) => purpose(control)));

  for (const { control, target, drawn, needed, disc, box } of measured) {
    if (disc >= needed || met.has(purpose(control))) continue;

    const centre = hitAt((drawn.left + drawn.right) / 2, (drawn.top + drawn.bottom) / 2);
    const detail = box
      ? `the largest disc it can be hit over is ${disc}px across (hit area ${size(box)}, drawn ${size(drawn)}); needs ${needed}px`
      : `cannot be hit at all: ${centre ? describe(centre) : 'nothing'} covers it (drawn ${size(drawn)})`;

    issues.push({
      rule: 'target/size',
      element: target === control ? describe(control) : `${describe(target)} (slider of ${describe(control)})`,
      detail,
    });
  }
}

/** Open menus and popovers anywhere in the page: top-layer popovers and modal dialogs, and painted menu roles. */
function openPopups(): Element[] {
  const found = walk(document.body).filter(
    (element) => inTopLayer(element) || (element.matches(POPUP_ROLES) && painted(element))
  );

  return found.filter((element) => !found.some((other) => other !== element && flatContains(other, element)));
}

/** popover/placement: an open menu or popover lies inside the player and inside the viewport. */
function checkPopups(popups: Element[], player: Rect, issues: Issue[]): void {
  const view = viewport();

  for (const popup of popups) {
    const box = popup.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;

    const where = [
      outside(box, player) && `the player ${span(player)}`,
      outside(box, view) && `the viewport ${span(view)}`,
    ];

    if (where.some(Boolean)) {
      issues.push({
        rule: 'popover/placement',
        element: describe(popup),
        detail: `box ${span(box)} leaves ${where.filter(Boolean).join(' and ')}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// The API the test drives

function skinRoot(): Element {
  if (!root) throw new Error('The skin is not mounted.');

  return root;
}

function mediaElement(): HTMLMediaElement {
  const media = document.querySelector('video, audio');
  if (!(media instanceof HTMLMediaElement)) throw new Error('No media element on the page.');

  return media;
}

const once = (target: EventTarget, type: string, timeout = 5000) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, timeout);

    target.addEventListener(type, () => (clearTimeout(timer), resolve()), { once: true });
  });

const api = {
  /** Resolves once the skin root is in the document and the media has its metadata. */
  ready: Promise.resolve() as Promise<void>,

  /** Played once (muted), paused and seeked to 35%, unmuted: the state of a viewer who paused mid-way. */
  async prepare(): Promise<void> {
    const media = mediaElement();

    media.muted = true;
    await media.play().catch(() => undefined);
    media.pause();
    if (Number.isFinite(media.duration) && media.duration > 0) {
      const seeked = once(media, 'seeked');

      media.currentTime = media.duration * 0.35;
      await seeked;
    }
    media.muted = false;
  },

  state(): { paused: boolean; controlsVisible: boolean } {
    return { paused: mediaElement().paused, controlsVisible: skinRoot().hasAttribute('data-controls-visible') };
  },

  pause(): void {
    mediaElement().pause();
  },

  /** The media's error, if it has one: the player then shows its error dialog over the controls. */
  mediaError(): string | null {
    const { error } = mediaElement();

    return error ? `media error ${error.code}${error.message ? `: ${error.message}` : ''}` : null;
  },

  playerBox(): Rect {
    const { left, top, right, bottom } = skinRoot().getBoundingClientRect();

    return { left, top, right, bottom };
  },

  /** A point on the player that hits no control, as near the upper middle as there is one: where a tap lands. */
  neutralPoint(): Point {
    const box = skinRoot().getBoundingClientRect();
    const points: Point[] = [];

    for (let y = box.top + 4; y < box.bottom - 4; y += 8) {
      for (let x = box.left + 4; x < box.right - 4; x += 8) points.push({ x, y });
    }

    const aim = { x: (box.left + box.right) / 2, y: box.top + box.height * 0.3 };

    points.sort((a, b) => Math.hypot(a.x - aim.x, a.y - aim.y) - Math.hypot(b.x - aim.x, b.y - aim.y));

    const free = points.find(({ x, y }) => {
      const hit = hitAt(x, y);

      return hit && flatContains(skinRoot(), hit) && !walkUp(hit).some((element) => element.matches(INTERACTIVE));
    });

    return free ?? aim;
  },

  /** Every painted menu trigger in the player (`scope: 'player'`) or inside the open popups (`'popups'`). */
  triggers(scope: 'player' | 'popups'): Trigger[] {
    const elements =
      scope === 'player'
        ? walk(skinRoot()).filter((element) => !inPopup(element))
        : openPopups().flatMap((popup) => walk(popup));

    return controls(elements)
      .filter((element) => element.matches(TRIGGER))
      .map((element) => ({ id: registry.push(element) - 1, label: describe(element) }));
  },

  /** A point that hits the registered element: its centre when that is not covered. */
  pointOf(id: number): Point | null {
    const element = registry[id];
    if (!element || !painted(element)) return null;

    const box = element.getBoundingClientRect();
    const centre = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
    if (flatContains(element, hitAt(centre.x, centre.y))) return centre;

    for (let y = box.top + 1; y < box.bottom; y += 2) {
      for (let x = box.left + 1; x < box.right; x += 2) if (flatContains(element, hitAt(x, y))) return { x, y };
    }
    return null;
  },

  /** A string that changes while anything in the player or its popups is still moving. */
  signature(): string {
    return [skinRoot(), ...openPopups()]
      .flatMap((scope) => controls(walk(scope)))
      .map((element) => span(element.getBoundingClientRect()))
      .join('|');
  },

  /** A transition or finite animation is still running in the page (a menu sliding in, controls fading up). */
  busy(): boolean {
    return [...document.getAnimations(), ...skinRoot().getAnimations({ subtree: true })].some(
      (animation) =>
        animation.playState === 'running' && Number.isFinite(animation.effect?.getComputedTiming().endTime ?? Infinity)
    );
  },

  popupCount(): number {
    return openPopups().length;
  },

  /**
   * Every control's size and the size of the box round them all, to compare at two widths: a skin none of whose
   * controls moves apart or changes size is drawn at a fixed size.
   */
  controlSizes(): string[] {
    const boxes = controls(walk(skinRoot())).map((control) => targetOf(control).getBoundingClientRect());
    const all = boxes.reduce<Rect | null>(
      (union, box) =>
        union
          ? {
              left: Math.min(union.left, box.left),
              top: Math.min(union.top, box.top),
              right: Math.max(union.right, box.right),
              bottom: Math.max(union.bottom, box.bottom),
            }
          : box,
      null
    );

    return all ? [size(all), ...boxes.map(size)] : [];
  },

  /**
   * Run the rules. `'player'` measures the skin with its popups closed (any popup already open, such as a tooltip left
   * by the tap, must still be placed inside); `'popups'` measures the open menus and popovers and what is in them.
   */
  measure(scope: 'player' | 'popups', fixed = false): Issue[] {
    const issues: Issue[] = [];
    const player = api.playerBox();
    const popups = openPopups();

    checkPopups(popups, player, issues);

    if (scope === 'player') {
      const elements = walk(skinRoot()).filter((element) => !inPopup(element));

      checkFit(elements, player, issues, false);
      checkText(elements, player, issues);
      checkTargets(elements, issues, fixed);
    } else {
      for (const popup of popups) {
        const elements = walk(popup);

        checkFit(elements, player, issues, true);
        checkText(elements, null, issues);
        checkTargets(elements, issues, fixed);
      }
    }
    return issues;
  },
};

function walkUp(element: Element): Element[] {
  const chain: Element[] = [];

  for (let current: Element | null = element; current && current !== root; current = parentOf(current))
    chain.push(current);
  return chain;
}

export type FitCheckApi = typeof api;

declare global {
  interface Window {
    fitCheck: FitCheckApi;
  }
}

/** Read the page's query, mount the skin with the entry's `mount`, and expose the API once it is laid out. */
export function install(mount: Mount): void {
  const query = new URLSearchParams(location.search);
  const options: MountOptions = {
    skin: query.get('skin') ?? '',
    preset: (query.get('preset') ?? 'video') as MountOptions['preset'],
    byline: query.get('byline') === '1',
  };

  api.ready = (async () => {
    await mount(options);

    const deadline = Date.now() + 10_000;

    while (!(root = findRoot())) {
      if (Date.now() > deadline) throw new Error('The skin rendered no `.media-skin` root.');
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const media = mediaElement();

    if (media.readyState < 1) await once(media, 'loadedmetadata', 10_000);
    if (media.readyState < 1) throw new Error(`The media did not load (${media.error?.message ?? 'no error'}).`);
  })();
  // The test reads the rejection through `ready`; keep it from surfacing as an unhandled one first.
  api.ready.catch(() => undefined);

  window.fitCheck = api;
}

function findRoot(): Element | null {
  const container = document.getElementById('root');
  if (!container) return null;

  for (const element of walk(container)) if (element.classList.contains('media-skin')) return element;
  return null;
}
