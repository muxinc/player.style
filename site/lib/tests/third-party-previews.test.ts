import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

import { suffixIds, takesByline } from '../third-party-previews';

const skinsDir = join(import.meta.dirname, '../../../skins');

describe('suffixIds', () => {
  it('suffixes ids and every attribute that refers to one', () => {
    const markup =
      '<button id="play" commandfor="menu"></button><media-tooltip trigger="play"></media-tooltip>' +
      '<div aria-labelledby="a b"></div>';

    expect(suffixIds(markup, '2')).toBe(
      '<button id="play-2" commandfor="menu-2"></button><media-tooltip trigger="play-2"></media-tooltip>' +
        '<div aria-labelledby="a-2 b-2"></div>'
    );
  });

  it('suffixes fragment links, so an SVG <use> still finds the glyph it draws', () => {
    const markup = '<svg><use href="#icon"></use><use xlink:href="#icon"></use><g id="icon"></g></svg>';

    expect(suffixIds(markup, '1')).toBe(
      '<svg><use href="#icon-1"></use><use xlink:href="#icon-1"></use><g id="icon-1"></g></svg>'
    );
  });

  it('leaves links to other pages alone', () => {
    expect(suffixIds('<a href="https://videojs.org/#top"></a>', '1')).toBe('<a href="https://videojs.org/#top"></a>');
  });
});

describe('takesByline', () => {
  it('holds for markup whose comment says to add a byline, and not for a byline mentioned outside one', () => {
    expect(takesByline('<!-- For a byline, add <span class="ps-byline">…</span> after it. -->')).toBe(true);
    expect(takesByline('<!-- A title. --><span class="ps-byline">x</span>')).toBe(false);
    expect(takesByline('<media-title></media-title>')).toBe(false);
  });

  it('finds a place only in skins whose catalog has the preview pass a byline', () => {
    const withByline = readdirSync(skinsDir).filter((name) => {
      try {
        const html = join(skinsDir, name, 'html/src');

        return readdirSync(html).some((preset) => {
          try {
            return takesByline(readFileSync(join(html, preset, 'skin.html'), 'utf8'));
          } catch {
            return false;
          }
        });
      } catch {
        return false;
      }
    });

    expect(withByline).toContain('sutro-audio');
    for (const name of withByline) {
      const catalog = JSON.parse(readFileSync(join(skinsDir, name, 'catalog.json'), 'utf8')) as {
        preview?: { metadata?: boolean };
      };

      expect(catalog.preview?.metadata, name).toBe(true);
    }
  });
});
