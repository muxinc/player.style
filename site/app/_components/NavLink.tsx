'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import type { MouseEventHandler, ReactNode } from 'react';

import AccentLink from './AccentLink';

type NavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** `page` on the linked page itself, `true` on its descendants (the skin pages belong to Skins). */
function getCurrent(href: string, pathname: string): 'page' | 'true' | undefined {
  if (pathname === href) return 'page';

  const isAncestor = href === '/' ? pathname.startsWith('/skins/') : pathname.startsWith(`${href}/`);

  return isAncestor ? 'true' : undefined;
}

export function NavLink({ href, className, children, onClick }: NavLinkProps) {
  const current = getCurrent(href, usePathname());

  return (
    <AccentLink
      href={href}
      onClick={onClick}
      aria-current={current}
      className={clsx(className, current && 'underline decoration-1 underline-offset-[0.3em]')}
    >
      {children}
    </AccentLink>
  );
}
