'use client';

import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';

import { AppearanceControls } from './AppearanceMenu';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import { GITHUB_URL, NAV_LINKS } from './nav-links';
import { NavLink } from './NavLink';
import SiteLogo from './SiteLogo';
import { focusRing, menuChip, menuChipLabel } from './ui';

// The 16px line matches the external links' arrow, so every row is 45px tall, a full touch target.
const itemClassName = `flex items-center justify-center gap-1.5 border-t border-faded-black px-5 py-3.5 text-center font-display text-h5 leading-4 font-bold uppercase intent:bg-hover dark:border-manila-dark ${focusRing}`;

/** The full-screen menu behind the double-frame MENU chip, a native modal dialog so focus and Escape come for free. */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={menuChip}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <span className={menuChipLabel}>Menu</span>
      </button>
      <dialog
        id={dialogId}
        ref={dialogRef}
        aria-label="Navigation"
        onClose={close}
        className={clsx(
          'fixed inset-0 m-0 hidden h-dvh max-h-none w-full max-w-none flex-col overflow-y-auto open:flex',
          'bg-manila-light text-faded-black backdrop:hidden dark:bg-faded-black dark:text-manila-light'
        )}
      >
        <div className="border-line flex h-(--nav-h) shrink-0 items-center justify-between border-b px-5">
          <SiteLogo onClick={close} />
          <button type="button" className={menuChip} aria-label="Close navigation menu" onClick={close}>
            <span className={menuChipLabel}>Close</span>
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-col p-5">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                className={itemClassName}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                {link.label}
                <ArrowUpRightIcon className="size-4" />
              </a>
            ) : (
              <NavLink
                key={link.href}
                className={itemClassName}
                activeClassName="text-stroke-faded-black dark:text-stroke-manila-light"
                href={link.href}
                onClick={close}
              >
                {link.label}
              </NavLink>
            )
          )}
          <a
            className={clsx(itemClassName, 'border-b')}
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
          >
            GitHub
            <ArrowUpRightIcon className="size-4" />
          </a>
        </nav>
        <AppearanceControls className="px-5 pb-6" />
        <p className="text-p2 mt-auto p-6 text-center">Skins for the open source player for the web</p>
      </dialog>
    </div>
  );
}
