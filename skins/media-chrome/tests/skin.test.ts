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

/** The `d` attribute of every SVG path, sorted. */
function iconPaths(source: string): string[] {
  return [...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((match) => match[1]!).sort();
}

/** The text of every tooltip, in order: `media-tooltip` spans in HTML, `off`/`on` props in React. */
function tooltipWords(source: string): string[] {
  return [
    ...source.matchAll(/class(?:Name)?="ps-tooltip-(?:off|on)">([^<{]+)</g),
    ...source.matchAll(/\b(?:off|on)="([^"]+)"/g),
  ]
    .map((match) => match[1]!)
    .sort();
}

const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));
const classesIn = (source: string) => new Set(source.match(/\bps-[a-z0-9-]+/g));

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
      (selector) => !/^(?:\.ps-media-chrome(?![\w-])|:where\(\.ps-media-chrome\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-media-chrome-'))).toEqual([]);
  });

  it("declares the range colour from the accent token, over the primary token and media-chrome's #eee", () => {
    expect(rule('.ps-media-chrome')).toMatch(
      /--ps-accent:\s*var\(--media-accent-color,\s*var\(--media-primary-color,\s*rgb\(238 238 238\)\)\);/
    );
  });

  it("reads media-chrome's base tokens with media-chrome's own defaults", () => {
    const declarations = rule('.ps-media-chrome');

    expect(declarations).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*rgb\(238 238 238\)\);/);
    expect(declarations).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*rgb\(20 20 30 \/ 0\.7\)\);/);
    expect(declarations).toMatch(
      /--ps-control-background:\s*var\(--media-control-background,\s*var\(--ps-secondary\)\);/
    );
    expect(declarations).toMatch(
      /--ps-control-hover-background:\s*var\(--media-control-hover-background,\s*rgb\(50 50 70 \/ 0\.7\)\);/
    );
    expect(declarations).toMatch(
      /--ps-font-family:\s*var\(--media-font-family,\s*helvetica neue, segoe ui, roboto, arial, sans-serif\);/
    );
    expect(declarations).toMatch(/border-radius:\s*var\(--media-border-radius,\s*0\);/);
    expect(declarations).toMatch(/background-color:\s*var\(--media-background-color,\s*#000\);/);
    expect(css).toContain('object-fit: var(--media-object-fit, contain);');
    expect(css).toContain('object-position: var(--media-object-position, center);');
  });

  it("keeps media-chrome's component geometry", () => {
    expect(rule(':where(.ps-media-chrome) .ps-button')).toMatch(
      /padding:\s*var\(--media-button-padding,\s*var\(--media-control-padding,\s*10px\)\);/
    );
    expect(rule(':where(.ps-media-chrome) .ps-icon')).toMatch(
      /height:\s*var\(--media-button-icon-height,\s*var\(--media-control-height,\s*24px\)\);/
    );
    expect(rule(':where(.ps-media-chrome) .ps-volume-range')).toMatch(/width:\s*100px;/);
    expect(rule(':where(.ps-media-chrome) .ps-track')).toMatch(/height:\s*var\(--media-range-track-height,\s*4px\);/);
    expect(css).toMatch(/--ps-thumb-width:\s*var\(--media-range-thumb-width,\s*10px\);/);
    expect(rule(':where(.ps-media-chrome) .ps-rate-button')).toMatch(/min-width:\s*5ch;/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-media-chrome > video');
    expect(css).toContain('.ps-media-chrome ::slotted(video)');
  });
});

describe('media-chrome-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-media-chrome" data-theme="media-chrome" data-preset="video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = elementsIn(template);
    const registered = registeredIn(html);
    // `media-tooltip` needs its label and shortcut parts registered, though these tooltips author their own text.
    const tooltipParts = ['media-tooltip-label', 'media-tooltip-shortcut'];

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag) && !tooltipParts.includes(tag))).toEqual([]);
  });

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'media-chrome-skin';");
    expect(html).toContain('export class MediaChromeSkinElement extends BaseElement');
  });

  it('links every tooltip to a button by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const triggers = [...template.matchAll(/<media-tooltip[^>]*\btrigger="([^"]+)"/g)].map((match) => match[1]!);

    expect(triggers.length).toBe(8);
    expect(triggers.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("seeks by media-chrome's default 30 seconds and shows its loading indicator after 0.5s", () => {
    expect(template).toContain('seconds="-30"');
    expect(template).toContain('seconds="30"');
    expect(template).toContain('<media-buffering-indicator class="ps-loading" delay="500">');
    expect(react).toContain('seconds={-30}');
    expect(react).toContain('seconds={30}');
    expect(react).toContain('<BufferingIndicator className="ps-loading" delay={500}>');
  });
});

describe('MediaChromeSkin', () => {
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

  it('gives its tooltips the same words as the HTML element', () => {
    expect(tooltipWords(react)).toEqual(tooltipWords(template));
  });

  it('is a client component on the video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function MediaChromeSkin(');
    expect(react).toContain('export type MediaChromeSkinProps = ContainerProps;');
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
