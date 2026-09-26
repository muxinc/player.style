import { describe, expect, it } from 'vite-plus/test';

import { ACCENT_SENTINEL, resolveAccentCode } from '../code-snippet';
import { highlight, highlightAccentCode } from '../highlight';
import { getSkin, isThirdPartySkin } from '../skins';
import { FRAMEWORKS, getThirdPartySnippets, INSTALL_KINDS } from '../third-party-usage';

describe('highlight', () => {
  it('returns the lines as token spans carrying both palettes and no color of their own', async () => {
    const html = await highlight("import '@videojs/html/video/player';", 'ts');

    expect(html).toMatch(/^<span class="line">/);
    expect(html).toContain('--shiki-light:');
    expect(html).toContain('--shiki-dark:');
    expect(html).not.toMatch(/[";]color:/);
    expect(html).not.toContain('<pre');
  });
});

describe('highlightAccentCode', () => {
  it('keeps the sentinel accent in one token in every usage snippet, so the live accent can replace it', async () => {
    const yt = getSkin('yt');
    if (!yt || !isThirdPartySkin(yt)) throw new Error('yt is missing');

    for (const { id: framework } of FRAMEWORKS) {
      for (const { id: install } of INSTALL_KINDS) {
        const selection = { framework, install, renderer: 'mux-video' as const };
        const plain = getThirdPartySnippets(yt, 'video', selection).flatMap((block) => block.files);
        const accented = getThirdPartySnippets(yt, 'video', { ...selection, accent: ACCENT_SENTINEL }).flatMap(
          (block) => block.files
        );

        for (const [index, file] of plain.entries()) {
          const code = await highlightAccentCode(file.code, accented[index]!.code, file.lang);
          const resolved = resolveAccentCode(code, 'f5c518');

          expect(resolved.html, `${framework} ${install} ${file.name}`).toBeDefined();
          expect(resolved.html).not.toContain(ACCENT_SENTINEL);
        }
      }
    }
  });
});
