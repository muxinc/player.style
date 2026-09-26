'use client';

import Link from 'next/link';
import { Suspense, type ComponentProps } from 'react';

import { useAccentHref } from './useAccent';

export type AccentLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** An internal path, optionally with a query; its `?accent=` is replaced by the live one. */
  href: string;
};

function LinkWithAccent({ href, ...rest }: AccentLinkProps) {
  return <Link href={useAccentHref(href)} {...rest} />;
}

/** A Next link that carries the current accent color along to the page it opens. */
export default function AccentLink(props: AccentLinkProps) {
  // Static pages (About, 404) prerender the plain link; `useSearchParams` needs this boundary to allow that.
  return (
    <Suspense fallback={<Link {...props} />}>
      <LinkWithAccent {...props} />
    </Suspense>
  );
}
