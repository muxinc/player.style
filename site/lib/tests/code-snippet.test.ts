import { describe, expect, it } from 'vite-plus/test';

import { ACCENT_SENTINEL, resolveAccentCode, type AccentCode } from '../code-snippet';

const snippet: AccentCode = {
  plain: { code: '<x-skin>', html: '<span>&lt;x-skin&gt;</span>' },
  accented: {
    code: `<x-skin style="--media-accent-color: #${ACCENT_SENTINEL}">`,
    html: `<span>&lt;x-skin style="--media-accent-color: #${ACCENT_SENTINEL}"&gt;</span>`,
  },
};

describe('resolveAccentCode', () => {
  it('shows the plain snippet until an accent is picked', () => {
    expect(resolveAccentCode(snippet, undefined)).toBe(snippet.plain);
  });

  it('swaps the live accent into both the code and the highlighted lines', () => {
    expect(resolveAccentCode(snippet, 'f5c518')).toEqual({
      code: '<x-skin style="--media-accent-color: #f5c518">',
      html: '<span>&lt;x-skin style="--media-accent-color: #f5c518"&gt;</span>',
    });
  });

  it('falls back to the raw code when the highlighted lines lost a sentinel', () => {
    const split = { ...snippet, accented: { ...snippet.accented, html: '<span>0ac</span><span>0e7</span>' } };

    expect(resolveAccentCode(split, 'f5c518')).toEqual({ code: '<x-skin style="--media-accent-color: #f5c518">' });
  });
});
