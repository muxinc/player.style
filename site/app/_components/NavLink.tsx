'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export const NavLink = ({ href, children, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const active = ' underline underline-offset-normal decoration-link';
  const isActive = pathname === href;

  if (isActive) {
    props.className += active;
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
};
