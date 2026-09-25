import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
/* The stylesheet is @player.style/essentials's; this package inlines and copies it rather than owning one. */
const css = read('../essentials/src/skin.css');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const viteConfig = read('vite.config.ts');
const onDemand = {
  template: read('../essentials/src/html/template.html'),
  react: read('../essentials/src/react/index.tsx'),
  pkg: JSON.parse(read('../essentials/package.json')) as Record<string, unknown>,
};
const pkg = JSON.parse(read('package.json')) as {
  name: string;
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

/** The `d` attributes of every SVG path, which is what the two frameworks must agree on. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The `ps-*` classes a source uses, in either `class=` or `className=` form. */
function classesIn(source: string): Set<string> {
  return new Set(source.match(/\bps-[a-z-]+/g));
}

/** The `media-*` tags a template stamps. */
function elementsIn(source: string): Set<string> {
  return new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
}

describe('skin.css (shared with @player.style/essentials)', () => {
  it('is the on-demand skin’s stylesheet, inlined by the HTML entry and copied by the build', () => {
    expect(html).toContain("import styles from '../../../essentials/src/skin.css?inline';");
    expect(viteConfig).toContain("stylesheet: '../essentials/src/skin.css'");
  });

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

  it('scopes every rule under the root, so both skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-essentials(?![\w-])|:where\(\.ps-essentials\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour from the accent token, over the original primary and its default', () => {
    const rootRule = css.match(/^\.ps-essentials \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-primary: var(--media-accent-color, var(--media-primary-color, #fff));');
  });

  it("keeps media-chrome's live button tokens with their defaults", () => {
    expect(css).toContain('var(--media-live-button-icon-color, rgb(140 140 140))');
    expect(css).toContain('var(--media-live-button-indicator-color, rgb(255 0 0))');
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-essentials[data-preset="live-video"]'))).toBe(true);
  });

  it('shows the volume range, AirPlay, Cast and opt-in PiP at every width, and the time from 384px', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    for (const control of ['ps-volume-slider', 'ps-airplay-button', 'ps-cast-button', 'ps-pip-button', 'ps-time']) {
      expect(
        live.some((selector) => selector.endsWith(`.${control}`)),
        control
      ).toBe(true);
    }
    expect(css).toMatch(
      /@container ps-essentials \(inline-size >= 384px\) \{\s*\.ps-essentials\[data-preset="live-video"\] \.ps-time \{/
    );
  });

  it('styles every class that exists only for live video', () => {
    const liveOnly = [...classesIn(template)].filter((name) => !classesIn(onDemand.template).has(name));

    expect(liveOnly.sort()).toEqual([
      'ps-live-button',
      'ps-live-indicator',
      'ps-live-left',
      'ps-live-right',
      'ps-live-text',
    ]);
    for (const name of liveOnly) expect(css, name).toContain(`.${name}`);
  });

  it('exempts the Live badge from the disabled look, as the original did', () => {
    expect(css).toContain('.ps-button:not(.ps-live-button):is([data-disabled], [aria-disabled="true"])');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container carrying the theme classes on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-essentials" data-theme="essentials" data-preset="live-video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = elementsIn(template);
    const registered = new Set(
      [...html.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`)
    );

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
  });

  it("drops the seek and time-slider controls the original's live branch dropped", () => {
    const dropped = ['media-seek-button', 'media-time-slider', 'media-slider-preview'];

    for (const tag of dropped) {
      expect(elementsIn(onDemand.template).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
  });

  it('keeps a play button for touch screens only, where a tap on the video does not play', () => {
    expect(template).toMatch(
      /<div class="ps-live-left">\s*<!--[^>]*-->\s*<media-play-button class="ps-button ps-play-button">/
    );
    expect(css).toMatch(/\.ps-essentials\[data-preset="live-video"\] \.ps-play-button \{\s*display: none;/);
    expect(css).toMatch(
      /@media \(pointer: coarse\) \{[\s\S]*?\.ps-essentials\[data-preset="live-video"\] \.ps-play-button \{\s*display: inline-flex;/
    );
  });

  it('leads the bar with a Live button and the time, and pushes the rest to the right', () => {
    expect(template).toMatch(
      /<div class="ps-bar">\s*<div class="ps-live-left">[\s\S]*?<\/media-play-button>\s*<media-live-button class="ps-button ps-live-button">/
    );
    expect(template).toMatch(
      /<media-time class="ps-time" type="current"><\/media-time>\s*<\/div>\s*<div class="ps-live-right">/
    );
    expect(template).toMatch(/<div class="ps-live-right">\s*<media-mute-button/);
  });

  it("gives the Live button the theme's own text and indicator, so Video.js injects no badge", () => {
    expect(template).toContain('<span class="ps-live-text">Live</span>');
    expect(template).toContain('<rect width="8" height="8" rx="2" />');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemand.template).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it("reuses the on-demand package's icons unchanged", () => {
    const shared = new Set(iconPaths(onDemand.template));

    expect(iconPaths(template).every((path) => shared.has(path))).toBe(true);
  });
});

describe('EssentialsLiveSkinElement', () => {
  /** The shadow-root boilerplate: from the host styles to the end of the constructor, with the tag name blanked. */
  function host(entry: string): string {
    const start = entry.indexOf('/* The host is a plain box');
    const end = entry.indexOf('\n}\n', entry.indexOf('constructor() {'));

    return entry
      .slice(start, end)
      .replace(/essentials-live-skin|essentials-skin/g, '<tag>')
      .replace(/EssentialsLiveSkinElement|EssentialsSkinElement/g, '<class>')
      .replace(/^\/\*\*[\s\S]*?\*\/\n(?=export class)/m, '');
  }

  it('keeps its copy of the shadow-root host in step with the on-demand element', () => {
    const onDemandHtml = read('../essentials/src/html/index.ts');

    expect(host(html).length).toBeGreaterThan(1000);
    expect(host(html)).toBe(host(onDemandHtml));
  });
});

describe('EssentialsLiveSkin', () => {
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

  it('is a client component on the live-video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function EssentialsLiveSkin(');
    expect(react).toContain('export type EssentialsLiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
  });

  it('leads with a LiveButton and keeps no seek hotkeys', () => {
    expect(react).toMatch(
      /<div className="ps-bar">\s*<div className="ps-live-left">[\s\S]*?<\/PlayButton>\s*<LiveButton className="ps-button ps-live-button">/
    );
    expect(react).not.toContain('seekStep');
  });
});

describe('package.json', () => {
  it('is its own package with the same entry points as the on-demand skin', () => {
    expect(pkg.name).toBe('@player.style/essentials-live');
    expect(Object.keys(pkg.exports)).toEqual(['./html', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.exports['./html']).toEqual({ types: './dist/types/html/index.d.ts', default: './dist/html.js' });
    expect(pkg.exports['./react']).toEqual({ types: './dist/types/react/index.d.ts', default: './dist/react.js' });
    expect(pkg.exports['./skin.css']).toBe('./dist/skin.css');
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the same peer dependencies as the on-demand skin', () => {
    expect(pkg.peerDependencies).toEqual(onDemand.pkg.peerDependencies);
  });
});
