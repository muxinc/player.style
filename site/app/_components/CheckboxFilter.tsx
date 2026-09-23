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
    <fieldset className="flex flex-col gap-0.25">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label key={option.id} className="flex cursor-pointer items-start gap-0.5 py-[3px] select-none">
          <input
            type="checkbox"
            className="accent-blue-core mt-[2px] size-[18px] shrink-0"
            checked={optimistic.includes(option.id)}
            onChange={(event) => toggle(option.id, event.target.checked)}
          />
          <span className="flex flex-col">
            <span className="leading-mono font-mono text-sm uppercase">{option.label}</span>
            {option.hint && <span className="text-gray-dark text-xs leading-normal">{option.hint}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
