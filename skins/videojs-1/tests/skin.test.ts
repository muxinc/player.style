import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const css = read('src/skin.css');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const pkg = JSON.parse(read('package.json')) as {
  sideEffects: string[];
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
};

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

/** The spinner's dots as `cx cy r`, in document order. */
function spinnerDots(source: string): string[] {
  return [...source.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map((match) =>
    match.slice(1).join(' ')
  );
}

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
      (selector) => !/^(?:\.ps-videojs-1(?![\w-])|:where\(\.ps-videojs-1\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes, which are global', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-videojs-1-'))).toEqual([]);
  });

  it('declares the aqua on the root from the public accent token, and the gradient ends from the classic tokens', () => {
    const rootRule = css.match(/^\.ps-videojs-1\s*\{([^}]*)\}/m)?.[1] ?? '';

    expect(rootRule).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#1f3744\)/);
    expect(rootRule).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*#0b151a\)/);
    expect(rootRule).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\)/);
  });

  it('paints every pill and the big play button with the offset gradient that gives the glossy split', () => {
    expect(css).toContain('var(--ps-accent) linear-gradient(var(--ps-secondary), var(--ps-accent)) 0 12px');
    expect(css).toContain('var(--ps-accent) linear-gradient(var(--ps-secondary), var(--ps-accent)) 0 40px');
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-videojs-1 > video');
    expect(css).toContain('.ps-videojs-1 ::slotted(video)');
  });

  it('keeps the bar hidden until the first play', () => {
    expect(css).toMatch(
      /:where\(\.ps-videojs-1\) \.ps-big-play-button:not\(\[data-started\]\) ~ \.ps-bar,\s*:where\(\.ps-videojs-1\) \.ps-big-play-button:not\(\[data-started\]\) ~ \* \.ps-bar \{\s*display: none;/
    );
  });

  it('keeps the progress capsule its room on a narrow player', () => {
    expect(css).toMatch(/@container ps-videojs-1 \(inline-size < 340px\)/);
    expect(css).toMatch(/@container ps-videojs-1 \(inline-size < 300px\)/);
  });

  it('drops the volume pill where the slider cannot set the volume', () => {
    expect(css).toMatch(
      /\.ps-volume:not\(:has\(\.ps-volume-slider:not\(\[data-availability="unsupported"\]\)\)\) \{\s*display: none;/
    );
  });

  it('never zooms the page on a double tap', () => {
    expect(css).toMatch(/^\.ps-videojs-1 \{[^}]*touch-action: manipulation;/m);
  });

  it('keeps hover states to pointers that hover, so a tap leaves none behind', () => {
    const sticky = ruleSelectors(outsideHoverMedia(css)).filter((selector) =>
      selector.replaceAll(':not(:hover)', '').includes(':hover')
    );

    expect(sticky).toEqual([]);
  });

  it('gives a coarse pointer 44px tap targets: 39px pills with the 5px gaps', () => {
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'));

    expect(coarse).toMatch(/width: 39px;/);
  });

  it('snaps the volume fill to whole 7px bars', () => {
    expect(css).toContain('round(up, var(--media-slider-fill, 0%), 7px)');
  });
});

describe('template.html', () => {
  it('roots the skin in a video media-container carrying the theme classes', () => {
    expect(template).toMatch(
      /<media-container class="media-skin ps-videojs-1" data-theme="videojs-1" data-preset="video">/
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers exactly the Video.js elements it uses', () => {
    const used = new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
    const registered = new Set(
      [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`)
    );

    expect([...registered].sort()).toEqual([...used].sort());
  });

  it('has no mute button, as the original had none', () => {
    expect(template).not.toContain('media-mute-button');
    expect(template).toContain('action="toggleMuted"');
  });
});

describe('Videojs1Skin', () => {
  it('is a client component on the video preset', () => {
    expect(react.startsWith("'use client';")).toBe(true);
    expect(react).toContain('data-theme="videojs-1"');
    expect(react).toContain('data-preset="video"');
  });

  it('draws the same icons as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
  });

  it('draws the same spinner as the HTML element', () => {
    expect(spinnerDots(template)).toHaveLength(8);
    expect(spinnerDots(react)).toEqual(spinnerDots(template));
  });

  it('uses the same class names as the HTML element', () => {
    const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
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
