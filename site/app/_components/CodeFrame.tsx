import type { ReactNode } from 'react';

import type { HighlightedCode } from '@/lib/code-snippet';

import CopyButton from './CopyButton';

type CodeFrameProps = {
  label: string;
  code: string;
  /** Replaces the label in the header bar, for a file switcher; the label still names the copy button. */
  header?: ReactNode;
  children: ReactNode;
};

/**
 * The Video.js 10 code block chrome, dark in both themes: a header bar with the label and copy button over the code.
 * The label is often a file name, so it keeps its case in the body face, as the Video.js 10 code tabs do.
 */
export default function CodeFrame({ label, code, header, children }: CodeFrameProps) {
  return (
    <div className="corner-squircle border-faded-black/10 bg-faded-black text-manila-light dark:border-line dark:bg-soot flex w-full flex-col overflow-hidden rounded-lg border">
      <div className="border-manila-light/10 bg-manila-light/4 dark:bg-warm-gray/60 flex h-10 shrink-0 items-center gap-2 border-b pr-1.5 pl-4">
        {header ?? <span className="text-p3 text-manila-light/70 truncate">{label}</span>}
        <CopyButton text={code} label={`Copy ${label} snippet`} className="ml-auto" />
      </div>
      {children}
    </div>
  );
}

/**
 * Shiki's token spans carry both palettes as custom properties; the light site takes `--shiki-light` and the `.dark`
 * one `--shiki-dark`, weight and style included.
 */
const tokenColors = [
  '[&_span]:text-(--shiki-light) [&_span]:[font-style:var(--shiki-light-font-style,inherit)] [&_span]:[font-weight:var(--shiki-light-font-weight,inherit)]',
  'dark:[&_span]:text-(--shiki-dark) dark:[&_span]:[font-style:var(--shiki-dark-font-style,inherit)] dark:[&_span]:[font-weight:var(--shiki-dark-font-weight,inherit)]',
].join(' ');

/** The code inside a frame's `<pre>`: the highlighted lines when the server rendered them, the raw code otherwise. */
export function CodeContent({ code, html }: HighlightedCode) {
  if (html) return <code className={tokenColors} dangerouslySetInnerHTML={{ __html: html }} />;

  return <code>{code}</code>;
}
