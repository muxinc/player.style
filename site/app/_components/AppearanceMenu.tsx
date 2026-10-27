'use client';

import clsx from 'clsx';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import ComputerIcon from './icons/ComputerIcon';
import MoonIcon from './icons/MoonIcon';
import PaintbrushIcon from './icons/PaintbrushIcon';
import SunIcon from './icons/SunIcon';
import SegmentedControl from './SegmentedControl';
import { readThemePreference, subscribeThemePreference, type ThemePreference, writeThemePreference } from './theme';
import { navIconButton } from './ui';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: <ComputerIcon className="size-4" /> },
  { value: 'light', label: 'Light', icon: <SunIcon className="size-4" /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon className="size-4" /> },
] satisfies { value: ThemePreference; label: string; icon: React.ReactNode }[];

const getServerPreference = () => null;

/** The theme picker itself, shared by the nav popover and the mobile menu. The stored choice is only known client side. */
export function AppearanceControls({ className }: { className?: string }) {
  const preference = useSyncExternalStore(subscribeThemePreference, readThemePreference, getServerPreference);

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <span className="font-display text-p4 text-muted uppercase select-none">Theme</span>
      <SegmentedControl
        value={preference}
        onChange={writeThemePreference}
        options={THEME_OPTIONS}
        aria-label="Color theme"
        pending={preference === null}
      />
    </div>
  );
}

/** Nav button that opens the theme picker in a small popover. */
export default function AppearanceMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        type="button"
        aria-label="Appearance"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={clsx(navIconButton, open && 'bg-hover')}
      >
        <PaintbrushIcon className="size-6" />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={clsx(
          'absolute top-full right-0 z-40 mt-2 w-88 rounded-lg corner-squircle border border-line bg-surface-raised p-4 shadow-lg dark:bg-soot',
          'origin-top-right transition duration-150 ease-out motion-reduce:transition-none',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        <AppearanceControls />
      </div>
    </div>
  );
}
