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
  exports: Record<string, unknown>;
  sideEffects: string[];
  peerDependencies: Record<string, string>;
};

const withoutComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every selector list in the stylesheet, `@`-rule preludes, keyframe steps and `data:` URLs left out. */
function selectors(source: string): string[] {
  return withoutComments(source)
    .replace(/url\("data:[^"]*"\)/g, 'url()')
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .split('}')
    .flatMap((block) => block.split('{')[0]?.split(',') ?? [])
    .map((selector) => selector.trim())
    .filter((selector) => selector && !selector.startsWith('@') && !selector.startsWith('--'));
}

/** Top-level selectors of every style rule: commas inside `:is()`/`:not()` stay put, keyframe steps are left out. */
function ruleSelectors(source: string): string[] {
  return withoutComments(source)
    .replace(/url\("data:[^"]*"\)/g, 'url()')
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
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!);
}

const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));
const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));

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
        .some((compound) => /^[a-z]/i.test(compound) && compound !== 'video' && !compound.startsWith('::'))
    );

    expect(bare).toEqual([]);
  });

  it('scopes every rule under the root, so several skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-videojs-4(?![\w-])|:where\(\.ps-videojs-4\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes, which are global', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-videojs-4-'))).toEqual([]);
  });

  it('declares the slider blue on the root from the public accent token', () => {
    const rootBlock = css.match(/^\.ps-videojs-4\s*\{([^}]*)\}/m)?.[1] ?? '';

    expect(rootBlock).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#66a8cc\)/);
    expect(rootBlock).toMatch(/--ps-color:\s*var\(--media-primary-color,\s*#ccc\)/);
    expect(rootBlock).toMatch(/--ps-bar:\s*var\(--media-secondary-color,\s*rgb\(7 20 30 \/ 0\.7\)\)/);
  });

  it('paints both striped fills with the accent under the original 6x6 stripe image', () => {
    const striped = [...withoutComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, , body]) => body!.includes('var(--ps-accent) var(--ps-stripes) -50% 0 repeat'))
      .map(([, prelude]) => prelude!.trim());

    expect(striped).toEqual([':where(.ps-videojs-4) .ps-progress-fill', ':where(.ps-videojs-4) .ps-volume-level']);
    expect(css).toContain(
      'iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAP0lEQVQIHWWMAQoAIAgDR/QJ/Ub//04+w7ZICBwcOg5FZi5iBB82AGzixEglJrd4TVK5XUJpskSTEvpdFzX9AB2pGziSQcvAAAAAAElFTkSuQmCC'
    );
  });

  it('grows the progress strip and lights the big play button while the pointer is anywhere over the player', () => {
    expect(css).toMatch(/\.ps-videojs-4:hover \.ps-progress \{[^}]*height: 9px/);
    expect(css).toMatch(/\.ps-videojs-4:hover \.ps-big-play \{[^}]*border-color: #fff/);
  });

  it('holds the progress strip at its hovered 9px on a coarse pointer', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'));

    expect(coarse).toMatch(/:where\(\.ps-videojs-4\) \.ps-progress \{\s*height: 9px;/);
  });

  it('never zooms the page on a double tap', () => {
    expect(css).toMatch(/^\.ps-videojs-4 \{[^}]*touch-action: manipulation;/m);
  });

  it('keeps hover states to pointers that hover, so a tap leaves none behind', () => {
    const sticky = ruleSelectors(outsideHoverMedia(css)).filter((selector) =>
      selector.replaceAll(':not(:hover)', '').includes(':hover')
    );

    expect(sticky).toEqual([]);
  });

  it('gives a coarse pointer 44px tap targets', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'));

    expect(coarse).toMatch(/44px/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-videojs-4 > video');
    expect(css).toContain('.ps-videojs-4 ::slotted(video)');
  });
});

describe('videojs-4-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-videojs-4" data-theme="videojs-4" data-preset="video">'
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

  it('defines its own tag and class', () => {
    expect(html).toContain("const TAG_NAME = 'videojs-4-skin';");
    expect(html).toContain('export class Videojs4SkinElement extends BaseElement');
  });

  it('draws every icon from the 4.12.15 icon font, flipped out of its y-up em', () => {
    const svgs = [...template.matchAll(/<svg\b[^>]*viewBox="([^"]+)"[^>]*>\s*<path\s+transform="([^"]+)"/g)];

    expect(svgs).toHaveLength(11);
    expect(new Set(svgs.map((match) => match[2]))).toEqual(new Set(['matrix(1 0 0 -1 0 960)']));
  });
});

describe('Videojs4Skin', () => {
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
    expect(react).toContain('export function Videojs4Skin(');
    expect(react).toContain('export type Videojs4SkinProps = ContainerProps;');
    expect(react).toContain('data-preset="video"');
  });
});

describe('package.json', () => {
  it('exports the HTML element and React component, the stylesheet and the open files, with html.js and skin.css as side effects', () => {
    expect(Object.keys(pkg.exports)).toEqual(['./html', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the Video.js peers exactly', () => {
    expect(pkg.peerDependencies['@videojs/html']).toBe('10.0.0-rc.2');
    expect(pkg.peerDependencies['@videojs/react']).toBe('10.0.0-rc.2');
  });
});
