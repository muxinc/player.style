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

/** The distinct `d` attributes of every SVG path; the React component keeps the repeated glyphs in constants. */
function iconPaths(source: string): string[] {
  const constants = new Map(
    [...source.matchAll(/const ([A-Z]+) =\s*'([^']+)';/g)].map((match) => [match[1]!, match[2]!])
  );

  return [
    ...new Set(
      [...source.matchAll(/<path\s[^>]*?d=(?:"([^"]+)"|\{([A-Z]+)\})/g)].map(
        (match) => match[1] ?? constants.get(match[2]!)!
      )
    ),
  ].sort();
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
      (selector) => !/^(?:\.ps-mux-player(?![\w-])|:where\(\.ps-mux-player\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-mux-player-'))).toEqual([]);
  });

  it('declares Mux pink as the brand colour, from the accent token', () => {
    expect(rule('.ps-mux-player')).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#fa50b5\);/);
  });

  it("reads Gerwig's primary, secondary and text tokens with its defaults", () => {
    const declarations = rule('.ps-mux-player');

    expect(declarations).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\);/);
    expect(declarations).toMatch(/--ps-text:\s*var\(--media-primary-color,\s*rgb\(238 238 238\)\);/);
    expect(declarations).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*transparent\);/);
    expect(declarations).toMatch(/--ps-surface-text:\s*var\(--media-text-color,\s*#000\);/);
  });

  it("keeps Gerwig's fixed pixel geometry", () => {
    expect(rule(':where(.ps-mux-player) .ps-bar')).toMatch(/height:\s*38px;[\s\S]*padding:\s*6px;/);
    expect(rule(':where(.ps-mux-player) .ps-button')).toMatch(/height:\s*26px;[\s\S]*padding:\s*6px;/);
    expect(rule(':where(.ps-mux-player) .ps-center-play')).toMatch(/width:\s*90px;[\s\S]*height:\s*90px;/);
    expect(rule(':where(.ps-mux-player) .ps-time-track')).toMatch(/height:\s*4px;/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-mux-player > video');
    expect(css).toContain('.ps-mux-player ::slotted(video)');
  });
});

describe('mux-player-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-mux-player" data-theme="mux-player" data-preset="video">'
    );
  });

  it('exposes the default and poster slots', () => {
    expect(template).toContain('<slot></slot>');
    expect(template).toContain('<slot name="poster">');
  });

  it('registers every Video.js element it uses, and nothing it does not', () => {
    const used = elementsIn(template);
    const registered = registeredIn(html);

    // `ui/tooltip` creates its shortcut element at runtime without registering it, so the entry imports it unused.
    registered.delete('media-tooltip-shortcut');

    expect([...used].filter((tag) => !registered.has(tag))).toEqual([]);
    expect([...registered].filter((tag) => !used.has(tag))).toEqual([]);
  });

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'mux-player-skin';");
    expect(html).toContain('export class MuxPlayerSkinElement extends BaseElement');
  });

  it('links every menu trigger and tooltip to an element by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const targets = [...template.matchAll(/\b(?:commandfor|trigger)="([^"]+)"/g)].map((match) => match[1]!);

    expect(targets.length).toBe(16);
    expect(targets.filter((id) => !ids.has(id))).toEqual([]);
  });

  it('labels rates `1x` as the original did, in both frameworks', () => {
    expect(html).toContain('return `${rate}x`;');
    expect(react).toContain('<PlaybackRateRadioGroup.Root formatRate={formatRate}>');
  });

  it('delays the spinner by 0.5s, as media-chrome did', () => {
    expect(template).toContain('<media-buffering-indicator class="ps-loading" delay="500">');
    expect(react).toContain('<BufferingIndicator className="ps-loading" delay={500}>');
  });
});

describe('MuxPlayerSkin', () => {
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
    expect(react).toContain('export function MuxPlayerSkin(');
    expect(react).toContain('export type MuxPlayerSkinProps = ContainerProps;');
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
