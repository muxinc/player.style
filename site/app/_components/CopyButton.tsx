'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import CheckIcon from './icons/CheckIcon';
import CopyIcon from './icons/CopyIcon';
import { focusRing } from './ui';

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

/** The copy control of a code block: quiet on the dark chrome, gold once the text is on the clipboard. */
export default function CopyButton({ text, label = 'Copy to clipboard', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className={clsx(
        'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md corner-squircle transition',
        copied ? 'text-gold' : 'text-manila-light/60 intent:bg-manila-light/10 intent:text-manila-light',
        focusRing,
        className
      )}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  );
}
