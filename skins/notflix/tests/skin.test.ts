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

/**
 * The `d` attributes of every SVG path, which is what the two editions must agree on. `d={NAME}` resolves through
 * `const NAME = '…'` should the React edition ever hoist a repeated glyph.
 */
function iconPaths(source: string): string[] {
  const constants = new Map(
    [...source.matchAll(/const ([A-Z]+) = '([^']+)';/g)].map((match) => [match[1]!, match[2]!])
  );

  return [...source.matchAll(/<path\s[^>]*?d=(?:"([^"]+)"|\{([A-Z]+)\})/g)]
    .map((match) => match[1] ?? constants.get(match[2]!)!)
    .sort();
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
      (selector) => !/^(?:\.ps-notflix(?![\w-])|:where\(\.ps-notflix\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('honours the public accent token', () => {
    expect(css).toContain('var(--media-accent-color');
  });

  it('declares the brand red on the root from the public accent token', () => {
    const root = css.match(/^\.ps-notflix\s*\{([^}]*)\}/m)?.[1] ?? '';

    expect(root).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#ea3323\)/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-notflix > video');
    expect(css).toContain('.ps-notflix ::slotted(video)');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes', () => {
    expect(template).toMatch(/<media-container class="media-skin ps-notflix" data-theme="notflix"/);
  });

  it('exposes the default, poster, and title slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
    expect(template).toContain('<slot name="title">');
  });

  it('registers every Video.js element it uses', () => {
    const used = new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
    const registered = new Set(
      [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`)
    );
    const missing = [...used].filter((tag) => !registered.has(tag));

    expect(missing).toEqual([]);
  });

  it('links the subtitles button to its menu by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const targets = [...template.matchAll(/\bcommandfor="([^"]+)"/g)].map((match) => match[1]!);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets.filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe('NotflixSkin', () => {
  it('draws the same icons as the HTML edition', () => {
    expect(new Set(iconPaths(react))).toEqual(new Set(iconPaths(template)));
  });

  it('uses the same class names as the HTML edition', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });
});
