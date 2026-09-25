import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
};
const vite = read('vite.config.ts');

/** The on-demand skin: its stylesheet is this package's, and its template is what the live one trims. */
const base = join(root, '../mux-player-classic');
const css = readFileSync(join(base, 'src/skin.css'), 'utf8');
const onDemandTemplate = readFileSync(join(base, 'src/html/template.html'), 'utf8');
const onDemandHtml = readFileSync(join(base, 'src/html/index.ts'), 'utf8');
const basePkg = JSON.parse(readFileSync(join(base, 'package.json'), 'utf8')) as Record<string, unknown>;

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

/** The distinct `d` attributes of the SVG paths, sorted; the React component keeps repeated glyphs in constants. */
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

/** The `ps-*` classes a source uses, in either `class=` or `className=` form. */
function classesIn(source: string): Set<string> {
  return new Set(source.match(/\bps-[a-z0-9-]+/g));
}

/** The `media-*` tags a template stamps. */
function elementsIn(source: string): Set<string> {
  return new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
}

/** The `media-*` tags an HTML entry registers through `@videojs/html/ui/*`. */
function registeredIn(entry: string): Set<string> {
  return new Set([...entry.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
}

/** The shadow-root host below the imports, with the names that differ between the two packages normalised. */
function host(entry: string, tag: string, element: string): string {
  return entry
    .slice(entry.indexOf('const HOST_STYLES'))
    .replace(/\/\*\*[\s\S]*?\*\/\nexport class/, 'export class')
    .replaceAll(tag, 'TAG')
    .replaceAll(element, 'ELEMENT');
}

describe('skin.css (shared with @player.style/mux-player-classic)', () => {
  it('is the on-demand skin stylesheet, in the element and in the build', () => {
    expect(html).toContain("import styles from '../../../mux-player-classic/src/skin.css?inline';");
    expect(vite).toContain("stylesheet: '../mux-player-classic/src/skin.css'");
  });

  it('styles the Live button, its dot and its text', () => {
    for (const name of ['ps-live-button', 'ps-live-indicator', 'ps-live-text']) {
      expect(
        ruleSelectors(css).some((selector) => selector.includes(`.${name}`)),
        name
      ).toBe(true);
    }
  });

  it('scopes the live-only rules under the root on the live-video preset', () => {
    const live = ruleSelectors(css).filter(
      (selector) => selector.includes('data-preset') || selector.includes('.ps-live-')
    );

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-mux-player-classic[data-preset="live-video"]'))).toBe(
      true
    );
  });

  it('honours the live-button tokens with media-chrome defaults, and reds the dot at the live edge', () => {
    const rootRule = css.match(/^\.ps-mux-player-classic \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain('--ps-accent: var(--media-accent-color, var(--media-primary-color, #fff));');
    expect(rootRule).toContain('--ps-live-icon: var(--media-live-button-icon-color, rgb(140 140 140));');
    expect(rootRule).toContain('--ps-live-indicator: var(--media-live-button-indicator-color, rgb(255 0 0));');
    expect(css).toContain('.ps-live-button[data-live-edge] .ps-live-indicator');
  });
});

describe('template.html', () => {
  it('roots the skin in a media-container on the live-video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-mux-player-classic" data-theme="mux-player-classic" data-preset="live-video">'
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

  it("drops the time range, seek, time and rate controls the theme's live layout left out", () => {
    for (const tag of [
      'media-time-slider',
      'media-slider-buffer',
      'media-slider-preview',
      'media-slider-thumbnail',
      'media-slider-value',
      'media-seek-button',
      'media-time-group',
      'media-playback-rate-button',
    ]) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
  });

  it('leads the top bar with a Live button that carries its own text', () => {
    expect(template).toMatch(/<div class="ps-top">\s*<media-live-button class="ps-live-button">/);
    expect(template).toContain('<span class="ps-live-text">Live</span>');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
  });

  it('carries the on-demand artwork, less the seek glyphs', () => {
    const seek = iconPaths(onDemandTemplate).filter((d) => d.startsWith('M10 6V3'));

    expect(seek).toHaveLength(2);
    expect(iconPaths(template)).toEqual(iconPaths(onDemandTemplate).filter((d) => !seek.includes(d)));
  });
});

describe('MuxPlayerClassicLiveSkinElement', () => {
  it('registers <mux-player-classic-live-skin>', () => {
    expect(html).toContain("const TAG_NAME = 'mux-player-classic-live-skin';");
    expect(html).toContain('export class MuxPlayerClassicLiveSkinElement');
    expect(html).toContain('customElements.define(TAG_NAME, MuxPlayerClassicLiveSkinElement)');
  });

  it("keeps a copy of the on-demand element's shadow-root host", () => {
    expect(host(html, 'mux-player-classic-live-skin', 'MuxPlayerClassicLiveSkinElement')).toBe(
      host(onDemandHtml, 'mux-player-classic-skin', 'MuxPlayerClassicSkinElement')
    );
  });
});

describe('MuxPlayerClassicLiveSkin', () => {
  it('draws the same artwork as the HTML element', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
  });

  it('uses the same class names as the HTML element', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML element alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither wrapper as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset with a Live button and no seek hotkeys', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function MuxPlayerClassicLiveSkin(');
    expect(react).toContain('export type MuxPlayerClassicLiveSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="live-video"');
    expect(react).toMatch(/<div className="ps-top">\s*<LiveButton className="ps-live-button">/);
    expect(react).toContain('<span className="ps-live-text">Live</span>');
    expect(react).not.toContain('seekStep');
  });
});

describe('package.json', () => {
  it('publishes as @player.style/mux-player-classic-live with the base skin package shape', () => {
    expect(pkg.name).toBe('@player.style/mux-player-classic-live');
    expect(pkg.exports).toEqual(basePkg.exports);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });
});
