import type { ReactNode } from 'react';

import CopyButton from './CopyButton';

type CodeFrameProps = {
  label: string;
  code: string;
  /** Replaces the label in the header bar, for a file switcher; the label still names the copy button. */
  header?: ReactNode;
  children: ReactNode;
};

/** The Video.js 10 code block chrome, dark in both themes: a header bar with the label and copy button over the code. */
export default function CodeFrame({ label, code, header, children }: CodeFrameProps) {
  return (
    <div className="corner-squircle border-faded-black/10 bg-faded-black text-manila-light dark:border-line dark:bg-soot flex w-full flex-col overflow-hidden rounded-lg border">
      <div className="border-manila-light/10 bg-manila-light/4 dark:bg-warm-gray/60 flex h-10 shrink-0 items-center gap-2 border-b pr-1.5 pl-4">
        {header ?? <span className="font-display text-p4 text-manila-light/60 truncate uppercase">{label}</span>}
        <CopyButton text={code} label={`Copy ${label} snippet`} className="ml-auto" />
      </div>
      {children}
    </div>
  );
}
