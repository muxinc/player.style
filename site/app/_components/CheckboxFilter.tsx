'use client';

import { useSearchParamUpdater } from './useSearchParamUpdater';

type CheckboxFilterProps<Id extends string> = {
  /** Accessible name of the group; the visible heading sits above it in the sidebar. */
  legend: string;
  param: string;
  options: readonly { id: Id; label: string; hint?: string }[];
  selected: readonly Id[];
};

/** A multi-select filter bound to a repeated search param. Nothing checked means the group does not filter. */
export default function CheckboxFilter<Id extends string>({
  legend,
  param,
  options,
  selected,
}: CheckboxFilterProps<Id>) {
  const { update } = useSearchParamUpdater();

  const toggle = (id: Id, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);

    update((params) => {
      params.delete(param);
      for (const option of options) {
        if (next.has(option.id)) params.append(param, option.id);
      }
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
            checked={selected.includes(option.id)}
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
