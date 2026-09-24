import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const sibling = join(root, '../microvideo');
const read = (path: string, from = root) => readFileSync(join(from, path), 'utf8');

/* The stylesheet is the on-demand package's: this package has no `src/skin.css` of its own. */
const css = read('src/skin.css', sibling);
const element = read('src/skin-element.ts');
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const onDemandTemplate = read('src/html/template.html', sibling);
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  homepage: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
};
const siblingPkg = JSON.parse(read('package.json', sibling)) as { exports: Record<string, unknown> };

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

/** The `d` attributes of every SVG path, which is what the two editions must agree on. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The `ps-*` classes a source uses, in either `class=` or `className=` form. */
function classesIn(source: string): Set<string> {
  return new Set(source.match(/\bps-[a-z-]+/g));
}

/** The `media-*` tags a template stamps. */
function elementsIn(template: string): Set<string> {
  return new Set([...template.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
}

/** The `media-*` tags an HTML entry registers through `@videojs/html/ui/*`. */
function registeredIn(entry: string): Set<string> {
  return new Set([...entry.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
}

describe('skin.css', () => {
  it("is @player.style/microvideo's stylesheet, shared rather than copied", () => {
    expect(existsSync(join(root, 'src/skin.css'))).toBe(false);
    expect(read('vite.config.ts')).toContain(
      "defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../microvideo/src/skin.css' })"
    );
    expect(element).toContain("import styles from '../../microvideo/src/skin.css?inline';");
  });

  it('scopes every rule under the shared root, so both editions and other skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-microvideo(?![\w-])|:where\(\.ps-microvideo\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-microvideo[data-preset="live-video"]'))).toBe(true);
  });

  it("declares the brand colour from the accent token and keeps the live button's colour tokens", () => {
    const rootRule = css.match(/^\.ps-microvideo \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain(
      '--ps-primary: var(--media-accent-color, var(--media-primary-color, rgb(255 255 255 / 0.9)));'
    );
    expect(css).toContain('var(--media-secondary-color, #000)');
    expect(css).toContain('var(--media-live-button-icon-color, rgb(140 140 140))');
    expect(css).toContain('var(--media-live-button-indicator-color, rgb(255 0 0))');
  });

  it('keys the host variants on the mirrored data attributes', () => {
    const rules = ruleSelectors(css);
    const place = rules.filter((selector) => selector.includes('data-controlbar-place'));
    const vertical = rules.filter((selector) => /(?<!:not\()\[data-controlbar-vertical\]/.test(selector));

    expect(place.length).toBeGreaterThan(0);
    expect(place.every((selector) => selector.startsWith('.ps-microvideo'))).toBe(true);
    expect(vertical.every((selector) => selector.startsWith('.ps-microvideo[data-controlbar-vertical]'))).toBe(true);
  });
});

describe('MicrovideoSkinBaseElement', () => {
  it("stays a copy of the on-demand package's host, apart from its header and the stylesheet import", () => {
    const body = (source: string) =>
      source
        .replace(/^\/\*[\s\S]*?\*\/\n/, '')
        .replace(/^import styles from '[^']+';$/m, "import styles from '<skin.css>';");

    expect(body(element)).toBe(body(read('src/skin-element.ts', sibling)));
  });

  it('observes the host attributes and mirrors them onto the container', () => {
    expect(element).toContain("export const HOST_ATTRIBUTES = ['controlbarplace', 'controlbarvertical'] as const;");
    expect(element).toContain('static readonly observedAttributes: readonly string[] = HOST_ATTRIBUTES;');
    expect(element).toContain("this.#container.setAttribute('data-controlbar-place', value)");
    expect(element).toContain("this.#container.toggleAttribute('data-controlbar-vertical', vertical)");
  });

  it('turns the volume slider vertical with the vertical variant', () => {
    expect(element).toContain("setAttribute('orientation', vertical ? 'vertical' : 'horizontal')");
  });

  it('exposes camel-cased properties for both attributes', () => {
    expect(element).toContain('get controlBarPlace(): string | null');
    expect(element).toContain('get controlBarVertical(): boolean');
  });
});

describe('microvideo-live-skin', () => {
  it('roots the skin in a media-container on the live-video preset, under the shared root class and theme', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-microvideo" data-theme="microvideo" data-preset="live-video">'
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

  it('defines the element on the base with its own template', () => {
    expect(html).toContain("const TAG_NAME = 'microvideo-live-skin';");
    expect(html).toContain('export class MicrovideoLiveSkinElement extends MicrovideoSkinBaseElement');
    expect(html).toContain("import { MicrovideoSkinBaseElement } from '../skin-element';");
    expect(html).toContain('static override markup = markup;');
  });

  it('drops the play, seek and time controls of the on-demand edition and leads with a Live button', () => {
    const dropped = ['media-play-button', 'media-seek-button', 'media-time-slider', 'media-slider-preview'];

    for (const tag of dropped) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
    expect(template).toMatch(/<div class="ps-bar">\s*<media-live-button class="ps-button ps-live-button">/);
    expect(react).toMatch(/<div className="ps-bar">\s*<LiveButton className="ps-button ps-live-button">/);
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
    expect(react).not.toContain('seekStep');
  });
});

describe('MicrovideoLiveSkin', () => {
  it('draws the same icons as the HTML edition', () => {
    expect(iconPaths(react)).toEqual(iconPaths(template));
  });

  it('uses the same class names as the HTML edition', () => {
    const htmlClasses = classesIn(template);
    const reactClasses = classesIn(react);

    // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
    // root element (`.ps-dialog`); React renders neither as an element.
    for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

    expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
  });

  it('is a client component on the live-video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function MicrovideoLiveSkin(');
    expect(react).toContain('export interface MicrovideoLiveSkinProps extends ContainerProps');
    expect(react).toContain("className={classNames('media-skin ps-microvideo', className)}");
    expect(react).toContain('data-theme="microvideo"');
    expect(react).toContain('data-preset="live-video"');
  });

  it('sets the host-variant data attributes from its props', () => {
    expect(react).toContain('controlBarPlace?: string | undefined;');
    expect(react).toContain('controlBarVertical?: boolean | undefined;');
    expect(react).toContain('data-controlbar-place={controlBarPlace}');
    expect(react).toContain("data-controlbar-vertical={controlBarVertical ? '' : undefined}");
    expect(react).toContain("orientation={controlBarVertical ? 'vertical' : 'horizontal'}");
  });
});

describe('package.json', () => {
  it('is the sibling package of @player.style/microvideo with the same export map', () => {
    expect(pkg.name).toBe('@player.style/microvideo-live');
    expect(pkg.homepage).toBe('https://player.style/skins/microvideo-live');
    expect(pkg.exports).toEqual(siblingPkg.exports);
    expect(Object.keys(pkg.exports)).toEqual(['.', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.sideEffects).toEqual(['./dist/html.js']);
  });
});
