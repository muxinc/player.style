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

  return (
    <>
      <div key={`tag-${name}`} className="flex items-center py-0.25">
        <input
          className="rounded-none border border-gray-dark mr-0.5"
          type="checkbox"
          id={`tag-${name}`}
          value={name.toLowerCase()}
          onChange={(e) => {
            handleTag(e.target.value, e.target.checked);
          }}
          defaultChecked={searchParams.getAll(group).includes(name)}
        />
        <label className="select-none" htmlFor={`tag-${name}`}>
          {name}
        </label>
      </div>
    </>
  );
}
