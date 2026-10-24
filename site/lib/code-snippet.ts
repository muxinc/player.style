/** Every language a snippet on the site is written in; the highlighter loads nothing else. */
export type CodeLang = 'tsx' | 'ts' | 'html' | 'vue' | 'svelte' | 'json' | 'bash';

/** A snippet as the code frames take it: the raw code for the copy button, and its highlighted lines when there are. */
export interface HighlightedCode {
  code: string;
  /** Shiki token spans for the inside of a `<code>`; without it the frame shows the raw code. */
  html?: string;
}

/**
 * A stand-in accent the server writes into snippets that follow the accent picker, so they can be highlighted before
 * the visitor picks a color; the client swaps in the live accent. Six hex digits tokenize like any real accent.
 */
export const ACCENT_SENTINEL = '0ac0e7';

/** A snippet that follows the accent picker, highlighted once without an accent and once with the sentinel. */
export interface AccentCode {
  plain: HighlightedCode;
  accented: HighlightedCode;
}

function count(text: string, search: string): number {
  return text.split(search).length - 1;
}

/**
 * The snippet for the live accent: the plain one without an accent, otherwise the accented one with the sentinel
 * replaced. Should the highlighter ever split the sentinel across tokens, the frame falls back to the raw code rather
 * than show a stale color.
 */
export function resolveAccentCode({ plain, accented }: AccentCode, accent: string | undefined): HighlightedCode {
  if (!accent) return plain;

  const code = accented.code.replaceAll(ACCENT_SENTINEL, accent);
  const intact = accented.html && count(accented.html, ACCENT_SENTINEL) === count(accented.code, ACCENT_SENTINEL);

  return intact ? { code, html: accented.html!.replaceAll(ACCENT_SENTINEL, accent) } : { code };
}
