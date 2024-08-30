'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MouseEventHandler } from 'react';

type NavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export const NavLink = ({ href, children, onClick, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const active = ' underline underline-offset-normal decoration-link';
  const isActive = pathname === href;

  if (isActive) {
    props.className += active;
  }

  return (
    <Link href={href} onClick={onClick} {...props}>
      {children}
    </Link>
  );
};
