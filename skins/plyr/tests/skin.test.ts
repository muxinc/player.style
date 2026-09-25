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

/** The `d` attribute of every SVG path, sorted; the React component keeps repeated glyphs in constants. */
function iconPaths(source: string): string[] {
  const constants = new Map(
    [...source.matchAll(/const ([A-Z]+) =\s*'([^']+)';/g)].map((match) => [match[1]!, match[2]!])
  );

  return [...source.matchAll(/<path\s[^>]*?d=(?:"([^"]+)"|\{([A-Z]+)\})/g)]
    .map((match) => match[1] ?? constants.get(match[2]!)!)
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
      (selector) => !/^(?:\.ps-plyr(?![\w-])|:where\(\.ps-plyr\)\s)/.test(selector)
    );

    expect(unscoped).toEqual([]);
  });

  it('prefixes its keyframes with the skin name', () => {
    const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]!);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith('ps-plyr-'))).toEqual([]);
  });

  it("routes Plyr's main colour through the accent token, with Plyr's blue when unset", () => {
    expect(rule('.ps-plyr')).toMatch(/--ps-accent:\s*var\(--media-accent-color,\s*hsl\(198deg 100% 50%\)\);/);
  });

  it('reads the control colour and the gradient from the primary and secondary tokens', () => {
    const declarations = rule('.ps-plyr');

    expect(declarations).toMatch(/--ps-primary:\s*var\(--media-primary-color,\s*#fff\);/);
    expect(declarations).toMatch(/--ps-secondary:\s*var\(--media-secondary-color,\s*#000\);/);
    expect(rule(':where(.ps-plyr) .ps-controls-bar')).toContain(
      'background: linear-gradient(transparent, color-mix(in srgb, var(--ps-secondary) 75%, transparent));'
    );
  });

  it('paints the brand colour only through the accent property', () => {
    expect(css.match(/hsl\(198deg/g)).toHaveLength(1);
    expect(rule(':where(.ps-plyr) .ps-big-play')).toContain('background: var(--ps-accent);');
    expect(rule(':where(.ps-plyr) .ps-button:is(:focus-visible, [aria-expanded="true"])')).toContain(
      'background: var(--ps-accent);'
    );
  });

  it('lights controls on hover only for a pointer that hovers, so a tap on a phone does not leave them lit', () => {
    const plain = css.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}\n/, '');

    expect(css).toMatch(/@media \(hover: hover\) \{\s*:where\(\.ps-plyr\) \.ps-big-play:hover/);
    expect(ruleSelectors(plain).filter((selector) => selector.includes(':hover'))).toEqual([
      ':where(.ps-plyr) .ps-layer:not([data-visible]):not(:has(.ps-controls-bar:hover)) .ps-controls-bar',
      ':where(.ps-plyr) .ps-layer:not([data-visible]):not(:has(.ps-controls-bar:hover)) .ps-controls-bar *',
    ]);
  });

  it('gives touch screens 44px hit areas, no volume range and no double-tap zoom', () => {
    const touch = css.slice(css.indexOf('@media (pointer: coarse) {'));

    expect(rule('.ps-plyr')).toContain('touch-action: manipulation;');
    expect(touch).toMatch(/\.ps-volume-slider \{\s*display: none;/);
    expect(touch).toMatch(/\.ps-button::before \{[^}]*inset: -6px;/);
    expect(touch).toMatch(/\.ps-progress::before \{\s*inset: -12\.5px -6\.5px;/);
    expect(touch).toMatch(/\.ps-menu-item \{\s*min-height: 44px;/);
  });

  it('never hides play, the progress bar, mute or fullscreen as the player narrows', () => {
    const hidden = [...css.matchAll(/@container ps-plyr \(inline-size < \d+px\) \{\s*([^{]+)\{\s*display: none;/g)].map(
      (match) => match[1]!.trim()
    );

    expect(hidden.length).toBeGreaterThan(0);
    expect(
      hidden.filter((selector) => /\.ps-(play-button|progress|mute-button|fullscreen-button)\b/.test(selector))
    ).toEqual([]);
  });

  it("keeps Plyr's fixed pixel geometry", () => {
    expect(rule(':where(.ps-plyr) .ps-button')).toMatch(/padding:\s*7px;/);
    expect(rule(':where(.ps-plyr) .ps-icon')).toMatch(/width:\s*18px;\s*height:\s*18px;/);
    expect(rule(':where(.ps-plyr) .ps-big-play')).toMatch(/padding:\s*15px;/);
    expect(rule(':where(.ps-plyr) .ps-thumb')).toMatch(/width:\s*13px;\s*height:\s*13px;/);
    expect(css).toMatch(/\.ps-volume-track \{[^}]*height: 5px;/);
    expect(rule(':where(.ps-plyr) .ps-controls-bar')).toMatch(/padding:\s*20px 5px 5px;/);
    expect(css).toMatch(
      /@container ps-plyr \(inline-size >= 480px\) \{\s*:where\(\.ps-plyr\) \.ps-controls-bar \{\s*padding: 35px 10px 10px;/
    );
  });

  it('styles the media both as a light-DOM child and as slotted content', () => {
    expect(css).toContain('.ps-plyr > video');
    expect(css).toContain('.ps-plyr ::slotted(video)');
  });
});

describe('plyr-skin', () => {
  it('roots the skin in a media-container on the video preset', () => {
    expect(template).toContain('<media-container class="media-skin ps-plyr" data-theme="plyr" data-preset="video">');
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

  it('defines its own tag', () => {
    expect(html).toContain("const TAG_NAME = 'plyr-skin';");
    expect(html).toContain('export class PlyrSkinElement extends BaseElement');
  });

  it('links the settings button and every submenu entry to a page by id', () => {
    const ids = new Set([...template.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]!));
    const targets = [...template.matchAll(/\bcommandfor="([^"]+)"/g)].map((match) => match[1]!);

    expect(targets).toEqual(['plyr-settings', 'plyr-captions', 'plyr-quality', 'plyr-speed']);
    expect(targets.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("stripes the buffer 250ms into a stall, as Plyr's loading state did", () => {
    expect(template).toContain('<media-buffering-indicator class="ps-progress-loading" delay="250">');
    expect(react).toContain('<BufferingIndicator className="ps-progress-loading" delay={250} />');
  });

  it('labels speeds the way Plyr did, in both frameworks', async () => {
    const { formatRate } = await import('../src/html/index');

    expect([0.5, 1, 1.5].map(formatRate)).toEqual(['0.5×', 'Normal', '1.5×']);
    expect(react).toContain("return rate === 1 ? 'Normal' : `${rate}×`;");
    expect(react).toContain('<PlaybackRateRadioGroup.Root formatRate={formatRate}>');
  });

  it("draws Plyr's sprite icons verbatim", () => {
    // `plyr.svg` from plyr@3.8.4: play, pause, muted, volume (2), captions (off and on), settings, pip (2),
    // airplay (2), enter and exit fullscreen, with play repeated for the big play button.
    expect(iconPaths(template)).toHaveLength(15);
    expect(template.match(/viewBox="0 0 18 18"/g)).toHaveLength(12);
  });
});

describe('PlyrSkin', () => {
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
    expect(react).toContain('export function PlyrSkin(');
    expect(react).toContain('export type PlyrSkinProps = ContainerProps;');
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
