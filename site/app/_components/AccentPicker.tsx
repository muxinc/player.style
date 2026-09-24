'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { ACCENT_PARAM, parseAccent } from '@/lib/search-params';

import { buttonSecondary } from './ui';
import { useAccent } from './useAccent';

const UNSET_SWATCH = '#ff6200';

type AccentPickerProps = {
  id: string;
};

/**
 * Write `?accent=` with `history.replaceState` rather than the router: Next syncs the native history API into
 * `useSearchParams`, so every accent reader updates on the client while dragging without an RSC request per tick.
 */
function writeUrlAccent(accent: string | undefined) {
  const url = new URL(window.location.href);
  if (accent) url.searchParams.set(ACCENT_PARAM, accent);
  else url.searchParams.delete(ACCENT_PARAM);

  window.history.replaceState(null, '', url);
}

/** A native color input bound to `?accent=`, drawn as a round swatch. The swatch and the URL both follow the pointer. */
export default function AccentPicker({ id }: AccentPickerProps) {
  const accent = useAccent();
  const [draft, setDraft] = useState(accent);
  const [syncedAccent, setSyncedAccent] = useState(accent);

  // Follow the URL when it changes elsewhere (back/forward, a link). Our own writes echo back here too; Next applies
  // them in transitions that React batches, so an echo is never older than the latest write.
  if (accent !== syncedAccent) {
    setSyncedAccent(accent);
    setDraft(accent);
  }

  const pick = (value: string) => {
    const next = parseAccent(value);
    setDraft(next);
    writeUrlAccent(next);
  };

  const clear = () => {
    setDraft(undefined);
    writeUrlAccent(undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <span
          className={clsx(
            'relative flex size-7 shrink-0 items-center justify-center rounded-full transition',
            'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold',
            draft
              ? 'ring-2 ring-faded-black ring-offset-2 ring-offset-surface dark:ring-manila-light dark:ring-offset-faded-black'
              : 'border border-dashed border-line-strong bg-surface-raised'
          )}
        >
          <input
            id={id}
            type="color"
            aria-label="Accent color"
            value={draft ? `#${draft}` : UNSET_SWATCH}
            onChange={(event) => pick(event.target.value)}
            className={clsx('swatch-input absolute inset-0 size-full outline-none', !draft && 'opacity-0')}
          />
        </span>
        <span className="text-p3 font-mono">{draft ? `#${draft}` : 'Skin default'}</span>
      </label>
      {draft && (
        <button type="button" onClick={clear} className={buttonSecondary}>
          Clear
        </button>
      )}
    </div>
  );
}
