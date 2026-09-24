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
      (selector) => !/^(?:\.ps-sutro-audio(?![\w-])|:where\(\.ps-sutro-audio\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('honours the public accent token', () => {
    expect(css).toContain('var(--media-accent-color');
  });

  it('declares the brand blue on the root from the accent token and paints the card with it', () => {
    const rootRule = css.match(/^\.ps-sutro-audio \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toMatch(/--ps-brand:\s*var\(--media-accent-color,\s*var\(--media-secondary-color,\s*#17507b\)\);/);
    expect(rootRule).toMatch(/background:\s*var\(--ps-brand\);/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-sutro-audio > audio');
    expect(css).toContain('.ps-sutro-audio ::slotted(audio)');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes', () => {
    expect(template).toMatch(
      /<media-container class="media-skin ps-sutro-audio" data-theme="sutro-audio" data-preset="audio">/
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
    expect(template).toContain('name="byline"');
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

describe('SutroAudioSkin', () => {
  it('sits on the audio preset, as the HTML edition does', () => {
    expect(react).toContain('data-preset="audio"');
  });

  it('carries no element ids, which several players on one page would duplicate', () => {
    expect(template).not.toMatch(/\sid="/);
    expect(react).not.toMatch(/\sid="/);
  });

  it('draws the same icons as the HTML edition', () => {
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML edition', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition takes the byline through a slot (`.ps-byline-slot`); React takes it as a prop and renders it
    // in a span (`.ps-byline`).
    htmlClasses.delete('ps-byline-slot');
    reactClasses.delete('ps-byline');

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
