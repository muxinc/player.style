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
  exports: Record<string, unknown>;
  sideEffects: string[];
  peerDependencies: Record<string, string>;
};

const withoutComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '');
const rootBlock = css.match(/^\.ps-videojs-3\s*\{([^}]*)\}/m)?.[1] ?? '';

/** Every selector list in the stylesheet, `@`-rule preludes, keyframe steps and `data:` URLs left out. */
function selectors(source: string): string[] {
  return withoutComments(source)
    .replace(/url\("data:[^"]*"\)/g, 'url()')
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .split('}')
    .flatMap((block) => block.split('{')[0]?.split(',') ?? [])
    .map((selector) => selector.trim())
    .filter((selector) => selector && !selector.startsWith('@') && !selector.startsWith('--'));
}

/** Top-level selectors of every style rule: commas inside `:is()`/`:not()` stay put, keyframe steps are left out. */
function ruleSelectors(source: string): string[] {
  return withoutComments(source)
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

/** The body of the one rule whose prelude is exactly `prelude`. */
function ruleBody(prelude: string): string {
  const match = [...withoutComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    ([, found]) => found!.trim().replace(/\s+/g, ' ') === prelude
  );

  return match?.[2] ?? '';
}

/** The ordered class lists of the markup, which both frameworks must agree on. */
const classListsIn = (source: string, attribute: string) =>
  [...source.matchAll(new RegExp(`\\b${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]!);
const elementsIn = (source: string) => new Set([...source.matchAll(/<(media-[a-z-]+)/g)].map((match) => match[1]!));
const registeredIn = (source: string) =>
  new Set([...source.matchAll(/@videojs\/html\/ui\/([a-z-]+)/g)].map((match) => `media-${match[1]}`));

/** An 8-bit channel of `color-mix(in srgb, <base>[ p%], <black|white>[ q%])` over a grey base channel. */
function mixGrey(declaration: string, base: number): number {
  const match = /color-mix\(in srgb, var\([^)]+\)(?: ([\d.]+)%)?, (#000|#fff)(?: ([\d.]+)%)?\)/.exec(declaration);

  if (!match) throw new Error(`not a mix: ${declaration}`);

  const other = match[2] === '#fff' ? 255 : 0;
  const share = match[1] ? 1 - Number(match[1]) / 100 : Number(match[3]) / 100;

  return Math.round(base * (1 - share) + other * share);
}

describe('skin.css', () => {
  it('targets classes and state, never tag names', () => {
    const bare = selectors(css).filter((selector) =>
      selector
        .split(/[\s>+~]+/)
        .some((compound) => /^[a-z]/i.test(compound) && compound !== 'video' && !compound.startsWith('::'))
    );

    expect(bare).toEqual([]);
  });

  it('scopes every rule under the root, so several skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-videojs-3(?![\w-])|:where\(\.ps-videojs-3\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes, which are global', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-videojs-3-'))).toEqual([]);
  });

  it('declares the white of the fills on the root from the public accent token, and the glass from the classic tokens', () => {
    expect(rootBlock).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#fff\)/);
    expect(rootBlock).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\)/);
    expect(rootBlock).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*#242424\)/);
  });

  it("mixes 3.2's own shades back out of the default tokens", () => {
    const shade = (name: string) => rootBlock.match(new RegExp(`--ps-${name}:([^;]+);`))?.[1] ?? '';
    const fill = ruleBody(':where(.ps-videojs-3) .ps-play-progress').match(/color-mix\([^)]*\)[^)]*\)/g) ?? [];
    const level = ruleBody(':where(.ps-videojs-3) .ps-volume-level').match(/color-mix\([^)]*\)[^)]*\)/g) ?? [];

    // The secondary is #242424: the bar's lower halves, its top line, and the progress row's gradient.
    expect(
      ['bar-dark', 'bar-darker', 'bar-line', 'row-top', 'row-bottom'].map((name) => mixGrey(shade(name), 0x24))
    ).toEqual([0x1f, 0x17, 0x40, 0x22, 0x33]);
    // The accent is white: the glossy fill's four stops and the bottom of the volume level.
    expect(fill.map((mix) => mixGrey(mix, 0xff))).toEqual([0xef, 0xf5, 0xdb, 0xf1]);
    expect(level.map((mix) => mixGrey(mix, 0xff))).toEqual([0xcc]);
  });

  it('paints every icon from the inlined 137 x 116 Video.js 3.2 sprite, and loads nothing else', () => {
    const sprite = rootBlock.match(/--ps-sprite:\s*url\("data:image\/png;base64,([A-Za-z0-9+/=]+)"\)/)?.[1] ?? '';
    const png = Buffer.from(sprite, 'base64');

    expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([137, 116]);
    expect(css).not.toMatch(/url\((?!"data:)/);
  });

  it('positions the sprite glyphs where 3.2 did', () => {
    const position = (prelude: string) =>
      ruleBody(prelude).match(/background(?:-position)?:[^;]*?(-?\d+(?:px)? -?\d+(?:px)?)/)?.[1];

    expect(position(':where(.ps-videojs-3) .ps-play-control[data-paused] .ps-icon')).toBe('0 0');
    expect(position(':where(.ps-videojs-3) .ps-play-control .ps-icon')).toBe('-25px 0');
    expect(position(':where(.ps-videojs-3) .ps-fullscreen-control .ps-icon')).toBe('-50px 0');
    expect(position(':where(.ps-videojs-3) .ps-fullscreen-control[data-fullscreen] .ps-icon')).toBe('-75px 0');
    expect(position(':where(.ps-videojs-3) .ps-big-play-icon')).toBe('-100px 0');
    expect(position(':where(.ps-videojs-3) .ps-mute-control[data-volume-level="off"] .ps-icon')).toBe('0 -25px');
    expect(position(':where(.ps-videojs-3) .ps-mute-control[data-volume-level="low"] .ps-icon')).toBe('-25px -25px');
    expect(position(':where(.ps-videojs-3) .ps-mute-control[data-volume-level="medium"] .ps-icon')).toBe('-50px -25px');
    expect(position(':where(.ps-videojs-3) .ps-mute-control .ps-icon')).toBe('-75px -25px');
    expect(position(':where(.ps-videojs-3) .ps-seek-handle')).toBe('0 -50px');
    expect(position(':where(.ps-videojs-3) .ps-captions-button .ps-icon')).toBe('-25px -75px');
  });

  it('fades the bar in over 0.3s while the pointer is over the player and out over 1.5s once it leaves, after the first play', () => {
    expect(ruleBody(':where(.ps-videojs-3) .ps-bar')).toMatch(/transition: opacity 1\.5s linear;/);
    expect(ruleBody('.ps-videojs-3:hover .ps-bar, :where(.ps-videojs-3) .ps-bar:has(:focus-visible)')).toMatch(
      /transition: opacity 0\.3s linear;/
    );
    expect(css).toMatch(/\.ps-videojs-3:has\(\.ps-big-play:not\(\[data-started\]\)\)[^{]*\.ps-bar/);
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-videojs-3 > video');
    expect(css).toContain('.ps-videojs-3 ::slotted(video)');
  });
});

describe('videojs-3-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-videojs-3" data-theme="videojs-3" data-preset="video">'
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

  it('defines its own tag and class', () => {
    expect(html).toContain("const TAG_NAME = 'videojs-3-skin';");
    expect(html).toContain('export class Videojs3SkinElement extends BaseElement');
  });

  it('shows the current and remaining times, with its own minus, and keeps the duration hidden', () => {
    expect(template).toContain('<media-time class="ps-time-value" type="current"></media-time>');
    expect(template).toContain('type="remaining" negative-sign=""');
    expect(template).toContain('<media-time class="ps-time-value ps-duration-value" type="duration"></media-time>');
  });
});

describe('Videojs3Skin', () => {
  it('is a client component on the video preset', () => {
    expect(react.startsWith("'use client';\n")).toBe(true);
    expect(react).toContain('export function Videojs3Skin(');
    expect(react).toContain('export type Videojs3SkinProps = ContainerProps;');
    expect(react).toContain('data-preset="video"');
  });

  it('renders the same classes as the HTML element, in the same order', () => {
    // The HTML element alone roots the tree in a literal class list, and wraps the controls in `media-controls`
    // (`.ps-controls`) and the error dialog in its root element (`.ps-dialog`); React renders neither as an element.
    const htmlClasses = classListsIn(template, 'class').filter(
      (list) => !['media-skin ps-videojs-3', 'ps-controls', 'ps-dialog'].includes(list)
    );

    expect(classListsIn(react, 'className')).toEqual(htmlClasses);
  });

  it('switches off the Video.js minus on the remaining time, as the HTML element does', () => {
    expect(react).toContain('type="remaining" negativeSign=""');
  });
});

describe('package.json', () => {
  it('exports the HTML element and React component, the stylesheet and the open files, with html.js and skin.css as side effects', () => {
    expect(Object.keys(pkg.exports)).toEqual(['./html', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the Video.js peers exactly', () => {
    expect(pkg.peerDependencies['@videojs/html']).toBe('10.0.0-rc.2');
    expect(pkg.peerDependencies['@videojs/react']).toBe('10.0.0-rc.2');
  });
});
