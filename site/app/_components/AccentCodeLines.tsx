'use client';

import CodeLine from './CodeLine';
import { useAccent } from './useAccent';

const EXAMPLE_ACCENT = 'f5c518';

type AccentCodeLinesProps = {
  htmlSkin: string;
  reactSkin: string;
};

/** Copyable lines that set `--media-accent-color`, following the live accent (or an example one when unset). */
export default function AccentCodeLines({ htmlSkin, reactSkin }: AccentCodeLinesProps) {
  const accent = useAccent();
  const hex = `#${accent ?? EXAMPLE_ACCENT}`;

  return (
    <>
      <CodeLine
        label={accent ? 'HTML' : 'HTML (example)'}
        code={`<${htmlSkin} style="--media-accent-color: ${hex}">`}
      />
      <CodeLine
        label={accent ? 'React' : 'React (example)'}
        code={`<${reactSkin} style={{ '--media-accent-color': '${hex}' }}>`}
      />
    </>
  );
}
