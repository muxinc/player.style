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

/** The `d` attribute of every SVG path, in order; the React component keeps the repeated play glyph in a constant. */
function iconPaths(source: string): string[] {
  const constants = new Map(
    [...source.matchAll(/const ([A-Z]+) = '([^']+)';/g)].map((match) => [match[1]!, match[2]!])
  );

  return [...source.matchAll(/<path\s[^>]*?d=(?:"([^"]+)"|\{([A-Z]+)\})/g)]
    .map((match) => match[1] ?? constants.get(match[2]!)!)
    .sort();
}

const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));

/** The stylesheet with every `@media (hover: hover)` block cut out. */
function outsideHoverMedia(source: string): string {
  const marker = '@media (hover: hover)';
  let out = '';
  let from = 0;

  for (let at = source.indexOf(marker); at >= 0; at = source.indexOf(marker, from)) {
    out += source.slice(from, at);

    let depth = 0;
    let end = source.indexOf('{', at);

    for (; end < source.length; end++) {
      if (source[end] === '{') depth++;
      else if (source[end] === '}' && --depth === 0) break;
    }
    from = end + 1;
  }

  return out + source.slice(from);
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
      (selector) => !/^(?:\.ps-videojs-8(?![\w-])|:where\(\.ps-videojs-8\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-videojs-8-'))).toEqual([]);
  });

  it('declares the level colour from the accent token, over the primary token and white', () => {
    expect(rule('.ps-videojs-8')).toMatch(
      /--ps-accent:\s*var\(--media-accent-color,\s*var\(--media-primary-color,\s*#fff\)\);/
    );
  });

  it("reads the original's foreground and slate from the primary and secondary tokens", () => {
    const declarations = rule('.ps-videojs-8');

    expect(declarations).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\);/);
    expect(declarations).toMatch(/--ps-slate:\s*var\(--media-secondary-color,\s*#2b333f\);/);
    expect(declarations).toMatch(/--ps-bar:\s*color-mix\(in srgb,\s*var\(--ps-slate\) 70%,\s*transparent\);/);
    expect(declarations).toMatch(/--ps-slate-light:\s*rgb\(115 133 159\);/);
    expect(css).toContain('--ps-slate-light: hsl(from var(--ps-slate) h s calc(l + 33));');
  });

  it("keeps the original's fixed pixel geometry", () => {
    expect(rule(':where(.ps-videojs-8) .ps-bar')).toMatch(/height:\s*30px;/);
    expect(rule(':where(.ps-videojs-8) .ps-big-play')).toMatch(/width:\s*90px;[\s\S]*height:\s*49px;/);
    expect(rule(':where(.ps-videojs-8) .ps-spinner')).toMatch(/width:\s*50px;[\s\S]*border:\s*6px solid/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-videojs-8 > video');
    expect(css).toContain('.ps-videojs-8 ::slotted(video)');
  });

  it('shows only the play-head tooltip on a touch screen, and only while dragging', () => {
    const touch = css.slice(css.indexOf('@media (hover: none)', css.indexOf('.ps-mouse-display')));

    expect(touch).toMatch(/\.ps-progress\[data-dragging\] \.ps-play-tooltip \{\s*visibility: visible;/);
  });

  it("takes 8.x's small layout below 425px", () => {
    expect(css).toMatch(/@container ps-videojs-8 \(inline-size < 425px\)/);
  });

  it('never zooms the page on a double tap', () => {
    expect(css).toMatch(/^\.ps-videojs-8 \{[^}]*touch-action: manipulation;/m);
  });

  it('keeps hover states to pointers that hover, so a tap leaves none behind', () => {
    // The volume slide-out keeps `:hover` on purpose: a tap on the mute button opens it, as on 8.x on Android.
    const sticky = ruleSelectors(outsideHoverMedia(css)).filter(
      (selector) => selector.replaceAll(':not(:hover)', '').includes(':hover') && !selector.includes('.ps-volume:is(')
    );

    expect(sticky).toEqual([]);
  });

  it('gives a coarse pointer 44px tap targets', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'));

    expect(coarse).toMatch(/44px/);
  });
});

describe('videojs-8-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-videojs-8" data-theme="videojs-8" data-preset="video">'
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
    expect(html).toContain("const TAG_NAME = 'videojs-8-skin';");
    expect(html).toContain('export class Videojs8SkinElement extends BaseElement');
  });

  it('delays the spinner by 0.3s, as the original did', () => {
    expect(template).toContain('<media-buffering-indicator class="ps-loading" delay="300">');
    expect(react).toContain('<BufferingIndicator className="ps-loading" delay={300}>');
  });
});

describe('Videojs8Skin', () => {
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

  it('is a client component on the video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function Videojs8Skin(');
    expect(react).toContain('export type Videojs8SkinProps = ContainerProps;');
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
