import clsx from 'clsx';

import AccentLink from './AccentLink';
import VideojsLogo from './logos/VideojsLogo';
import VjsLogo from './logos/VjsLogo';
import { versionPill } from './ui';

type SiteLogoProps = {
  className?: string;
  onClick?: () => void;
};

/** The Video.js wordmark with the `player.style` chip beside it, linking home. Narrow viewports get the compact mark. */
export default function SiteLogo({ className, onClick }: SiteLogoProps) {
  return (
    <AccentLink href="/" onClick={onClick} className={clsx('flex h-5 items-end gap-2 sm:h-6 sm:gap-3', className)}>
      <VjsLogo className="xs:hidden h-full w-auto" />
      <VideojsLogo className="xs:inline hidden h-full w-auto" />
      <span className="sr-only">Video.js</span>
      <span className={versionPill}>player.style</span>
    </AccentLink>
  );
}
