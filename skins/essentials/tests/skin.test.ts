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

/** The `d` attributes of every SVG path, which is what the two frameworks must agree on. */
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
      (selector) => !/^(?:\.ps-essentials(?![\w-])|:where\(\.ps-essentials\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour from the accent token, over the original primary and its default', () => {
    const rootRule = css.match(/^\.ps-essentials \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-primary: var(--media-accent-color, var(--media-primary-color, #fff));');
  });

  it("keeps the original's secondary token and the media-chrome tokens it set, with their defaults", () => {
    expect(css).toContain('var(--media-secondary-color, #000)');
    expect(css).toContain(
      'var(--media-text-color, var(--media-accent-color, var(--media-primary-color, rgb(238 238 238))))'
    );
    expect(css).toContain('var(--media-icon-color, var(--ps-primary))');
    expect(css).toContain('var(--media-range-bar-color, var(--ps-primary))');
    expect(css).toContain('var(--media-range-track-background, rgb(255 255 255 / 0.5))');
    expect(css).toContain('var(--media-time-range-buffered-color, rgb(255 255 255 / 0.4))');
    expect(css).toContain('var(--media-preview-thumbnail-border-radius, 2px)');
  });

  // The rules keyed on `data-preset="live-video"` belong to `@player.style/essentials-live`, whose tests cover them.
  it('hides unavailable controls with the last rule, which out-ranks every display rule before it', () => {
    const rules = ruleSelectors(css);

    expect(rules.at(-2)).toBe(
      '.ps-essentials .ps-button:is([data-hidden], [data-availability="unavailable"], [data-availability="unsupported"])'
    );
    expect(rules.at(-1)).toBe('.ps-essentials .ps-volume-slider:is([data-hidden], [data-availability="unsupported"])');
  });

  it('has no reduced-motion rules, as the original had none', () => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('prefers-reduced-motion');
  });

  it('keeps the original opt-in controls behind their custom properties', () => {
    for (const name of ['seek-backward-button', 'seek-forward-button', 'pip-button']) {
      expect(css).toContain(`var(--media-control-display, var(--media-${name}-display, none))`);
    }
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-essentials > video');
    expect(css).toContain('.ps-essentials ::slotted(video)');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-essentials" data-theme="essentials" data-preset="video">'
    );
    // The live-video package (`@player.style/essentials-live`) alone carries the live-video preset.
    expect(template).not.toContain('live-video');
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
    const registered = new Set(
      [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`)
    );

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
  });
});

describe('EssentialsSkin', () => {
  it('draws the same icons as the HTML element', () => {
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML element', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
