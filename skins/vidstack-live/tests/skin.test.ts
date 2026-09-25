import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');
/* The stylesheet is @player.style/vidstack's; this package inlines and copies it rather than owning one. */
const css = read('../vidstack/src/skin.css');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const viteConfig = read('vite.config.ts');
const onDemand = {
  template: read('../vidstack/src/html/template.html'),
  html: read('../vidstack/src/html/index.ts'),
  react: read('../vidstack/src/react/index.tsx'),
  pkg: JSON.parse(read('../vidstack/package.json')) as { exports: unknown; peerDependencies: unknown },
};
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  homepage: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
};

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

const iconPaths = (source: string) => new Set([...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((m) => m[1]!));
const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));

describe('skin.css (shared with @player.style/vidstack)', () => {
  it("is the on-demand skin's stylesheet, inlined by the HTML entry and copied by the build", () => {
    expect(existsSync(join(root, 'src/skin.css'))).toBe(false);
    expect(html).toContain("import styles from '../../../vidstack/src/skin.css?inline';");
    expect(viteConfig).toContain("stylesheet: '../vidstack/src/skin.css'");
  });

  it('scopes every rule under the root, so both skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-vidstack(?![\w-])|:where\(\.ps-vidstack\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-vidstack[data-preset="live-video"]'))).toBe(true);
  });

  it('styles every class that exists only for live video, and only under the live-video preset', () => {
    const liveOnly = [...classesIn(template)].filter((name) => !classesIn(onDemand.template).has(name));

    expect(liveOnly.sort()).toEqual(['ps-live-button', 'ps-live-text']);
    for (const name of liveOnly) {
      const rules = ruleSelectors(css).filter((selector) => new RegExp(`\\.${name}(?![\\w-])`).test(selector));

      expect(rules.length, name).toBeGreaterThan(0);
      expect(
        rules.every((selector) => selector.startsWith('.ps-vidstack[data-preset="live-video"]')),
        name
      ).toBe(true);
    }
  });

  it("colours the badge from the live button tokens, with Vidstack's grey and red", () => {
    expect(css).toContain('background-color: var(--media-live-button-icon-color, #8a8a8a);');
    expect(css).toMatch(
      /\.ps-live-button\[data-live-edge\] \.ps-live-text \{\s*background-color: var\(--media-live-button-indicator-color, #dc2626\);/
    );
  });
});

describe('vidstack-live-skin', () => {
  it("roots the skin in the on-demand skin's media-container, on the live-video preset", () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-vidstack" data-theme="vidstack" data-preset="live-video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing else but the tooltip parts', () => {
    const used = elementsIn(template);
    const registered = registeredIn(html);

    // `ui/tooltip` creates its label and shortcut at runtime without registering them.
    for (const part of ['media-tooltip-label', 'media-tooltip-shortcut']) used.add(part);

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
  });

  it('drops the time slider, its preview and the times, and keeps no seek hotkeys or gestures', () => {
    for (const tag of ['media-time-slider', 'media-slider-thumbnail', 'media-time-group', 'media-time']) {
      expect(elementsIn(onDemand.template).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
    expect(onDemand.template).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
    expect(react).not.toContain('seekStep');
  });

  it('puts the LIVE badge where the times were, in both layouts, with its own text so Video.js injects none', () => {
    expect(template).toMatch(
      /<\/media-volume-slider>\s*<\/div>\s*(?:<!--[\s\S]*?-->\s*)?<media-live-button class="ps-live-button">\s*<span class="ps-live-text">LIVE<\/span>/
    );
    expect(template).toMatch(
      /<div class="ps-group ps-group-info">\s*<media-live-button class="ps-live-button">\s*<span class="ps-live-text">LIVE<\/span>/
    );
  });

  it("reuses the on-demand package's icons unchanged", () => {
    expect(iconPaths(template)).toEqual(iconPaths(onDemand.template));
  });
});

describe('VidstackLiveSkinElement', () => {
  /** The shadow-root boilerplate: from the host styles to the end of the constructor, with the names blanked. */
  function host(entry: string): string {
    const start = entry.indexOf('/* The host is a plain box');
    const end = entry.indexOf('\n}\n', entry.indexOf('constructor() {'));

    return entry
      .slice(start, end)
      .replace(/vidstack-live-skin|vidstack-skin/g, '<tag>')
      .replace(/VidstackLiveSkinElement|VidstackSkinElement/g, '<class>')
      .replace(/^\/\*\*[\s\S]*?\*\/\n(?=export class)/m, '');
  }

  it('keeps its copy of the shadow-root host in step with the on-demand element', () => {
    expect(host(html).length).toBeGreaterThan(1000);
    expect(host(html)).toBe(host(onDemand.html));
  });

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'vidstack-live-skin';");
    expect(html).toContain('export class VidstackLiveSkinElement extends BaseElement');
  });
});

describe('VidstackLiveSkin', () => {
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
    expect(react).toContain('export function VidstackLiveSkin(');
    expect(react).toContain('export type VidstackLiveSkinProps = ContainerProps;');
    expect(react).toContain("className={classNames('media-skin ps-vidstack', className)}");
    expect(react).toContain('data-theme="vidstack"');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(/<LiveButton className="ps-live-button">\s*<span className="ps-live-text">LIVE<\/span>/);
  });
});

describe('package.json', () => {
  it('is its own package with the same entry points as the on-demand skin', () => {
    expect(pkg.name).toBe('@player.style/vidstack-live');
    expect(pkg.homepage).toBe('https://player.style/skins/vidstack-live');
    expect(pkg.exports).toEqual(onDemand.pkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the same peer dependencies as the on-demand skin', () => {
    expect(pkg.peerDependencies).toEqual(onDemand.pkg.peerDependencies);
  });
});
