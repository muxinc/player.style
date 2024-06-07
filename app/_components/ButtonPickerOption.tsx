'use client';

import clsx from 'clsx';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

type ButtonPickerOptionProps = {
  selected?: boolean;
  title: string;
  value: string;
  className?: string;
};

type ButtonPickerOptionPropsInternal = ButtonPickerOptionProps & {
  type: string;
};

export default function ButtonPickerOption(props: ButtonPickerOptionProps) {
  const { type, selected, title, value, className } = props as ButtonPickerOptionPropsInternal;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const activeType = searchParams.get(type)?.toString();

  const selectMedia = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(type, term);
    } else {
      params.delete(type);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <button
        className={clsx(
          'font-mono text-xs md:text-sm leading-mono font-normal uppercase p-0.25 sm:p-0.5 min-h-2 items-center justify-center bg-black text-white',
          className,
          (activeType === value || !activeType && selected) && 'active'
        )}
        onClick={() => selectMedia(value)}
      >
        {title}
      </button>
    </>
  );
}
