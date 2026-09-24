import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const css = read('src/skin.css');
const element = read('src/skin-element.ts');
const pkg = JSON.parse(read('package.json')) as { sideEffects: string[]; exports: Record<string, unknown> };

/** Both editions: the on-demand skin on the video preset and the live skin on the live-video preset. */
const editions = [
  {
    name: 'MicrovideoSkin',
    tag: 'microvideo-skin',
    preset: 'video',
    template: read('src/html/template.html'),
    html: read('src/html/index.ts'),
    react: read('src/react/index.tsx'),
  },
  {
    name: 'MicrovideoLiveSkin',
    tag: 'microvideo-live-skin',
    preset: 'live-video',
    template: read('src/live/html/template.html'),
    html: read('src/live/html/index.ts'),
    react: read('src/live/react/index.tsx'),
  },
];

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
      (selector) => !/^(?:\.ps-microvideo(?![\w-])|:where\(\.ps-microvideo\)\s|:host)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('declares the brand colour from the accent token, over the original primary and its default', () => {
    const rootRule = css.match(/^\.ps-microvideo \{([\s\S]*?)^\}/m)?.[1] ?? '';

    expect(rootRule).toContain(
      '--ps-primary: var(--media-accent-color, var(--media-primary-color, rgb(255 255 255 / 0.9)));'
    );
  });

  it("keeps the original's secondary token and the live button's colour tokens with their defaults", () => {
    expect(css).toContain('var(--media-secondary-color, #000)');
    expect(css).toContain('var(--media-live-button-icon-color, rgb(140 140 140))');
    expect(css).toContain('var(--media-live-button-indicator-color, rgb(255 0 0))');
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-microvideo[data-preset="live-video"]'))).toBe(true);
  });

  it('keys the host variants on the mirrored data attributes', () => {
    const rules = ruleSelectors(css);
    const place = rules.filter((selector) => selector.includes('data-controlbar-place'));
    // `:not([data-controlbar-vertical])` on a horizontal rule is not a vertical rule.
    const vertical = rules.filter((selector) => /(?<!:not\()\[data-controlbar-vertical\]/.test(selector));

    // The original's `place-self` vocabulary, read with its own prefix/suffix selectors, plus the shorthands.
    for (const needle of ['^="start"', '^="center"', '$="start"', '$="end"', '="top"', '="bottom"']) {
      expect(
        place.some((selector) => selector.includes(`[data-controlbar-place${needle}]`)),
        needle
      ).toBe(true);
    }
    expect(vertical.some((selector) => selector.endsWith('.ps-volume-fill'))).toBe(true);
    expect(place.every((selector) => selector.startsWith('.ps-microvideo'))).toBe(true);
    expect(vertical.every((selector) => selector.startsWith('.ps-microvideo[data-controlbar-vertical]'))).toBe(true);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-microvideo > video');
    expect(css).toContain('.ps-microvideo ::slotted(video)');
  });

  it('has no reduced-motion rules, as the original had none', () => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toContain('prefers-reduced-motion');
  });
});

describe('MicrovideoSkinBaseElement', () => {
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

for (const edition of editions) {
  describe(edition.tag, () => {
    it(`roots the skin in a media-container on the ${edition.preset} preset`, () => {
      expect(edition.template).toContain(
        `<media-container class="media-skin ps-microvideo" data-theme="microvideo" data-preset="${edition.preset}">`
      );
    });

    it('exposes the default and poster slots', () => {
      expect(edition.template).toContain('<slot></slot>');
      expect(edition.template).toContain('<slot name="poster">');
    });

    it('registers every Video.js element it uses, and nothing it does not', () => {
      const used = elementsIn(edition.template);
      const registered = registeredIn(edition.html);

      expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
      expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
    });

    it('defines the element on the shared base with its own template', () => {
      expect(edition.html).toContain(`const TAG_NAME = '${edition.tag}';`);
      expect(edition.html).toContain('extends MicrovideoSkinBaseElement');
      expect(edition.html).toContain('static override markup = markup;');
    });
  });

  describe(edition.name, () => {
    it('draws the same icons as the HTML edition', () => {
      expect(iconPaths(edition.react)).toEqual(iconPaths(edition.template));
    });

    it('uses the same class names as the HTML edition', () => {
      const htmlClasses = classesIn(edition.template);
      const reactClasses = classesIn(edition.react);

      // The HTML edition alone wraps the controls in `media-controls` (`.ps-controls`) and the error dialog in its
      // root element (`.ps-dialog`); React renders neither as an element.
      for (const only of ['ps-controls', 'ps-dialog']) htmlClasses.delete(only);

      expect([...reactClasses].sort()).toEqual([...htmlClasses].sort());
    });

    it(`is a client component named ${edition.name} on the ${edition.preset} preset`, () => {
      expect(edition.react.startsWith("'use client';\n")).toBe(true);
      expect(edition.react).toContain(`export function ${edition.name}(`);
      expect(edition.react).toContain(`export interface ${edition.name}Props extends ContainerProps`);
      expect(edition.react).toContain(`data-preset="${edition.preset}"`);
    });

    it('sets the host-variant data attributes from its props', () => {
      expect(edition.react).toContain('controlBarPlace?: string | undefined;');
      expect(edition.react).toContain('controlBarVertical?: boolean | undefined;');
      expect(edition.react).toContain('data-controlbar-place={controlBarPlace}');
      expect(edition.react).toContain("data-controlbar-vertical={controlBarVertical ? '' : undefined}");
      expect(edition.react).toContain("orientation={controlBarVertical ? 'vertical' : 'horizontal'}");
    });
  });
}

describe('live edition', () => {
  const [onDemand, live] = editions as [(typeof editions)[number], (typeof editions)[number]];

  it('drops the play, seek and time controls and leads with a Live button', () => {
    const dropped = ['media-play-button', 'media-seek-button', 'media-time-slider', 'media-slider-preview'];

    for (const tag of dropped) {
      expect(elementsIn(onDemand.template).has(tag), tag).toBe(true);
      expect(elementsIn(live.template).has(tag), tag).toBe(false);
    }
    expect(live.template).toMatch(/<div class="ps-bar">\s*<media-live-button class="ps-button ps-live-button">/);
    expect(live.react).toMatch(/<div className="ps-bar">\s*<LiveButton className="ps-button ps-live-button">/);
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemand.template).toContain('action="seekStep"');
    expect(live.template).not.toContain('seekStep');
    expect(live.react).not.toContain('seekStep');
  });

  it('is exported as ./live and ./live/react with dist/live.js as a side effect', () => {
    expect(pkg.exports['./live']).toEqual({ types: './dist/types/live/html/index.d.ts', default: './dist/live.js' });
    expect(pkg.exports['./live/react']).toEqual({
      types: './dist/types/live/react/index.d.ts',
      default: './dist/live-react.js',
    });
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/live.js']);
  });
});
