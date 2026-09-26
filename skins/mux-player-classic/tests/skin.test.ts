import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');
const css = read('src/skin.css');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const pkg = JSON.parse(read('package.json')) as {
  sideEffects: string[];
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
};

/** Every selector list in the stylesheet, comments and `@`-rule preludes stripped. */
function selectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@[^{;]+/g, '')
    .split('}')
    .flatMap((block) => block.split('{')[0]?.split(',') ?? [])
    .map((selector) => selector.trim())
    .filter(Boolean);
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

/** The declarations of the first rule whose prelude is exactly `prelude`. */
function rule(prelude: string): string {
  const escaped = prelude.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return css.match(new RegExp(`^${escaped}\\s*\\{([^}]*)\\}`, 'm'))?.[1] ?? '';
}

/**
 * The distinct `d` attributes of the SVG paths, sorted. The React component keeps each repeated glyph (play, pause,
 * seek, cast, check, CC) in a constant and draws it through a small component, so repeats are counted once.
 */
function iconPaths(source: string): string[] {
  const constants = new Map(
    [...source.matchAll(/const ([A-Z_]+) =\s*'([^']+)';/g)].map((match) => [match[1]!, match[2]!])
  );

  return [
    ...new Set(
      [...source.matchAll(/<path\s[^>]*?d=(?:"([^"]+)"|\{([A-Z_]+)\})/g)].map(
        (match) => match[1] ?? constants.get(match[2]!)!
      )
    ),
  ].sort();
}

const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));

describe('skin.css', () => {
  it('targets classes and state, never tag names', () => {
    const bare = selectors(css).filter((selector) =>
      selector
        .split(/[\s>+~]+/)
        .some(
          (compound) =>
            /^[a-z]/i.test(compound) &&
            !/^(?:video|audio|img)(?:::[\w-]+)?$/.test(compound) &&
            !compound.startsWith('::')
        )
    );

    expect(bare).toEqual([]);
  });

  it('scopes every rule under the root, so several skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-mux-player-classic(?![\w-])|:where\(\.ps-mux-player-classic\)[\s:])/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares no keyframes, or prefixes them with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.filter((name) => !name.startsWith('ps-mux-player-classic-'))).toEqual([]);
  });

  it('declares the level colour from the accent token, over the primary token and white', () => {
    expect(rule('.ps-mux-player-classic')).toMatch(
      /--ps-accent:\s*var\(--media-accent-color,\s*var\(--media-primary-color,\s*#fff\)\);/
    );
  });

  it("reads the theme's primary and secondary colours and media-chrome's font from the public tokens", () => {
    const declarations = rule('.ps-mux-player-classic');

    expect(declarations).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\);/);
    expect(declarations).toMatch(/--ps-text:\s*var\(--media-primary-color,\s*rgb\(238 238 238\)\);/);
    expect(declarations).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*rgb\(0 0 0 \/ 0\.75\)\);/);
    expect(declarations).toMatch(
      /--ps-font-family:\s*var\(--media-font-family,\s*"helvetica neue",\s*"segoe ui",\s*roboto,\s*arial,\s*sans-serif\);/
    );
  });

  it("keeps the theme's geometry: a 42px bar (32px under 300px), a 4px track and a 100px volume range", () => {
    expect(rule(':where(.ps-mux-player-classic) .ps-layer')).toMatch(/--ps-bar-height:\s*32px;/);
    expect(css).toMatch(
      /\(inline-size >= 300px\)\s*\{\s*:where\(\.ps-mux-player-classic\) \.ps-layer\s*\{\s*--ps-bar-height:\s*42px;/
    );
    expect(rule(':where(.ps-mux-player-classic) .ps-time-slider')).toMatch(
      /bottom:\s*calc\(var\(--ps-bar-height\) - 3px\);/
    );
    expect(css).toMatch(/\.ps-volume-track \{[^}]*height:\s*4px;/);
    expect(rule(':where(.ps-mux-player-classic) .ps-volume')).toMatch(
      /width:\s*min\(100%, 100px\);[\s\S]*padding:\s*0 10px;/
    );
    expect(rule(':where(.ps-mux-player-classic) .ps-center-play')).toMatch(/width:\s*max\(43px, min\(10cqi, 55px\)\);/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-mux-player-classic > video');
    expect(css).toContain('.ps-mux-player-classic ::slotted(video)');
  });
});

describe('mux-player-classic-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-mux-player-classic" data-theme="mux-player-classic" data-preset="video">'
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

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'mux-player-classic-skin';");
    expect(html).toContain('export class MuxPlayerClassicSkinElement extends BaseElement');
  });

  it("seeks by the theme's 10 seconds and shows the loading arc after media-chrome's 0.5s", () => {
    expect(template.match(/<media-seek-button [^>]*seconds="-?10"/g)).toHaveLength(4);
    expect(react.match(/<SeekButton [^>]*seconds=\{-?10\}/g)).toHaveLength(4);
    expect(template).toContain('<media-buffering-indicator class="ps-loading" delay="500">');
    expect(react).toContain('<BufferingIndicator className="ps-loading" delay={500}>');
  });

  it('opens each menu from its button, above it and aligned to its start', () => {
    for (const id of ['mpc-quality', 'mpc-audio', 'mpc-captions']) {
      expect(template).toContain(`commandfor="${id}"`);
      expect(template).toMatch(new RegExp(`<media-menu class="[^"]+" id="${id}" side="top" align="start">`));
    }
    expect(react.match(/<Menu\.Root side="top" align="start">/g)).toHaveLength(3);
  });
});

describe('MuxPlayerClassicSkin', () => {
  it('draws the same icons as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
  });

  it('uses the same class names as the HTML element', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('registers the same hotkeys as the HTML element', () => {
    const htmlKeys = [...template.matchAll(/<media-hotkey keys="([^"]+)" action="(\w+)"(?: value="([^"]+)")?/g)].map(
      (m) => `${m[1]!.replace('&gt;', '>').replace('&lt;', '<')} ${m[2]} ${m[3] ?? ''}`
    );
    const reactKeys = [...react.matchAll(/<Hotkey keys="([^"]+)" action="(\w+)"(?: value=\{([^}]+)\})?/g)].map(
      (m) => `${m[1]} ${m[2]} ${m[3] ?? ''}`
    );

    expect(reactKeys).toEqual(htmlKeys);
  });

  it('is a client component on the video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function MuxPlayerClassicSkin(');
    expect(react).toContain('export type MuxPlayerClassicSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="video"');
  });
});

describe('package.json', () => {
  it('exports the HTML element and React component, the stylesheet and the open files, with html.js and skin.css as side effects', () => {
    expect(Object.keys(pkg.exports)).toEqual(['./html', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the Video.js peers exactly', () => {
    expect(pkg.peerDependencies['@videojs/html']).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/);
    expect(pkg.peerDependencies['@videojs/react']).toBe(pkg.peerDependencies['@videojs/html']);
  });
});
