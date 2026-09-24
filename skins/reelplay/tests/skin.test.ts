import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const css = readFileSync(join(root, 'src/skin.css'), 'utf8');
const template = readFileSync(join(root, 'src/html/template.html'), 'utf8');
const html = readFileSync(join(root, 'src/html/index.ts'), 'utf8');
const react = readFileSync(join(root, 'src/react/index.tsx'), 'utf8');

/** The Media Chrome edition's artwork, when the repository still carries it. */
const legacyAssets = join(root, '../../themes/reelplay/assets');

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

/** The `--ps-img-*` artwork tokens, name to base64 payload. */
function artwork(source: string): Map<string, string> {
  return new Map(
    [...source.matchAll(/--ps-img-([a-z-]+): url\("data:image\/png;base64,([A-Za-z0-9+/=]+)"\)/g)].map((match) => [
      match[1]!,
      match[2]!,
    ])
  );
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
      (selector) => !/^(?:\.ps-reelplay(?![\w-])|:where\(\.ps-reelplay\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('honours the public accent token', () => {
    expect(css).toContain('var(--media-accent-color');
  });

  it('declares the brand teal on the root from the public accent token', () => {
    const root = css.match(/^\.ps-reelplay\s*\{([^}]*)\}/m)?.[1] ?? '';

    expect(root).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#008484\)/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-reelplay > video');
    expect(css).toContain('.ps-reelplay ::slotted(video)');
  });

  it('inlines its artwork and uses every piece of it', () => {
    const tokens = artwork(css);
    const unused = [...tokens.keys()].filter((name) => !css.includes(`var(--ps-img-${name})`));

    expect(tokens.size).toBe(13);
    expect(unused).toEqual([]);
    expect(css).not.toMatch(/url\((?!"data:)/);
  });

  it.runIf(existsSync(legacyAssets))('carries the original PNGs byte for byte', () => {
    const tokens = artwork(css);
    // The theme ships `speaker-inactive.png` but draws `speaker-inactive-2.png`; the port keeps the one it draws.
    const files = new Map(
      readdirSync(legacyAssets)
        .filter((file) => file.endsWith('.png') && file !== 'speaker-inactive.png')
        .map((file) => [file.replace(/(?:-2)?\.png$/, ''), file])
    );

    expect([...tokens.keys()].sort()).toEqual([...files.keys()].sort());

    for (const [name, file] of files) {
      expect(tokens.get(name), name).toBe(readFileSync(join(legacyAssets, file)).toString('base64'));
    }
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes', () => {
    expect(template).toMatch(/<media-container class="media-skin ps-reelplay" data-theme="reelplay"/);
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
});

describe('ReelplaySkin', () => {
  it('draws the same artwork slots as the HTML edition', () => {
    const glyphs = (source: string) => [...source.matchAll(/\bps-icon-[a-z-]+/g)].map((match) => match[0]).sort();
    // React renders the four play-state buttons through one helper, so its two glyph spans appear once, not four times.
    const htmlGlyphs = new Set(glyphs(template));

    expect(new Set(glyphs(react))).toEqual(htmlGlyphs);
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

  it('keeps the same visible text as the HTML edition', () => {
    for (const text of ['ReelPlay: Welcome!', '32.1 Kbps', 'Theme by @davekiss', 'Powered by', 'https://mux.com']) {
      expect(template, text).toContain(text);
      expect(react, text).toContain(text);
    }
  });
});
