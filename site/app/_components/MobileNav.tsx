'use client';

import clsx from 'clsx';
import { useId, useState } from 'react';

import { NAV_LINKS } from './nav-links';
import { NavLink } from './NavLink';

const itemClassName =
  'flex min-h-2 w-full items-center justify-between border-x border-b border-black bg-charcoal px-1 py-0.5 text-white hover:bg-black focus-visible:bg-black';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div className="block h-full lg:hidden">
      <button
        type="button"
        className={clsx(
          'relative z-20 h-full px-0.75 transition-colors duration-200 ease-energetic md:px-1',
          open && 'bg-charcoal text-white'
        )}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">{open ? 'Close navigation menu' : 'Open navigation menu'}</span>
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" className="stroke-current">
          {open ? (
            <path d="M5 5L23 23M5 23L23 5" vectorEffect="non-scaling-stroke" />
          ) : (
            <path d="M4 8h20M4 14h20M4 20h20" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </button>
      <nav
        id={menuId}
        aria-label="Main"
        className={clsx(
          'absolute -right-px -left-px top-full z-20 overflow-clip transition-[grid-template-rows] duration-200 ease-energetic md:left-1/2',
          'grid',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                className={itemClassName}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
              >
                {link.label} ↗
              </a>
            ) : (
              <NavLink key={link.href} className={itemClassName} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            )
          )}
        </div>
      </nav>
    </div>
  );
}
