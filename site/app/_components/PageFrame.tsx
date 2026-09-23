import clsx from 'clsx';
import type { ReactNode } from 'react';

type PageFrameProps = {
  as?: 'div' | 'section' | 'header' | 'footer';
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
};

/** The site's page frame: a centered column with hairline gutters, stacked so adjacent frames share their borders. */
export default function PageFrame({ as: Tag = 'div', className, innerClassName, children }: PageFrameProps) {
  return (
    <Tag className={clsx('frame-cols relative -my-px grid border-y border-gray bg-putty-light', className)}>
      <div className={clsx('col-start-2 col-end-3 border-x border-gray', innerClassName)}>{children}</div>
    </Tag>
  );
}
