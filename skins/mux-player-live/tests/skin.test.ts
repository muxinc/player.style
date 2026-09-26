import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const root = join(import.meta.dirname, '..');
const sibling = join(root, '../mux-player');
const read = (file: string, from = root) => readFileSync(join(from, file), 'utf8');

/* The stylesheet is the on-demand package's: this package has no `src/skin.css` of its own. */
const css = read('src/skin.css', sibling);
const template = read('src/html/template.html');
const html = read('src/html/index.ts');
const react = read('src/react/index.tsx');
const onDemandTemplate = read('src/html/template.html', sibling);
const onDemandHtml = read('src/html/index.ts', sibling);
const pkg = JSON.parse(read('package.json')) as {
  name: string;
  homepage: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
};
const siblingPkg = JSON.parse(read('package.json', sibling)) as { exports: Record<string, unknown> };

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
  it("is @player.style/mux-player's stylesheet, shared rather than copied", () => {
    expect(existsSync(join(root, 'src/skin.css'))).toBe(false);
    expect(read('vite.config.ts')).toContain(
      "defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../mux-player/src/skin.css' })"
    );
    expect(html).toContain("import styles from '../../../mux-player/src/skin.css?inline';");
  });

  it('scopes every rule under the shared root, so both frameworks and other skins can share a page', () => {
    const unscoped = ruleSelectors(css).filter(
      (selector) => !/^(?:\.ps-mux-player(?![\w-])|:where\(\.ps-mux-player\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('keys live-only rules on the live-video preset inside the root scope', () => {
    const live = ruleSelectors(css).filter((selector) => selector.includes('data-preset'));

    expect(live.length).toBeGreaterThan(0);
    expect(live.every((selector) => selector.startsWith('.ps-mux-player[data-preset="live-video"]'))).toBe(true);
  });

  it("declares the brand colour from the accent token and keeps the live button's colour tokens", () => {
    expect(rule('.ps-mux-player')).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*#fa50b5\);/);
    expect(css).toContain('var(--media-live-button-icon-color, rgb(140 140 140))');
    expect(css).toContain('var(--media-live-button-indicator-color, rgb(255 0 0))');
    expect(css).toContain(
      '.ps-mux-player[data-preset="live-video"] .ps-live-button[data-live-edge] .ps-live-indicator'
    );
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
});

describe('MuxPlayerLiveSkinElement', () => {
  it("keeps a copy of the on-demand package's shadow-root host, apart from its names, stylesheet path and rate labels", () => {
    // The live layout has no rate menu, so it leaves out the on-demand host's `formatRate` wiring.
    const host = (source: string) =>
      source
        .slice(source.indexOf("import markup from './template.html?raw';"))
        .replace(/\/\*\* Mux Player labels rates[\s\S]*?\n\}\n\n/, '')
        .replace(/\n {4}\/\/ `formatRate` is a plain class field[\s\S]*?rates\.formatRate = formatRate;\n/, '')
        .replace(/^import styles from '[^']+';$/m, "import styles from '<skin.css>';")
        .replace(/\/\*\*\n \* `<mux-player[\s\S]*?\*\/\n/, '')
        .replace(/mux-player-live-skin/g, 'mux-player-skin')
        .replace(/MuxPlayerLiveSkinElement/g, 'MuxPlayerSkinElement');

    expect(host(html)).toBe(host(onDemandHtml));
  });
});

describe('mux-player-live-skin', () => {
  it('roots the skin in a media-container on the live-video preset, under the shared root class and theme', () => {
    expect(template).toContain(
      '<media-container class="media-skin ps-mux-player" data-theme="mux-player" data-preset="live-video">'
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
    expect(html).toContain("const TAG_NAME = 'mux-player-live-skin';");
    expect(html).toContain('export class MuxPlayerLiveSkinElement extends BaseElement');
  });

  it('drops the seek bar, seek buttons, time and rate of the on-demand package and leads the title bar with Live', () => {
    const dropped = [
      'media-time-slider',
      'media-slider-preview',
      'media-seek-button',
      'media-time-group',
      'media-playback-rate-button',
      'media-playback-rate-radio-group',
    ];

    for (const tag of dropped) {
      expect(elementsIn(onDemandTemplate).has(tag), tag).toBe(true);
      expect(elementsIn(template).has(tag), tag).toBe(false);
    }
    expect(template).toMatch(/<div class="ps-top">\s*<media-live-button class="ps-button ps-live-button">/);
    expect(react).toMatch(/<div className="ps-top">\s*<LiveButton className="ps-button ps-live-button">/);
    expect(template).toContain('<span class="ps-live-text">Live</span>');
    expect(react).toContain('<span className="ps-live-text">Live</span>');
  });

  it('keeps no seek hotkeys', () => {
    expect(onDemandTemplate).toContain('action="seekStep"');
    expect(template).not.toContain('seekStep');
    expect(react).not.toContain('seekStep');
  });

  it('links every menu trigger and tooltip to an element by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const targets = [...template.matchAll(/\b(?:commandfor|trigger)="([^"]+)"/g)].map((match) => match[1]!);

    expect(targets.length).toBe(12);
    expect(targets.filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe('MuxPlayerLiveSkin', () => {
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
    expect(react).toContain('export function MuxPlayerLiveSkin(');
    expect(react).toContain('export type MuxPlayerLiveSkinProps = ContainerProps;');
    expect(react).toContain("className={classNames('media-skin ps-mux-player', className)}");
    expect(react).toContain('data-theme="mux-player"');
    expect(react).toContain('data-preset="live-video"');
  });
});

describe('package.json', () => {
  it('is the sibling package of @player.style/mux-player with the same export map', () => {
    expect(pkg.name).toBe('@player.style/mux-player-live');
    expect(pkg.homepage).toBe('https://player.style/skins/mux-player-live');
    expect(pkg.exports).toEqual(siblingPkg.exports);
    expect(Object.keys(pkg.exports)).toEqual(['./html', './react', './skin.css', './open/*', './package.json']);
    expect(pkg.sideEffects).toEqual(['./dist/html.js', './dist/skin.css']);
  });

  it('pins the Video.js peers exactly', () => {
    expect(pkg.peerDependencies['@videojs/html']).toMatch(/^\d+\.\d+\.\d+(?:-[\w.]+)?$/);
    expect(pkg.peerDependencies['@videojs/react']).toBe(pkg.peerDependencies['@videojs/html']);
  });
});
