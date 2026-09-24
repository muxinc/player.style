import { createHighlighterCore, hastToHtml, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import type { AccentCode, CodeLang, HighlightedCode } from './code-snippet';

/**
 * The Video.js 10 code theme: code frames are dark in both site themes, so both palettes are dark gruvbox ones, hard on
 * the light site (the frame is faded black) and soft on the dark site (the frame is soot, the theme's own background).
 */
const THEMES = { light: 'gruvbox-dark-hard', dark: 'gruvbox-dark-soft' } as const;

const LANG_IDS: Record<CodeLang, string> = {
  tsx: 'tsx',
  ts: 'typescript',
  html: 'html',
  vue: 'vue',
  svelte: 'svelte',
  json: 'json',
  bash: 'bash',
};

const HIGHLIGHTER_KEY = Symbol.for('player.style/shiki');

type HighlighterGlobal = typeof globalThis & { [HIGHLIGHTER_KEY]?: Promise<HighlighterCore> };

/** One highlighter per server process, surviving dev module reloads; its grammars stay loaded for the process's life. */
function getHighlighter(): Promise<HighlighterCore> {
  const scope = globalThis as HighlighterGlobal;

  scope[HIGHLIGHTER_KEY] ??= createHighlighterCore({
    themes: [import('shiki/themes/gruvbox-dark-hard.mjs'), import('shiki/themes/gruvbox-dark-soft.mjs')],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/vue.mjs'),
      import('shiki/langs/svelte.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/bash.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  });

  return scope[HIGHLIGHTER_KEY];
}

// Pages render per request from their search params, and most visitors land on the same few combinations, so the
// rendered HTML is kept by language and code. The cap only guards against a crawler walking every combination.
const CACHE_LIMIT = 1000;
const cache = new Map<string, string>();

/**
 * The code's lines as shiki token spans, for the inside of a `<code>`: each span carries `--shiki-light` and
 * `--shiki-dark` and no color of its own, so the frame picks the palette with the site's `.dark` class.
 */
export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const key = `${lang}\0${code}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const highlighter = await getHighlighter();
  const hast = highlighter.codeToHast(code, { lang: LANG_IDS[lang], themes: THEMES, defaultColor: false });
  const pre = hast.children[0];
  const codeNode = pre?.type === 'element' ? pre.children[0] : undefined;
  if (codeNode?.type === 'element') hast.children = codeNode.children;

  const html = hastToHtml(hast);

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(key, html);

  return html;
}

/** A snippet ready for the code frames: the raw code and its highlighted lines. */
export async function highlightCode(code: string, lang: CodeLang): Promise<HighlightedCode> {
  return { code, html: await highlight(code, lang) };
}

/** Both accent states of a snippet that follows the accent picker, from the code each state renders. */
export async function highlightAccentCode(plain: string, accented: string, lang: CodeLang): Promise<AccentCode> {
  const [plainCode, accentedCode] = await Promise.all([highlightCode(plain, lang), highlightCode(accented, lang)]);

  return { plain: plainCode, accented: accentedCode };
}
