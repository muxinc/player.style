import clsx from 'clsx';

import { SITE_NAME } from '@/lib/site';

import AccentLink from './AccentLink';
import { focusRing, touchTarget } from './ui';

type SiteLogoProps = {
  className?: string;
  onClick?: () => void;
};

/** The site's wordmark in the nav's display type, linking home. */
export default function SiteLogo({ className, onClick }: SiteLogoProps) {
  return (
    <AccentLink
      href="/"
      onClick={onClick}
      className={clsx(
        'corner-squircle flex items-baseline gap-2 rounded-sm whitespace-nowrap',
        touchTarget,
        focusRing,
        className
      )}
    >
      <span className="font-display text-h3">{SITE_NAME}</span>
    </AccentLink>
  );
}
