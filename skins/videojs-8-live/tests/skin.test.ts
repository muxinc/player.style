import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');
/* The stylesheet is @player.style/videojs-8's; this package inlines and copies it rather than owning one. */
const css = read('../videojs-8/src/skin.css');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const viteConfig = read('vite.config.ts');
const onDemand = {
  template: read('../videojs-8/src/html/template.html'),
  html: read('../videojs-8/src/html/index.ts'),
  react: read('../videojs-8/src/react/index.tsx'),
  pkg: JSON.parse(read('../videojs-8/package.json')) as { exports: unknown; peerDependencies: unknown },
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

describe('skin.css (shared with @player.style/videojs-8)', () => {
  it("is the on-demand skin's stylesheet, inlined by the HTML entry and copied by the build", () => {
    expect(html).toContain("import styles from '../../../videojs-8/src/skin.css?inline';");
    expect(viteConfig).toContain("stylesheet: '../videojs-8/src/skin.css'");
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
      (selector) => !/^(?:\.ps-videojs-8(?![\w-])|:where\(\.ps-videojs-8\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-videojs-8[data-preset="live-video"]'))).toBe(true);
  });

  it('styles every class that exists only for live video, and only under the live-video preset', () => {
    const liveOnly = [...classesIn(template)].filter((name) => !classesIn(onDemand.template).has(name));

    expect(liveOnly.sort()).toEqual(['ps-live-button', 'ps-live-control', 'ps-live-indicator', 'ps-live-text']);
    for (const name of liveOnly) {
      const rules = ruleSelectors(css).filter((selector) => new RegExp(`\\.${name}(?![\\w-])`).test(selector));

      expect(rules.length, name).toBeGreaterThan(0);
      expect(
        rules.every((selector) => selector.startsWith('.ps-videojs-8[data-preset="live-video"]')),
        name
      ).toBe(true);
    }
  });

  it("colours the dot from the live button tokens, with the original's grey and red", () => {
    expect(css).toContain('fill: var(--media-live-button-icon-color, #888);');
    expect(css).toMatch(
      /\.ps-live-button\[data-live-edge\] \.ps-live-indicator \{\s*fill: var\(--media-live-button-indicator-color, #f00\);/
    );
  });
});

describe('videojs-8-live-skin', () => {
  it("roots the skin in the on-demand skin's media-container, on the live-video preset", () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-videojs-8" data-theme="videojs-8" data-preset="live-video">'
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

  it('drops the progress bar, its tooltips and the remaining time, and keeps no seek hotkeys', () => {
    for (const tag of ['media-time-slider', 'media-slider-preview', 'media-slider-value', 'media-time']) {
      expect(elementsIn(onDemand.template).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
    expect(template).not.toContain('seekStep');
    expect(react).not.toContain('seekStep');
  });

  it('puts the live control where the progress bar was, right of the volume panel', () => {
    expect(template).toMatch(
      /<\/media-volume-slider>\s*<\/div>\s*<\/div>\s*(?:<!--[\s\S]*?-->\s*)?<div class="ps-live-control">\s*<media-live-button class="ps-live-button">/
    );
    expect(template).toMatch(/<\/media-live-button>\s*<\/div>\s*<media-captions-button/);
  });

  it('gives the live button its own dot and LIVE, so Video.js injects no badge', () => {
    expect(template).toContain('<circle cx="24" cy="24" r="20" />');
    expect(template).toContain('<span class="ps-live-text">LIVE</span>');
  });

  it("reuses the on-demand package's icons unchanged", () => {
    const shared = new Set(iconPaths(onDemand.template));

    expect(iconPaths(template).every((path) => shared.has(path))).toBe(true);
  });
});

describe('Videojs8LiveSkinElement', () => {
  /** The shadow-root boilerplate: from the host styles to the end of the constructor, with the names blanked. */
  function host(entry: string): string {
    const start = entry.indexOf('/* The host is a plain box');
    const end = entry.indexOf('\n}\n', entry.indexOf('constructor() {'));

    return entry
      .slice(start, end)
      .replace(/videojs-8-live-skin|videojs-8-skin/g, '<tag>')
      .replace(/Videojs8LiveSkinElement|Videojs8SkinElement/g, '<class>')
      .replace(/^\/\*\*[\s\S]*?\*\/\n(?=export class)/m, '');
  }

  it('keeps its copy of the shadow-root host in step with the on-demand element', () => {
    expect(host(html).length).toBeGreaterThan(1000);
    expect(host(html)).toBe(host(onDemand.html));
  });

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'videojs-8-live-skin';");
  });
});

describe('Videojs8LiveSkin', () => {
  it('draws the same icons as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
    expect(react).toContain('<circle cx="24" cy="24" r="20" />');
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
    expect(react).toContain('export function Videojs8LiveSkin(');
    expect(react).toContain('export type Videojs8LiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(/<div className="ps-live-control">\s*<LiveButton className="ps-live-button">/);
  });
});

describe('package.json', () => {
  it('is its own package with the same entry points as the on-demand skin', () => {
    expect(pkg.name).toBe('@player.style/videojs-8-live');
    expect(pkg.exports).toEqual(onDemand.pkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the same peer dependencies as the on-demand skin', () => {
    expect(pkg.peerDependencies).toEqual(onDemand.pkg.peerDependencies);
  });
});
