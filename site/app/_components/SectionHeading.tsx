import clsx from 'clsx';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  as?: 'h2' | 'h3' | 'p';
  id?: string;
  className?: string;
  children: ReactNode;
};

/** The charcoal, monospaced bar that labels a block of the page, carried over from the previous design. */
export default function SectionHeading({ as: Tag = 'h2', id, className, children }: SectionHeadingProps) {
  return (
    <Tag
      id={id}
      className={clsx(
        'flex min-h-2 items-center gap-0.5 border-b border-gray bg-charcoal px-1 font-mono text-sm leading-mono font-normal tracking-wide text-putty-light uppercase',
        className
      )}
    >
      {children}
    </Tag>
  );
}
