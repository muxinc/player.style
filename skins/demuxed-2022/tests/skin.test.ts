import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const css = readFileSync(join(root, 'src/skin.css'), 'utf8');
const template = readFileSync(join(root, 'src/html/template.html'), 'utf8');
const html = readFileSync(join(root, 'src/html/index.ts'), 'utf8');
const react = readFileSync(join(root, 'src/react/index.tsx'), 'utf8');

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

/** The `d` attributes of every SVG path, which is what the two editions must agree on. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!).sort();
}

describe('skin.css', () => {
  it('targets classes and state, never tag names', () => {
    const bare = selectors(css).filter((selector) =>
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
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-demuxed-2022(?![\w-])|:where\(\.ps-demuxed-2022\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour from the accent token, over the original tertiary colour and its default', () => {
    const rootRule = css.match(/^\.ps-demuxed-2022 \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-accent: var(--media-accent-color, var(--media-tertiary-color, #7596cc));');
  });

  it("keeps the original's colour and range tokens, and media-chrome's live-button tokens, with their defaults", () => {
    for (const token of [
      'var(--media-primary-color, #000)',
      'var(--media-secondary-color, #fff)',
      'var(--media-text-color, #fff)',
      'var(--media-range-track-background, rgb(0 0 0 / 0.4))',
      'var(--media-range-bar-color, #fff)',
      'var(--media-range-thumb-background, var(--ps-accent))',
      'var(--media-live-button-icon-color, rgb(140 140 140))',
      'var(--media-live-button-indicator-color, rgb(255 0 0))',
    ]) {
      expect(css, token).toContain(token);
    }
  });

  it("keys the live edition's layout rules on the live-video preset inside the root scope", () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-demuxed-2022[data-preset="live-video"]'))).toBe(true);
  });

  it('has no reduced-motion rules, as the original had none', () => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('prefers-reduced-motion');
  });

  it("inlines the theme's scrim as the only image", () => {
    const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)/g)].map((match) => match[1]!);

    expect(urls).toHaveLength(1);
    expect(urls[0]).toMatch(/^data:image\/png;base64,/);
  });

  it('switches to the mobile layout below the original sm:600 breakpoint', () => {
    expect(css).toContain('@container ps-demuxed-2022 (inline-size < 600px)');
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-demuxed-2022 > video');
    expect(css).toContain('.ps-demuxed-2022 ::slotted(video)');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-demuxed-2022" data-theme="demuxed-2022" data-preset="video">'
    );
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
});

describe('Demuxed2022Skin', () => {
  it('draws the same icons as the HTML edition', () => {
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML edition', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
