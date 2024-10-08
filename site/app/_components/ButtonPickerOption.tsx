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
      // This is a workaround for a bug where the page without a search query
      // would not trigger a RSC update.
      // params.delete(type);
      params.set(type, term);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <button
        className={clsx(
          'font-mono text-xs md:text-sm leading-mono font-normal uppercase p-0.25 aspect-video items-center justify-center bg-white border border-gray text-balance',
          className,
          (activeType === value || (!activeType && selected)) && 'active'
        )}
        onClick={() => selectMedia(value)}
      >
        {title}
      </button>
    </>
  );
}
