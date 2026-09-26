'use client';

import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

/** Captures a pageview per path. Search-param changes (filters, pickers, the accent) stay on the same page. */
export default function PostHogPageView(): null {
  const pathname = usePathname();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      posthog.capture('$pageview', { $current_url: window.location.href });
    }
  }, [pathname, posthog]);

  return null;
}
