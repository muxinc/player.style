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

/** Every selector list in the stylesheet, comments, `data:` URLs and `@`-rule preludes stripped. */
function selectors(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\("data:[^"]*"\)/g, '')
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

/** The `d` attribute of every SVG path. The React component draws each repeated icon set once, in a component. */
const iconPaths = (source: string) => new Set([...source.matchAll(/<path\s[^>]*?d="([^"]+)"/g)].map((m) => m[1]!));
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
      (selector) => !/^(?:\.ps-vidstack(?![\w-])|:where\(\.ps-vidstack\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-vidstack-'))).toEqual([]);
  });

  it("declares Vidstack's brand colour from the accent token, near-white by default", () => {
    expect(rule('.ps-vidstack')).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#f5f5f5\);/);
  });

  it('reads the controls colour, the panel black and the font from the classic tokens', () => {
    const declarations = rule('.ps-vidstack');

    expect(declarations).toMatch(/--ps-controls:\s*var\(--media-primary-color,\s*#f5f5f5\);/);
    expect(declarations).toMatch(/--ps-surface:\s*var\(--media-secondary-color,\s*rgb\(10 10 10\)\);/);
    expect(declarations).toMatch(/--ps-tooltip-bg:\s*var\(--media-secondary-color,\s*#000\);/);
    expect(declarations).toMatch(/--ps-font-family:\s*var\(--media-font-family,\s*sans-serif\);/);
    expect(declarations).toMatch(/border-radius:\s*var\(--media-border-radius,\s*6px\);/);
  });

  it('paints the slider fills and the spinner in the brand colour', () => {
    expect(css).toMatch(
      /^:where\(\.ps-vidstack\) \.ps-fill,\n:where\(\.ps-vidstack\) \.ps-volume-fill \{[^}]*background-color:\s*var\(--ps-accent\);/m
    );
    expect(rule(':where(.ps-vidstack) .ps-spinner-fill')).toMatch(/color:\s*var\(--ps-accent\);/);
  });

  it("keeps Vidstack's geometry: 38px buttons, a 45px slider with a 5px track, a 15px thumb and a 26px lift", () => {
    expect(rule(':where(.ps-vidstack) .ps-lg')).toMatch(/--ps-button-size:\s*38px;/);
    expect(rule(':where(.ps-vidstack) .ps-time-slider')).toMatch(/height:\s*45px;/);
    expect(css).toContain('--ps-track-height: 5px;');
    expect(css).toContain('--ps-thumb-size: 15px;');
    expect(rule(':where(.ps-vidstack) .ps-lg .ps-group-bar .ps-tooltip')).toMatch(
      /--media-tooltip-side-offset:\s*26px;/
    );
    expect(rule(':where(.ps-vidstack) .ps-lg .ps-menu')).toMatch(/--media-popover-side-offset:\s*26px;/);
  });

  it('switches to the small layout on the container, where a 16:9 Vidstack player would', () => {
    expect(rule('.ps-vidstack')).toMatch(/container:\s*ps-vidstack \/ inline-size;/);
    expect(css).toContain('@container ps-vidstack (inline-size < 677px)');
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-vidstack > video');
    expect(css).toContain('.ps-vidstack ::slotted(video)');
  });
});

describe('vidstack-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-vidstack" data-theme="vidstack" data-preset="video">'
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

  it('links every tooltip and menu to its trigger by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const targets = [...template.matchAll(/\b(?:trigger|commandfor)="([^"]+)"/g)].map((match) => match[1]!);

    expect(targets.length).toBeGreaterThan(0);
    expect(targets.filter((id) => !ids.has(id))).toEqual([]);
  });

  it('defines its own tag and labels speeds the way Vidstack did', () => {
    expect(html).toContain("const TAG_NAME = 'vidstack-skin';");
    expect(html).toContain('export class VidstackSkinElement extends BaseElement');
    expect(html).toContain("return rate === 1 ? 'Normal' : `${rate}x`;");
  });

  it('shows the spinner as soon as playback stalls and tooltips after 700ms, as the original did', () => {
    expect(template).toContain('<media-buffering-indicator class="ps-buffering" delay="0">');
    expect(react).toContain('<BufferingIndicator className="ps-buffering" delay={0}>');

    const delays = [...template.matchAll(/<media-tooltip\s[^>]*>/g)].map((m) => /delay="(\d+)"/.exec(m[0])?.[1]);

    expect(new Set(delays)).toEqual(new Set(['700']));
    expect(react).toContain('delay={700}');
  });
});

describe('VidstackSkin', () => {
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
    expect(react).toContain('export function VidstackSkin(');
    expect(react).toContain('export type VidstackSkinProps = ContainerProps;');
    expect(react).toContain('data-preset="video"');
    expect(react).toContain("return rate === 1 ? 'Normal' : `${rate}x`;");
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
