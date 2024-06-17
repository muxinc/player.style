'use client';

import clsx from 'clsx';
import { ReactNode, useRef, useState } from 'react';

type CopyButtonProps = {
  code: string;
  children?: ReactNode;
};

export default function CopyButton(props: CopyButtonProps) {
  const { code } = props;
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<NodeJS.Timeout>();

  return (
    <>
      <button
        type="button"
        className="absolute top-0 right-0 p-1 grid place-items-center"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);

          clearTimeout(copiedTimeoutRef.current);
          copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1000);
        }}
      >
        <svg
          className={clsx(
            'size-0.75 transition duration-short ease-in-out',
            copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          )}
          style={{ gridArea: '1 / 1' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
          />
        </svg>
        <svg
          className={clsx(
            'size-0.75 transition duration-short ease-in-out',
            copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          )}
          style={{ gridArea: '1 / 1' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </button>
    </>
  );
}
