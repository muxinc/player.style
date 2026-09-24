import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vite-plus/test';

import { detectPreset, SOURCES } from '../index.ts';

/*
 * Checks every skin against what it will really meet, which a side-by-side look at the original cannot show: a
 * consumer's CSS pipeline and page reset, the state attributes Video.js 10 actually reflects, and keyboard access.
 */

const skinsDir = join(import.meta.dirname, '../../../skins');
const packages = readdirSync(skinsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(skinsDir, entry.name, SOURCES.template)))
  .map((entry) => entry.name)
  .sort();
/* Live-video packages share their on-demand sibling's stylesheet and have no `src/skin.css` of their own. */
const skins = packages.filter((name) => existsSync(join(skinsDir, name, SOURCES.stylesheet)));

const read = (skin: string, file: string) => readFileSync(join(skinsDir, skin, file), 'utf8');
const audioSkins = skins.filter((skin) => detectPreset(read(skin, SOURCES.template)) === 'audio');
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every innermost `{}` block: a style rule or keyframe step, with its prelude and declared property names. */
function blocks(css: string): { prelude: string; properties: string[] }[] {
  return [...stripComments(css).matchAll(/([^{}]*)\{([^{}]*)\}/g)].map((match) => ({
    prelude: match[1]!.trim().replace(/\s+/g, ' '),
    properties: [...match[2]!.matchAll(/(?:^|;)\s*(-?[a-z][a-z-]*)\s*:/g)].map((property) => property[1]!),
  }));
}

interface Compound {
  classes: string[];
  attributes: string[];
}

/**
 * The compound selectors of a selector list, each with its classes and attribute names. A functional pseudo-class
 * whose argument is attributes only (`:not([data-open])`) qualifies its own compound; any other argument
 * (`:has(.ps-button[data-paused])`) is read as compounds of its own.
 */
function compounds(selector: string): Compound[] {
  const found: Compound[] = [];
  let current: Compound = { classes: [], attributes: [] };
  const flush = () => {
    if (current.classes.length || current.attributes.length) found.push(current);
    current = { classes: [], attributes: [] };
  };

  for (let i = 0; i < selector.length;) {
    const rest = selector.slice(i);
    const char = selector[i]!;

    if (/[\s>+~,]/.test(char)) {
      flush();
      i++;
    } else if (char === '.') {
      const name = /^\.([\w-]+)/.exec(rest)![1]!;

      current.classes.push(name);
      i += name.length + 1;
    } else if (char === '[') {
      current.attributes.push(/^\[\s*([\w-]+)/.exec(rest)![1]!);
      i = selector.indexOf(']', i) + 1;
    } else if (char === '(') {
      let depth = 1;
      let end = i + 1;

      for (; depth; end++) {
        if (selector[end] === '(') depth++;
        else if (selector[end] === ')') depth--;
      }

      const nested = compounds(selector.slice(i + 1, end - 1));

      if (nested.every((compound) => !compound.classes.length)) {
        current.attributes.push(...nested.flatMap((compound) => compound.attributes));
      } else found.push(...nested);
      i = end;
    } else i++;
  }
  flush();
  return found;
}

/**
 * The `data-*` attributes each Video.js 10 element reflects, from `@videojs/core`'s `<Name>DataAttrs` maps keyed by
 * the element they belong to (`PlayButtonDataAttrs` → `media-play-button`). The skins reach core through
 * `@videojs/html`, so it resolves from there.
 */
async function reflectedAttributes(): Promise<Map<string, Set<string>>> {
  const html = createRequire(join(skinsDir, skins[0]!, 'package.json')).resolve('@videojs/html/package.json');
  const core: Record<string, unknown> = await import(pathToFileURL(createRequire(html).resolve('@videojs/core')).href);
  const byTag = new Map<string, Set<string>>();

  for (const [name, map] of Object.entries(core)) {
    if (!name.endsWith('DataAttrs') || !map || typeof map !== 'object') continue;

    const tag = `media-${name
      .slice(0, -'DataAttrs'.length)
      .replace(/PiP/g, 'Pip')
      .replace(/AirPlay/g, 'Airplay')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()}`;

    byTag.set(tag, new Set(Object.values(map as Record<string, string>)));
  }
  // The slider's preview thumbnail is the thumbnail element bound to the pointer.
  byTag.set('media-slider-thumbnail', byTag.get('media-thumbnail')!);
  return byTag;
}

const reflected = await reflectedAttributes();

describe('skin.css', () => {
  /*
   * The React component renders in the page's light DOM, where a host reset (Tailwind's preflight) sets its own
   * sizing.
   */
  it.each(skins)('%s sizes every element it styles as border-box', (skin) => {
    const reset = blocks(read(skin, SOURCES.stylesheet)).find(({ prelude }) =>
      new RegExp(`^(?::where\\()?\\.ps-${skin}\\)? \\*,`).test(prelude)
    );

    expect(reset?.properties).toContain('box-sizing');
  });

  /*
   * Lightning CSS (Next's Turbopack, Vite's `lightningcss` transformer, Tailwind 4) folds `translate`, `scale` and
   * `rotate` into `transform` within a rule, or drops them when `transform` follows. Any later rule that sets
   * `transform` on the element then wipes the folded offset: the YT thumb sat 6.5px off its track on the site.
   */
  it.each(skins)('%s never mixes transform with translate, scale or rotate in one rule', (skin) => {
    const mixed = blocks(read(skin, SOURCES.stylesheet))
      .filter(
        ({ properties }) =>
          properties.includes('transform') && properties.some((name) => ['translate', 'scale', 'rotate'].includes(name))
      )
      .map(({ prelude }) => prelude);

    expect(mixed).toEqual([]);
  });

  /*
   * A state selector on an attribute the element never carries is dead: `.ps-thumbnail:not([data-loaded])` hid every
   * storyboard thumbnail, since the thumbnail reflects `data-loading`, `data-error` and `data-hidden` and only the poster
   * reflects `data-loaded`. Classes map to elements through the template; attributes the skin writes itself pass.
   */
  it.each(skins)('%s reads only the state attributes its elements reflect', (skin) => {
    const template = read(skin, SOURCES.template);
    const written = new Set(
      [...`${template}\n${read(skin, SOURCES.react)}`.matchAll(/\b(data-[a-z-]+)=/g)].map((match) => match[1]!)
    );
    const tagsByClass = new Map<string, Set<string>>();

    for (const [, tag, classList] of template.matchAll(/<(media-[a-z-]+)\b[^>]*\bclass="([^"]+)"/g)) {
      for (const name of classList!.split(/\s+/)) tagsByClass.set(name, (tagsByClass.get(name) ?? new Set()).add(tag!));
    }

    const unknown = new Set<string>();

    for (const { prelude } of blocks(read(skin, SOURCES.stylesheet))) {
      if (prelude.startsWith('@') || /^(?:from|to|[\d.]+%)/.test(prelude)) continue;

      for (const { classes, attributes } of compounds(prelude)) {
        for (const name of classes) {
          const tags = tagsByClass.get(name);
          // A class shared by several elements, or on one without a known map, cannot be checked.
          const allowed = tags?.size === 1 ? reflected.get([...tags][0]!) : undefined;
          if (!allowed) continue;

          for (const attribute of attributes) {
            if (attribute.startsWith('data-') && !allowed.has(attribute) && !written.has(attribute)) {
              unknown.add(`.${name}[${attribute}] (${[...tags!][0]})`);
            }
          }
        }
      }
    }

    expect([...unknown]).toEqual([]);
  });
});

