'use client';

import { startTransition, useOptimistic } from 'react';

import { useSearchParamUpdater } from './useSearchParamUpdater';

type CheckboxFilterProps<Id extends string> = {
  /** Accessible name of the group; the visible heading sits above it in the sidebar. */
  legend: string;
  param: string;
  options: readonly { id: Id; label: string; hint?: string }[];
  selected: readonly Id[];
};

/**
 * A multi-select filter bound to a repeated search param. Nothing checked means the group does not filter. The server
 * owns `selected`; the checkboxes show the click right away while the filtered page loads.
 */
export default function CheckboxFilter<Id extends string>({
  legend,
  param,
  options,
  selected,
}: CheckboxFilterProps<Id>) {
  const { update } = useSearchParamUpdater();
  const [optimistic, setOptimistic] = useOptimistic(selected);

  const toggle = (id: Id, checked: boolean) => {
    const next = new Set(optimistic);
    if (checked) next.add(id);
    else next.delete(id);

    const ids = options.filter((option) => next.has(option.id)).map((option) => option.id);

    startTransition(() => {
      setOptimistic(ids);
      update((params) => {
        params.delete(param);
        for (const value of ids) params.append(param, value);
      });
    });
  };

  return (
    <fieldset className="flex flex-col">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.id}
          className="corner-squircle text-p3 intent:bg-hover/60 -mx-2 flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 select-none"
        >
          <input
            type="checkbox"
            className="accent-accent focus-visible:outline-gold mt-1 size-4 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            checked={optimistic.includes(option.id)}
            onChange={(event) => toggle(option.id, event.target.checked)}
          />
          <span className="flex flex-col">
            <span className="leading-5">{option.label}</span>
            {option.hint && <span className="text-p4 text-muted">{option.hint}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
