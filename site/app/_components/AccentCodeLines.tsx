'use client';

import { resolveAccentCode, type HighlightedCode } from '@/lib/code-snippet';

import CodeLine from './CodeLine';
import { useAccent } from './useAccent';

const EXAMPLE_ACCENT = 'f5c518';

type AccentCodeLinesProps = {
  /** Both lines highlighted on the server with the sentinel accent in place of the color. */
  html: HighlightedCode;
  react: HighlightedCode;
};

/** Copyable lines that set `--media-accent-color`, following the live accent (or an example one when unset). */
export default function AccentCodeLines({ html, react }: AccentCodeLinesProps) {
  const accent = useAccent();
  const hex = accent ?? EXAMPLE_ACCENT;

  return (
    <>
      <CodeLine
        label={accent ? 'HTML' : 'HTML (example)'}
        {...resolveAccentCode({ plain: html, accented: html }, hex)}
      />
      <CodeLine
        label={accent ? 'React' : 'React (example)'}
        {...resolveAccentCode({ plain: react, accented: react }, hex)}
      />
    </>
  );
}
