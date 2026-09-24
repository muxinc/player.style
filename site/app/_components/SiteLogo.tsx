import clsx from 'clsx';

import AccentLink from './AccentLink';
import MuxByline from './MuxByline';
import { focusRing } from './ui';

type SiteLogoProps = {
  className?: string;
  onClick?: () => void;
};

/** "player.style by Mux": the wordmark in the nav's display type with the Mux byline beside it, linking home. */
export default function SiteLogo({ className, onClick }: SiteLogoProps) {
  return (
    <AccentLink
      href="/"
      onClick={onClick}
      className={clsx('corner-squircle flex items-baseline gap-2 rounded-sm whitespace-nowrap', focusRing, className)}
    >
      <span className="font-display text-h3">player.style</span>
      <MuxByline />
    </AccentLink>
  );
}