describe('skin.css and template.html', () => {
  /*
   * Video.js 10 seeks when a drag ends, so `--media-slider-fill` stands still until then; a time slider's fill has to
   * follow `--media-slider-pointer` under `[data-dragging]`, as media-chrome's range did through its input element.
   */
  it.each(skins)('%s moves the time fill with the pointer while dragging', (skin) => {
    const css = stripComments(read(skin, SOURCES.stylesheet));
    const fills = [
      ...read(skin, SOURCES.template).matchAll(/<media-time-slider\b[^>]*>([\s\S]*?)<\/media-time-slider>/g),
    ].flatMap(([, inner]) => [...inner!.matchAll(/<media-slider-fill\b[^>]*\bclass="([^"]+)"/g)].map((m) => m[1]!));
    const still = [...new Set(fills)].filter((classList) => {
      const name = classList.split(/\s+/)[0]!;

      return ![...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)].some(
        ([, prelude, body]) =>
          prelude!.includes('[data-dragging]') &&
          new RegExp(`\\.${name}(?![\\w-])`).test(prelude!) &&
          body!.includes('--media-slider-pointer')
      );
    });

    expect(still).toEqual([]);
  });
});

describe('skin.css on the audio preset', () => {
  /*
   * An audio skin shows no picture, so it hides its media. In the shadow root the media is whatever lands in the
   * default slot, and `::slotted(audio)` misses `<mux-audio>` and the other media elements: their inline box opened an
   * empty line above Sutro Audio, 17px taller as the HTML element than as the React component on a Mux source.
   */
  it.each(audioSkins)('%s hides everything in the default slot, whatever the media element', (skin) => {
    const hidden = [...stripComments(read(skin, SOURCES.stylesheet)).matchAll(/([^{}]*)\{([^{}]*)\}/g)].some(
      ([, prelude, body]) =>
        prelude!.includes('::slotted(:not([slot]))') && /(?:^|;)\s*display\s*:\s*none\b/.test(body!)
    );

    expect(hidden).toBe(true);
  });
});

describe('template.html', () => {
  /*
   * A Video.js 10 slider takes `role="slider"`, its accessible name and its tab stop from its thumb: without one the
   * slider cannot be reached from the keyboard at all. A theme that drew no handle keeps an invisible thumb.
   */
  it.each(packages)('%s gives every slider a thumb', (skin) => {
    const sliders = [
      ...read(skin, SOURCES.template).matchAll(
        /<(media-(?:time|volume)-slider)\b[^>]*\bclass="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g
      ),
    ];
    const thumbless = sliders
      .filter(([, , , inner]) => !/<media-slider-thumb\b(?!nail)/.test(inner!))
      .map(([, tag, classList]) => `${tag}.${classList!.split(/\s+/).join('.')}`);

    expect(thumbless).toEqual([]);
  });
});
