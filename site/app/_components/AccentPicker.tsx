'use client';

import { useState } from 'react';

import { ACCENT_PARAM, parseAccent } from '@/lib/search-params';

import { useAccent } from './useAccent';

const UNSET_SWATCH = '#ffffff';

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

/** A native color input bound to `?accent=`. The swatch and the URL both follow the pointer. */
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
    <div className="flex flex-wrap items-center gap-0.5">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-0.5">
        <input
          id={id}
          type="color"
          aria-label="Accent color"
          value={draft ? `#${draft}` : UNSET_SWATCH}
          onChange={(event) => pick(event.target.value)}
          className="border-gray size-1.5 rounded-full border"
        />
        <span className="leading-mono font-mono text-sm uppercase">{draft ? `#${draft}` : 'Skin default'}</span>
      </label>
      {draft && (
        <button
          type="button"
          onClick={clear}
          className="border-gray leading-mono hover:bg-putty-light rounded-full border bg-white px-0.5 py-[3px] font-mono text-xs uppercase"
        >
          Clear
        </button>
      )}
    </div>
  );
}
