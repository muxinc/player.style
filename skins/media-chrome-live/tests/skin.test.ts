import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const vite = read('vite.config.ts');
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
};

/** The on-demand skin: its stylesheet and element host are this package's, and its template is what this one trims. */
const base = join(root, '../media-chrome');
const readBase = (path: string) => readFileSync(join(base, path), 'utf8');
const css = readBase('src/skin.css');
const onDemandTemplate = readBase('src/html/template.html');
const onDemandHtml = readBase('src/html/index.ts');
const basePkg = JSON.parse(readBase('package.json')) as Record<string, unknown>;

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

      return [...parts, prelude.slice(start).trim()].map((part) => part.replace(/\s+/g, ' '));
    });
}

/** The `d` attribute of every SVG path, sorted. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?\bd="([^"]+)"/g)].map((match) => match[1]!).sort();
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

/** The element host below the imports and the tag name, which must match the on-demand package's line for line. */
function host(source: string): string {
  return source
    .slice(source.indexOf("const TAG_NAME = '"))
    .replace(/media-chrome-live-skin|media-chrome-skin/g, 'TAG')
    .replace(/MediaChromeLiveSkinElement|MediaChromeSkinElement/g, 'Element')
    .replace(/\/\*\*[\s\S]*?\*\/\n(?=export class)/, '');
}

describe('skin.css (shared with @player.style/media-chrome)', () => {
  it('is the on-demand skin stylesheet, in the element and in the build', () => {
    expect(existsSync(join(root, 'src/skin.css'))).toBe(false);
    expect(html).toContain("import styles from '../../../media-chrome/src/skin.css?inline';");
    expect(vite).toContain(
      "defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../media-chrome/src/skin.css' })"
    );
  });

  it('styles the LIVE button, its dot and its spacer', () => {
    for (const name of ['ps-live-button', 'ps-live-indicator', 'ps-live-text']) {
      expect(
        ruleSelectors(css).some((selector) => selector.includes(`.${name}`)),
        name
      ).toBe(true);
    }
  });

  it('scopes the live-only rules under the root on the live-video preset', () => {
    const live = ruleSelectors(css).filter((selector) => /ps-live-|data-preset/.test(selector));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-media-chrome[data-preset="live-video"] '))).toBe(true);
  });

  it("honours the live-button tokens with media-chrome's defaults", () => {
    const rootRule = css.match(/^\.ps-media-chrome \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-live-icon: var(--media-live-button-icon-color, rgb(140 140 140));');
    expect(rootRule).toContain('--ps-live-indicator: var(--media-live-button-indicator-color, rgb(255 0 0));');
    expect(css).toMatch(
      /\.ps-live-button\[data-live-edge\]\s+\.ps-live-indicator \{\s+fill: var\(--ps-live-indicator\);/
    );
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-media-chrome" data-theme="media-chrome" data-preset="live-video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = elementsIn(template);
    const registered = registeredIn(html);
    // `media-tooltip` needs its label and shortcut parts registered, though these tooltips author their own text.
    const tooltipParts = ['media-tooltip-label', 'media-tooltip-shortcut'];

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag) && !tooltipParts.includes(tag))).toEqual([]);
  });

  it('drops the seek buttons, time range, time display and playback rate', () => {
    for (const tag of [
      'media-seek-button',
      'media-time-slider',
      'media-slider-buffer',
      'media-slider-preview',
      'media-slider-value',
      'media-time-group',
      'media-time',
      'media-playback-rate-button',
    ]) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
  });

  it('puts the LIVE button right after play, carrying its own text', () => {
    expect(template).toMatch(
      /<\/media-play-button>\s*<media-tooltip[\s\S]*?<\/media-tooltip>\s*(?:<!--[^>]*-->\s*)?<media-live-button class="ps-button ps-live-button">/
    );
    expect(template).toContain('<span class="ps-live-text">LIVE</span>');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it('draws the on-demand icons it keeps, and no others', () => {
    const kept = iconPaths(template);

    expect(kept.length).toBe(11);
    expect(kept.filter((path) => !iconPaths(onDemandTemplate).includes(path))).toEqual([]);
  });
});

describe('MediaChromeLiveSkinElement', () => {
  it('registers <media-chrome-live-skin>', () => {
    expect(html).toContain("const TAG_NAME = 'media-chrome-live-skin';");
    expect(html).toContain('export class MediaChromeLiveSkinElement extends BaseElement');
    expect(html).toContain('customElements.define(TAG_NAME, MediaChromeLiveSkinElement)');
  });

  it("keeps a copy of the on-demand package's shadow-root host", () => {
    expect(host(html)).toBe(host(onDemandHtml));
  });
});

describe('MediaChromeLiveSkin', () => {
  it('draws the same icons as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
  });

  it('uses the same class names as the HTML element', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither wrapper as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset with a LIVE button and no seek hotkeys', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function MediaChromeLiveSkin(');
    expect(react).toContain('export type MediaChromeLiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toContain('<LiveButton className="ps-button ps-live-button">');
    expect(react).toContain('<span className="ps-live-text">LIVE</span>');
    expect(react).not.toContain('seekStep');
  });
});

describe('package.json', () => {
  it('publishes as @player.style/media-chrome-live with the base skin package shape', () => {
    expect(pkg.name).toBe('@player.style/media-chrome-live');
    expect(pkg.exports).toEqual(basePkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });
});
