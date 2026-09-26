'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Edit the current URL's search params in place. The callback receives a mutable copy; the page is replaced without
 * scrolling so the filters feel like local state while staying shareable.
 */
export function useSearchParamUpdater() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const update = useCallback(
    (edit: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams);
      edit(params);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { searchParams, update };
}
