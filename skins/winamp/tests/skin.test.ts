import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const css = readFileSync(join(root, 'src/skin.css'), 'utf8');
const template = readFileSync(join(root, 'src/html/template.html'), 'utf8');
const html = readFileSync(join(root, 'src/html/index.ts'), 'utf8');
const react = readFileSync(join(root, 'src/react/index.tsx'), 'utf8');

/** The Media Chrome edition's artwork, when the repository still carries it. */
const legacyAssets = join(root, '../../themes/winamp/assets');

/** Every selector list in the stylesheet, comments and keyframe steps stripped, `@`-rule preludes left out. */
function selectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
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
    [...source.matchAll(/--ps-img-([a-z]+): url\("data:image\/(?:png|gif);base64,([A-Za-z0-9+/=]+)"\)/g)].map(
      (match) => [match[1]!, match[2]!]
    )
  );
}

/** Every class list in markup, in document order. */
function classLists(source: string, attribute: 'class' | 'className'): string[] {
  return [...source.matchAll(new RegExp(`\\b${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]!);
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
      (selector) => !/^(?:\.ps-winamp(?![\w-])|:where\(\.ps-winamp\)[\s:]|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour on the root from the public accent token', () => {
    const rootRule = /^\.ps-winamp \{([\s\S]*?)^\}/m.exec(css)?.[1] ?? '';

    expect(rootRule).toContain('--ps-accent: var(--media-accent-color, #00e201);');
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    // The media sits in the video window's screen, not directly under the root.
    expect(css).toContain('.ps-winamp .ps-screen > video');
    expect(css).toContain('.ps-winamp .ps-screen ::slotted(video)');
  });

  it('prefixes its keyframes, since the React stylesheet is global', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name!.startsWith('ps-winamp-'))).toEqual([]);
  });

  it('inlines its artwork and uses every piece of it', () => {
    const tokens = artwork(css);
    const unused = [...tokens.keys()].filter((name) => !css.includes(`var(--ps-img-${name})`));

    expect(tokens.size).toBe(23);
    expect(unused).toEqual([]);
    expect(css).not.toMatch(/url\((?!"data:)/);
  });

  it.runIf(existsSync(legacyAssets))('carries the original bitmaps byte for byte', () => {
    const tokens = artwork(css);
    // The theme also ships BMP sources, an unused FULLSCREEN.png, and fonts its template never loads.
    const files = new Map(
      readdirSync(legacyAssets)
        .filter((file) => /\.(?:png|gif)$/.test(file) && file !== 'FULLSCREEN.png')
        .map((file) => [file.replace(/\.\w+$/, '').toLowerCase(), file])
    );

    expect([...tokens.keys()].sort()).toEqual([...files.keys()].sort());

    for (const [name, file] of files) {
      expect(tokens.get(name), name).toBe(readFileSync(join(legacyAssets, file)).toString('base64'));
    }
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes', () => {
    expect(template).toMatch(/<media-container class="media-skin ps-winamp" data-theme="winamp"/);
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

describe('WinampSkin', () => {
  it('renders the same class lists, in the same order, as the HTML edition', () => {
    // The HTML edition alone wraps the error dialog in its root element (`.ps-dialog`); React's root renders nothing.
    // Its root container's classes are set on `Container` through `classNames()`.
    const htmlLists = classLists(template, 'class').filter((list) => list !== 'ps-dialog');

    expect(htmlLists.shift()).toBe('media-skin ps-winamp');
    expect(react).toContain("classNames('media-skin ps-winamp', className)");
    expect(classLists(react, 'className')).toEqual(htmlLists);
  });

  it('keeps the tap gesture off the same chrome as the HTML edition', () => {
    const count = (source: string) => source.match(/ data-interactive(?:="")?[\s/>]/g)?.length ?? 0;

    expect(count(template)).toBe(5);
    expect(count(react)).toBe(count(template));
  });

  it('keeps the same visible text as the HTML edition', () => {
    for (const text of ['Video.js, it really whips the llama', 's ass!', '>192<', '>44<', 'Dismiss']) {
      expect(template, text).toContain(text);
      expect(react, text).toContain(text);
    }

    expect(template).not.toContain('Media Chrome, it really');
  });
});
