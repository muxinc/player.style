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
const base = join(root, '../demuxed-2022');
const css = readFileSync(join(base, 'src/skin.css'), 'utf8');
const onDemandTemplate = readFileSync(join(base, 'src/html/template.html'), 'utf8');
const basePkg = JSON.parse(readFileSync(join(base, 'package.json'), 'utf8')) as Record<string, unknown>;

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

/** The `d` attributes of every SVG path, which is what the two frameworks must agree on. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The `ps-*` classes a source uses, in either `class=` or `className=` form. */
function classesIn(source: string): Set<string> {
  return new Set(source.match(/\bps-[a-z0-9-]+/g));
}

/** The `media-*` tags a template stamps. */
function elementsIn(source: string): Set<string> {
  return new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
}

/** The `media-*` tags an HTML entry registers through `@videojs/html/ui/*`. */
function registeredIn(entry: string): Set<string> {
  return new Set([...entry.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
}

describe('skin.css (shared with @player.style/demuxed-2022)', () => {
  it('is the on-demand skin stylesheet, in the element and in the build', () => {
    expect(html).toContain("import styles from '../../../demuxed-2022/src/skin.css?inline';");
    expect(vite).toContain("stylesheet: '../demuxed-2022/src/skin.css'");
  });

  it('styles the Live button and its dot', () => {
    for (const name of ['ps-live-button', 'ps-live-indicator']) {
      expect(
        ruleSelectors(css).some((selector) => selector.includes(`.${name}`)),
        name
      ).toBe(true);
    }
  });

  it('scopes the live-only rules under the root on the live-video preset', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-demuxed-2022[data-preset="live-video"]'))).toBe(true);
  });

  it('declares the brand colour from the accent token and honours the live-button tokens', () => {
    const rootRule = css.match(/^\.ps-demuxed-2022 \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-accent: var(--media-accent-color, var(--media-tertiary-color, #7596cc));');
    expect(rootRule).toContain('--ps-live-icon: var(--media-live-button-icon-color, rgb(140 140 140));');
    expect(rootRule).toContain('--ps-live-indicator: var(--media-live-button-indicator-color, rgb(255 0 0));');
    expect(css).toContain('.ps-live-button[data-live-edge] .ps-live-indicator');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-demuxed-2022" data-theme="demuxed-2022" data-preset="live-video">'
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

  it('drops the time display and time slider the original hid, and keeps both play buttons', () => {
    for (const tag of ['media-time-group', 'media-time', 'media-time-slider', 'media-slider-preview']) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
    expect(template.match(/<media-play-button/g)).toHaveLength(2);
  });

  it("puts a Live button with its own text in the time display's place, after the volume group", () => {
    expect(template).toMatch(/<\/div>\s*(?:<!--[^>]*-->\s*)?<media-live-button class="ps-live-button">/);
    expect(template).toContain('<span class="ps-live-text">Live</span>');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it('draws the on-demand artwork and nothing else but the Live dot', () => {
    expect(new Set(iconPaths(template))).toEqual(new Set(iconPaths(onDemandTemplate)));
  });
});

describe('Demuxed2022LiveSkinElement', () => {
  it('registers <demuxed-2022-live-skin>', () => {
    expect(html).toContain("const TAG_NAME = 'demuxed-2022-live-skin';");
    expect(html).toContain('export class Demuxed2022LiveSkinElement');
    expect(html).toContain('customElements.define(TAG_NAME, Demuxed2022LiveSkinElement)');
  });
});

describe('Demuxed2022LiveSkin', () => {
  it('draws the same icons as the HTML element', () => {
    // A set: React draws the play and pause glyphs once, in `PlayGlyphs`, for both play buttons.
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML element', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset with a Live button and no seek hotkeys', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function Demuxed2022LiveSkin(');
    expect(react).toContain('export type Demuxed2022LiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(/<\/div>\s*(?:\{\/\*[^}]*\*\/\}\s*)?<LiveButton className="ps-live-button">/);
    expect(react).toContain('<span className="ps-live-text">Live</span>');
    expect(react).not.toContain('seekStep');
  });
});

describe('package.json', () => {
  it('publishes as @player.style/demuxed-2022-live with the base skin package shape', () => {
    expect(pkg.name).toBe('@player.style/demuxed-2022-live');
    expect(Object.keys(pkg.exports)).toEqual(Object.keys(basePkg.exports as Record<string, unknown>));
    expect(pkg.exports).toEqual(basePkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });
});
