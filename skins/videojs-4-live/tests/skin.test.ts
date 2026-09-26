import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const vite = read('vite.config.ts');
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
};

/** The on-demand skin: its stylesheet is this package's, and its template and host are what this one trims and copies. */
const base = join(root, '../videojs-4');
const readBase = (path: string) => readFileSync(join(base, path), 'utf8');
const css = readBase('src/skin.css');
const onDemandTemplate = readBase('src/html/template.html');
const onDemandHtml = readBase('src/html/index.ts');
const onDemandReact = readBase('src/react/index.tsx');
const basePkg = JSON.parse(readBase('package.json')) as Record<string, unknown>;

/** Top-level selectors of every style rule: commas inside `:is()`/`:not()` stay put, keyframe steps are left out. */
function ruleSelectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
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

/** The `d` attributes of every SVG path, in order: the icons both frameworks must draw. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!);
}

const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));
const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));

/** The shadow-root host: everything from the template import on, with the names that differ blanked out. */
function host(source: string): string {
  return source
    .slice(source.indexOf('import markup'))
    .replace(/import styles from '[^']+';/, 'import styles;')
    .replace(/\/\*\*[\s\S]*?\*\/\nexport class/, 'export class')
    .replace(/videojs-4(?:-live)?-skin/g, 'TAG')
    .replace(/Videojs4(?:Live)?SkinElement/g, 'ELEMENT');
}

describe('skin.css (shared with @player.style/videojs-4)', () => {
  it('is the on-demand skin stylesheet, in the element and in the build', () => {
    expect(html).toContain("import styles from '../../../videojs-4/src/skin.css?inline';");
    expect(vite).toContain("stylesheet: '../videojs-4/src/skin.css'");
  });

  it('styles the LIVE label and its dot on the live-video preset only', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('ps-live-'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-videojs-4[data-preset="live-video"] '))).toBe(true);
    expect(css).toContain('.ps-live-button[data-live-edge] .ps-live-indicator');
  });

  it('honours the live-button tokens, transparent by default since 4.x drew no dot', () => {
    const rootRule = css.match(/^\.ps-videojs-4 \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-live-icon: var(--media-live-button-icon-color, transparent);');
    expect(rootRule).toContain('--ps-live-indicator: var(--media-live-button-indicator-color, transparent);');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-videojs-4" data-theme="videojs-4" data-preset="live-video">'
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

  it('drops the progress strip and the time readout, as 4.x did for live streams', () => {
    for (const tag of ['media-time-slider', 'media-slider-buffer', 'media-time-group', 'media-time']) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
  });

  it('puts the LIVE label right after play, where the time readout sat', () => {
    expect(template).toMatch(
      /<\/media-play-button>\s*(?:<!--[^>]*-->\s*)?<media-live-button class="ps-live-button">\s*<span class="ps-live-indicator"><\/span>\s*<span class="ps-live-text">LIVE<\/span>/
    );
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it('draws the same icons as the on-demand skin', () => {
    expect(iconPaths(template)).toEqual(iconPaths(onDemandTemplate));
  });
});

describe('Videojs4LiveSkinElement', () => {
  it('registers <videojs-4-live-skin>', () => {
    expect(html).toContain("const TAG_NAME = 'videojs-4-live-skin';");
    expect(html).toContain('export class Videojs4LiveSkinElement extends BaseElement');
    expect(html).toContain('customElements.define(TAG_NAME, Videojs4LiveSkinElement)');
  });

  it("keeps an exact copy of the on-demand package's shadow-root host", () => {
    expect(host(html)).toBe(host(onDemandHtml));
  });
});

describe('Videojs4LiveSkin', () => {
  it('draws the same icons as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
    expect(iconPaths(react)).toEqual(iconPaths(onDemandReact));
  });

  it('uses the same class names as the HTML element', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither wrapper as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset with a LIVE label and no seek hotkeys', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function Videojs4LiveSkin(');
    expect(react).toContain('export type Videojs4LiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(
      /<\/PlayButton>\s*(?:\{\/\*[^}]*\*\/\}\s*)?<LiveButton className="ps-live-button">\s*<span className="ps-live-indicator" \/>\s*<span className="ps-live-text">LIVE<\/span>/
    );
    expect(react).not.toContain('seekStep');
    expect(react).not.toContain('TimeSlider');
  });
});

describe('package.json', () => {
  it('publishes as @player.style/videojs-4-live with the base skin package shape', () => {
    expect(pkg.name).toBe('@player.style/videojs-4-live');
    expect(pkg.exports).toEqual(basePkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });
});
