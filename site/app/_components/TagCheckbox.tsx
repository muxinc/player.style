'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type TagCheckboxProps = {
  name: string;
  group: string;
};

export default function TagCheckbox({ name, group }: TagCheckboxProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleTag = (term: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    params.delete(group, term);

    if (checked) {
      params.append(group, term);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const value = name.toLowerCase();

  return (
    <>
      <div key={`tag-${value}`} className="flex items-center py-0.25">
        <input
          className="rounded-none border border-gray-dark mr-0.5"
          type="checkbox"
          id={`tag-${value}`}
          value={value}
          onChange={(e) => {
            handleTag(e.target.value, e.target.checked);
          }}
          defaultChecked={searchParams.getAll(group).includes(value)}
        />
        <label className="select-none" htmlFor={`tag-${value}`}>
          {name}
        </label>
      </div>
    </>
  );
}
