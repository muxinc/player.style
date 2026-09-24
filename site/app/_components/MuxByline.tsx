import clsx from 'clsx';

import MuxSmallLogo from './logos/MuxSmallLogo';

/**
 * "by Mux" beside the `player.style` wordmark in the site logo. The Mux wordmark sits on the text baseline at the
 * height of the "b" ascender, so it reads as a word rather than a badge. It is not a link of its own, since the logo
 * around it links home.
 */
export default function MuxByline({ className }: { className?: string }) {
  return (
    <span className={clsx('text-p3 text-muted inline-flex items-baseline gap-1 whitespace-nowrap', className)}>
      by
      <MuxSmallLogo className="text-faded-black dark:text-manila-light h-[0.72em] w-auto" />
      <span className="sr-only">Mux</span>
    </span>
  );
}
