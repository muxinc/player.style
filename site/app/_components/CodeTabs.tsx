'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import type { HighlightedCode } from '@/lib/code-snippet';

import CodeFrame, { CodeContent } from './CodeFrame';
import { focusRing } from './ui';

export interface CodeTabsFile extends HighlightedCode {
  name: string;
}

type CodeTabsProps = {
  /** Names the group for assistive tech and the copy button. */
  label: string;
  files: readonly CodeTabsFile[];
  /** The lines shown before the visitor scrolls the block; longer files scroll inside it. */
  maxHeight?: string;
  /** The selected file, when a parent keeps it (so two switchers can follow one choice); otherwise local state. */
  value?: string;
  onValueChange?: (name: string) => void;
};

/**
 * A code block with a file switcher in its header, for snippets that span files (a config for Vite and one for Nuxt,
 * the shadcn commands for each package manager). One file renders as a plain labelled block. The choice is local: it is
 * not a page setting, so it stays out of the URL.
 */
export default function CodeTabs({ label, files, maxHeight, value, onValueChange }: CodeTabsProps) {
  const [localName, setLocalName] = useState(files[0]?.name);
  const baseId = useId();
  const active = files.find((file) => file.name === (value ?? localName)) ?? files[0];
  if (!active) return null;

  const select = (name: string) => {
    setLocalName(name);
    onValueChange?.(name);
  };

  // The tab strip scrolls, so it clips its tabs. It spans the 40px header and 4px of the code's top padding (the extra
  // bottom padding keeps the tabs centred in the header), room for each 28px tab's 44px hit area.
  const header =
    files.length > 1 ? (
      <div
        role="tablist"
        aria-label={label}
        className="-mb-1 -ml-2.5 flex min-w-0 items-center gap-0.5 self-stretch overflow-x-auto pb-1"
      >
        {files.map((file) => {
          const selected = file.name === active.name;

          return (
            <button
              key={file.name}
              type="button"
              role="tab"
              id={`${baseId}-${file.name}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              onClick={() => select(file.name)}
              className={clsx(
                'text-p3 corner-squircle relative grid h-7 shrink-0 cursor-pointer items-center rounded-md px-2.5 whitespace-nowrap transition select-none',
                'after:absolute after:inset-x-0 after:-top-1.5 after:-bottom-2.5',
                focusRing,
                selected
                  ? 'bg-manila-light/12 text-manila-light'
                  : 'text-manila-light/60 intent:bg-manila-light/6 intent:text-manila-light'
              )}
            >
              {/* The bold copy holds the tab's width, so choosing a tab does not shift its neighbours. */}
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
                {file.name}
              </span>
              <span className={clsx('col-start-1 row-start-1', selected && 'font-semibold')}>{file.name}</span>
            </button>
          );
        })}
      </div>
    ) : undefined;

  return (
    <CodeFrame label={files.length > 1 ? `${label}: ${active.name}` : active.name} code={active.code} header={header}>
      <pre
        id={`${baseId}-panel`}
        role={files.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={files.length > 1 ? `${baseId}-${active.name}` : undefined}
        className="text-code overflow-auto px-4 py-4 font-mono leading-relaxed md:px-5"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <CodeContent code={active.code} html={active.html} />
      </pre>
    </CodeFrame>
  );
}
