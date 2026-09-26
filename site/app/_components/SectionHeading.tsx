import clsx from 'clsx';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  as?: 'h2' | 'h3' | 'p';
  id?: string;
  /** The small orange line above the title. */
  eyebrow?: ReactNode;
  size?: 'lg' | 'sm';
  className?: string;
  children: ReactNode;
};

/** The Video.js 10 section header: an orange display eyebrow over an uppercase display title. */
export default function SectionHeading({
  as: Tag = 'h2',
  id,
  eyebrow,
  size = 'lg',
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {eyebrow && <p className="font-display text-h5 text-accent font-bold uppercase">{eyebrow}</p>}
      <Tag id={id} className={clsx('font-display uppercase', size === 'lg' ? 'text-h25 md:text-h2' : 'text-h4')}>
        {children}
      </Tag>
    </div>
  );
}
