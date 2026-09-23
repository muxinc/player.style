'use client';

import { useEffect, useRef, useState } from 'react';

import { ACCENT_PARAM, parseAccent } from '@/lib/search-params';

import { useSearchParamUpdater } from './useSearchParamUpdater';

const UNSET_SWATCH = '#ffffff';

type AccentPickerProps = {
  id: string;
};

/** A native color input bound to `?accent=`. The swatch tracks the pointer; the URL follows a beat later. */
export default function AccentPicker({ id }: AccentPickerProps) {
  const { searchParams, update } = useSearchParamUpdater();
  const accent = parseAccent(searchParams.get(ACCENT_PARAM));
  const [draft, setDraft] = useState(accent ? `#${accent}` : UNSET_SWATCH);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const onChange = (value: string) => {
    setDraft(value);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      update((params) => params.set(ACCENT_PARAM, value.replace('#', '').toLowerCase()));
    }, 120);
  };

  const clear = () => {
    clearTimeout(timeoutRef.current);
    setDraft(UNSET_SWATCH);
    update((params) => params.delete(ACCENT_PARAM));
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-0.5">
        <input
          id={id}
          type="color"
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          className="border-gray size-1.5 rounded-full border"
        />
        <span className="leading-mono font-mono text-sm uppercase">{accent ? `#${accent}` : 'Skin default'}</span>
      </label>
      {accent && (
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
