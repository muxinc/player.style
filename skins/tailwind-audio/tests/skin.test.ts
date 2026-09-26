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
      (selector) => !/^(?:\.ps-tailwind-audio(?![\w-])|:where\(\.ps-tailwind-audio\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('honours the public accent token', () => {
    expect(css).toContain('var(--media-accent-color');
  });

  it('declares the brand indigo on the root from the accent token', () => {
    const rootRule = css.match(/^\.ps-tailwind-audio \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*rgb\(79 70 229\)\);/);
  });

  it('ships plain CSS, with no Tailwind directives or utility class names left over', () => {
    expect(css).not.toMatch(/@(?:tailwind|apply|config|layer|theme|source)\b/);
    expect(css).not.toMatch(/--tw-/);

    const classes = new Set(css.replace(/\/\*[\s\S]*?\*\//g, '').match(/\.-?[a-z_\\][\w\\:/@[\]-]*/gi));

    expect([...classes].filter((name) => !name.startsWith('.ps-'))).toEqual([]);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-tailwind-audio > audio');
    expect(css).toContain('.ps-tailwind-audio ::slotted(:not([slot]))');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes', () => {
    expect(template).toMatch(
      /<media-container class="media-skin ps-tailwind-audio" data-theme="tailwind-audio" data-preset="audio">/
    );
  });

  it('exposes the default slot for the audio, and no artwork or title slots (the original had none)', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).not.toMatch(/<slot\s+[^>]*name=/);
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

describe('TailwindAudioSkin', () => {
  it('sits on the audio preset, as the HTML element does', () => {
    expect(react).toContain('data-preset="audio"');
  });

  it('carries no element ids, which several players on one page would duplicate', () => {
    expect(template).not.toMatch(/\sid="/);
    expect(react).not.toMatch(/\sid="/);
  });

  it('draws the same icons as the HTML element', () => {
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML element', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
