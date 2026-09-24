import clsx from 'clsx';
import type { ReactNode } from 'react';

type PageFrameProps = {
  as?: 'div' | 'section' | 'header' | 'footer';
  className?: string;
  children?: ReactNode;
};

/** The site's page frame: the Video.js 10 content column with its side gutters. */
export default function PageFrame({ as: Tag = 'div', className, children }: PageFrameProps) {
  return <Tag className={clsx('mx-auto w-full max-w-305 px-5', className)}>{children}</Tag>;
}
