import clsx from 'clsx';
import type { ReactNode } from 'react';

/**
 * The content column every page, the nav, and the footer share. It is wider than the Video.js 10 site's 1220px so the
 * gallery can hold two players of about 580px side by side instead of squeezing them.
 */
export const pageFrame = 'mx-auto w-full max-w-400 px-5';

type PageFrameProps = {
  as?: 'div' | 'section' | 'header' | 'footer';
  className?: string;
  children?: ReactNode;
};

/** The site's page frame: the shared content column with its side gutters. */
export default function PageFrame({ as: Tag = 'div', className, children }: PageFrameProps) {
  return <Tag className={clsx(pageFrame, className)}>{children}</Tag>;
}
