'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { MouseEventHandler, ReactNode } from 'react';

import AccentLink from './AccentLink';

type NavLinkProps = {
  href: string;
  className?: string;
  /** Added while the link is current, on top of `className`. */
  activeClassName?: string;
  /** Draw the accent hairline along the bottom edge while current, as the docs nav does. */
  indicator?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** `page` on the linked page itself, `true` on its descendants (the skin pages belong to Skins). */
function getCurrent(href: string, pathname: string): 'page' | 'true' | undefined {
  if (pathname === href) return 'page';

  const isAncestor = href === '/' ? pathname.startsWith('/skins/') : pathname.startsWith(`${href}/`);

  return isAncestor ? 'true' : undefined;
}

export function NavLink({ href, className, activeClassName, indicator = false, children, onClick }: NavLinkProps) {
  const current = getCurrent(href, usePathname());

  return (
    <AccentLink
      href={href}
      onClick={onClick}
      aria-current={current}
      className={clsx(className, current && activeClassName, current && indicator && 'relative z-10 text-accent')}
    >
      {children}
      {current && indicator && <hr aria-hidden="true" className="bg-accent absolute right-0 -bottom-px left-0 h-px" />}
    </AccentLink>
  );
}
