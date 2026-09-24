'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import CodeFrame from './CodeFrame';
import { focusRing } from './ui';

export interface CodeTabsFile {
  name: string;
  code: string;
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
 * the files of an open edition). One file renders as a plain labelled block. The choice is local: it is not a page
 * setting, so it stays out of the URL.
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

  const header =
    files.length > 1 ? (
      <div role="tablist" aria-label={label} className="-ml-2 flex h-full min-w-0 items-stretch overflow-x-auto">
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
                'text-code relative shrink-0 cursor-pointer px-2 font-mono whitespace-nowrap transition select-none',
                focusRing,
                selected ? 'text-manila-light' : 'text-manila-light/60 intent:text-manila-light'
              )}
            >
              {file.name}
              <span
                aria-hidden="true"
                className={clsx(
                  'absolute inset-x-2 bottom-0 h-0.5 rounded-full',
                  selected ? 'bg-gold' : 'bg-transparent'
                )}
              />
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
        <code>{active.code}</code>
      </pre>
    </CodeFrame>
  );
}
