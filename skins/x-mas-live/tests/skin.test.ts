import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
};
const vite = read('vite.config.ts');

/** The on-demand skin: its stylesheet is this package's, and its template is what the live one trims. */
const base = join(root, '../x-mas');
const css = readFileSync(join(base, 'src/skin.css'), 'utf8');
const onDemandTemplate = readFileSync(join(base, 'src/html/template.html'), 'utf8');
const basePkg = JSON.parse(readFileSync(join(base, 'package.json'), 'utf8')) as Record<string, unknown>;

/** The stylesheet with its SVG data URIs blanked, so their markup does not read as selectors. */
const rules = css.replace(/url\('data:image\/svg\+xml,[^']*'\)/g, 'url()');

/** The Live button's bauble, drawn by this edition alone. */
const BAUBLE = [
  'M6 4.5a5.5 5.5 0 1 1 0 11a5.5 5.5 0 1 1 0-11Z',
  'M4 1.5h4v3.25H4Z',
  'M4.25 7.25a1 1 0 1 1 0 2a1 1 0 1 1 0-2Z',
];

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

/** The `ps-*` classes a source uses, in either `class=` or `className=` form. */
function classesIn(source: string): Set<string> {
  return new Set(source.match(/\bps-[a-z-]+/g));
}

/** The `media-*` tags a template stamps. */
function elementsIn(source: string): Set<string> {
  return new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
}

/** The `media-*` tags an HTML entry registers through `@videojs/html/ui/*`. */
function registeredIn(entry: string): Set<string> {
  return new Set([...entry.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
}

describe('skin.css (shared with @player.style/x-mas)', () => {
  it('is the on-demand skin stylesheet, in the element and in the build', () => {
    expect(html).toContain("import styles from '../../../x-mas/src/skin.css?inline';");
    expect(vite).toContain("stylesheet: '../x-mas/src/skin.css'");
  });

  it('styles the Live button and its bauble', () => {
    for (const name of ['ps-live-button', 'ps-live-indicator']) {
      expect(
        ruleSelectors(rules).some((selector) => selector.includes(`.${name}`)),
        name
      ).toBe(true);
    }
  });

  it('scopes the live-only rules under the root on the live-video preset', () => {
    const live = ruleSelectors(rules).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-x-mas[data-preset="live-video"]'))).toBe(true);
  });

  it('declares the brand colour from the accent token and honours the live-button tokens', () => {
    const rootRule = rules.match(/^\.ps-x-mas \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-primary: var(--media-accent-color, #e72d33);');
    expect(rootRule).toContain('--ps-live-icon: var(--media-live-button-icon-color, rgb(140 140 140));');
    expect(rootRule).toContain('--ps-live-indicator: var(--media-live-button-indicator-color, rgb(255 0 0));');
    expect(css).toContain('.ps-live-button[data-live-edge] .ps-live-indicator');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-x-mas" data-theme="x-mas" data-preset="live-video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = elementsIn(template);
    const registered = registeredIn(html);

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
  });

  it('drops the time range the original hid', () => {
    for (const tag of ['media-time-slider', 'media-slider-buffer', 'media-slider-preview', 'media-slider-value']) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
  });

  it('starts the bar with a Live button that carries its own text', () => {
    expect(template).toMatch(/<div class="ps-bar">\s*(?:<!--[^>]*-->\s*)?<media-live-button class="ps-live-button">/);
    expect(template).toContain('<span class="ps-live-text">Live</span>');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it('carries all of the on-demand artwork and animations, plus the bauble', () => {
    expect(iconPaths(template)).toEqual([...iconPaths(onDemandTemplate), ...BAUBLE].sort());
    expect(animations(template)).toEqual(animations(onDemandTemplate));
  });
});

describe('XMasLiveSkinElement', () => {
  it('registers <x-mas-live-skin>', () => {
    expect(html).toContain("const TAG_NAME = 'x-mas-live-skin';");
    expect(html).toContain('export class XMasLiveSkinElement');
    expect(html).toContain('customElements.define(TAG_NAME, XMasLiveSkinElement)');
  });
});

describe('XMasLiveSkin', () => {
  it('draws and animates the same artwork as the HTML edition', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
    expect(animations(react)).toEqual(animations(template));
    expect(animations(react).length).toBe(55);
  });

  it('uses the same class names as the HTML edition', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither wrapper as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset with a Live button and no seek hotkeys', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function XMasLiveSkin(');
    expect(react).toContain('export type XMasLiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(
      /<div className="ps-bar">\s*(?:\{\/\*[^}]*\*\/\}\s*)?<LiveButton className="ps-live-button">/
    );
    expect(react).toContain('<span className="ps-live-text">Live</span>');
    expect(react).not.toContain('seekStep');
  });
});

describe('package.json', () => {
  it('publishes as @player.style/x-mas-live with the base skin package shape', () => {
    expect(pkg.name).toBe('@player.style/x-mas-live');
    expect(pkg.exports).toEqual(basePkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js']);
  });
});
