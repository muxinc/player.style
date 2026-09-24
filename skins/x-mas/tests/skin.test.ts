import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const css = readFileSync(join(root, 'src/skin.css'), 'utf8');
const template = readFileSync(join(root, 'src/html/template.html'), 'utf8');
const html = readFileSync(join(root, 'src/html/index.ts'), 'utf8');
const react = readFileSync(join(root, 'src/react/index.tsx'), 'utf8');

/** The Media Chrome edition, when the repository still carries it. */
const legacyTemplate = join(root, '../../themes/x-mas/template.html');

/** The stylesheet with its SVG data URIs blanked, so their markup does not read as selectors or tag names. */
const rules = css.replace(/url\('data:image\/svg\+xml,[^']*'\)/g, 'url()');

/** Every selector list in the stylesheet, comments stripped, `@`-rule preludes left out. */
function selectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}')
    .flatMap((block) => block.split('{')[0]?.split(',') ?? [])
    .map((selector) => selector.trim())
    .filter((selector) => selector && !selector.startsWith('@'));
}

/** Top-level selectors of every style rule: commas inside `:is()`/`:not()` stay put, keyframe steps are left out. */
function ruleSelectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .split('}')
    .map((block) => block.split('{').at(-2)?.trim() ?? '')
    .filter((prelude) => prelude && !prelude.startsWith('@'))
    .flatMap((prelude) => {
      const parts: string[] = [];
      let depth = 0;
      let start = 0;

      for (let i = 0; i < prelude.length; i++) {
        if ('(['.includes(prelude[i]!)) depth++;
        else if (')]'.includes(prelude[i]!)) depth--;
        else if (prelude[i] === ',' && depth === 0) {
          parts.push(prelude.slice(start, i).trim());
          start = i + 1;
        }
      }

      return [...parts, prelude.slice(start).trim()];
    });
}

/** The `d` attribute of every SVG path, sorted: the artwork both editions must carry. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?\bd="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The keyframe lists of every SMIL animation, sorted: the lights twinkle and the baubles swing in both editions. */
function animations(source: string): string[] {
  return [...source.matchAll(/<animate(?:Transform)?\s[^>]*?\bvalues="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The original theme's markup, without its stylesheet (whose data URIs carry paths of their own). */
function legacyMarkup(): string {
  const source = readFileSync(legacyTemplate, 'utf8');

  return source.slice(source.indexOf('</style>'));
}

describe('skin.css', () => {
  it('targets classes and state, never tag names', () => {
    const bare = selectors(rules).filter((selector) =>
      selector
        .split(/[\s>+~]+/)
        .some(
          (compound) =>
            /^[a-z]/i.test(compound) && !/^(?:video|audio|img)$/.test(compound) && !compound.startsWith('::')
        )
    );

    expect(bare).toEqual([]);
  });

  it('scopes every rule under the root, so several skins can share a page', () => {
    const unscoped = ruleSelectors(rules).filter(
      (selector) => !/^(?:\.ps-x-mas(?![\w-])|:where\(\.ps-x-mas\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour, the red of the candy canes, from the accent token', () => {
    const rootRule = rules.match(/^\.ps-x-mas \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-primary: var(--media-accent-color, #e72d33);');
    expect(rootRule).toMatch(
      /--ps-candy-cane: var\(\s*--media-range-bar-color,\s*repeating-linear-gradient\(45deg, var\(--ps-primary\)/
    );
  });

  it("keeps the original's range and text tokens, and media-chrome's live-button tokens, with their defaults", () => {
    for (const token of [
      'var(--media-text-color, #fff)',
      'var(--media-range-track-background, rgb(255 255 255 / 0.4))',
      'var(--media-live-button-icon-color, rgb(140 140 140))',
      'var(--media-live-button-indicator-color, rgb(255 0 0))',
    ]) {
      expect(css, token).toContain(token);
    }
  });

  it("keys the live edition's layout rules on the live-video preset inside the root scope", () => {
    const live = ruleSelectors(rules).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-x-mas[data-preset="live-video"]'))).toBe(true);
  });

  it('has no reduced-motion rules, as the original had none', () => {
    expect(rules.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('prefers-reduced-motion');
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-x-mas > video');
    expect(css).toContain('.ps-x-mas ::slotted(video)');
  });

  it('inlines both thumbs and uses them, with no external url()', () => {
    for (const name of ['tree', 'bauble']) {
      expect(css).toMatch(new RegExp(`--ps-img-${name}: url\\('data:image/svg\\+xml,`));
      expect(css).toContain(`var(--ps-img-${name})`);
    }

    expect(rules).not.toMatch(/url\((?!\))/);
  });

  it.runIf(existsSync(legacyTemplate))('carries the original thumb artwork verbatim', () => {
    const legacy = readFileSync(legacyTemplate, 'utf8');
    const uris = (source: string) => source.match(/url\('data:image\/svg\+xml,[^']*'\)/g) ?? [];

    expect(uris(css).sort()).toEqual(uris(legacy).sort());
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain('<media-container class="media-skin ps-x-mas" data-theme="x-mas" data-preset="video">');
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses', () => {
    const used = new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
    const registered = new Set(
      [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`)
    );
    const missing = [...used].filter((tag) => !registered.has(tag));

    expect(missing).toEqual([]);
  });

  it('registers nothing it does not use', () => {
    const used = new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
    const extra = [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)]
      .map((match) => `media-${match[1]}`)
      .filter((tag) => !used.has(tag));

    expect(extra).toEqual([]);
  });

  it.runIf(existsSync(legacyTemplate))('carries all of the original artwork and its animations', () => {
    const legacy = legacyMarkup();

    expect(iconPaths(template)).toEqual(iconPaths(legacy));
    expect(animations(template)).toEqual(animations(legacy));
  });
});

describe('XMasSkin', () => {
  it('draws the same artwork as the HTML edition', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
    expect(iconPaths(react).length).toBeGreaterThan(150);
  });

  it('animates the same artwork as the HTML edition', () => {
    expect(animations(react)).toEqual(animations(template));
    expect(animations(react).length).toBe(55);
  });

  it('uses the same class names as the HTML edition', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither wrapper as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
