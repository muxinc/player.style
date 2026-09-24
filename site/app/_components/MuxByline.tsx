import clsx from 'clsx';

import MuxSmallLogo from './logos/MuxSmallLogo';
import { MUX_URL } from './nav-links';
import { focusRing } from './ui';

/**
 * "by Mux": player.style is made by Mux. Kept away from the site logo so the top left stays one mark; the wordmark
 * sits on the text baseline at the height of the "b" ascender, so it reads as a word rather than a badge.
 */
export default function MuxByline({ className }: { className?: string }) {
  return (
    <a
      href={MUX_URL}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'corner-squircle text-p4 text-muted intent:text-faded-black dark:intent:text-manila-light inline-flex h-5 items-baseline gap-1 rounded-sm leading-5 whitespace-nowrap transition-colors',
        focusRing,
        className
      )}
    >
      by
      <MuxSmallLogo className="text-faded-black dark:text-manila-light h-2.25 w-auto" />
      <span className="sr-only">Mux</span>
    </a>
  );
}
