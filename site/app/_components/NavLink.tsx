'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEventHandler, ReactNode } from 'react';

type NavLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function NavLink({ href, className, children, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' || pathname.startsWith('/skins') : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={clsx(className, isActive && 'underline decoration-1 underline-offset-[0.3em]')}
    >
      {children}
    </Link>
  );
}
