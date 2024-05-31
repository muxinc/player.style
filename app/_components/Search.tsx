'use client';

import { useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchDebounced = useDebouncedCallback(handleSearch, 300);
  const search = searchParams.get('search')?.toString();

  return (
    <>
      <div className="relative w-full p-1">
        <span className="inline-flex flex-col relative w-full h-full">
          <input
            ref={inputRef}
            className="rounded-none min-h-2 border border-gray focus:border-current p-0.5 bg-white dark:bg-charcoal text-black dark:text-white px-1 !rounded-1"
            placeholder="Search..."
            type="text"
            onChange={(e) => handleSearchDebounced(e.target.value)}
            defaultValue={search}
          />
        </span>
        <span className={clsx(search && 'hidden', 'absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer')}>
          <svg
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 42 42"
          >
            <title>Search</title>
            <circle
              cx="25.5"
              cy="16.5"
              r="13"
              className="stroke-current"
              vectorEffect="non-scaling-stroke"
            ></circle>
            <path
              d="M16.5 25.5 3 39"
              className="stroke-current"
              vectorEffect="non-scaling-stroke"
            ></path>
          </svg>
        </span>
        <button
          className={clsx(!search && 'hidden', 'absolute top-1/2 -translate-y-1/2 cursor-pointer right-2')}
          onClick={() => {
            if (!inputRef.current) return;
            inputRef.current.focus();
            inputRef.current.value = '';
            handleSearch('');
          }}
        >
          <svg
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 42 42"
            strokeLinecap="square"
            strokeMiterlimit="1.5"
          >
            <title>X</title>
            <path
              d="M1 1l40 40M41 1L1 41"
              className="stroke-current"
              vectorEffect="non-scaling-stroke"
            ></path>
          </svg>
        </button>
      </div>
    </>
  );
}
