import { describe, expect, it } from 'vite-plus/test';

import { suffixIds } from '../third-party-previews';

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
