import clsx from 'clsx';

import AccentLink from './AccentLink';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import MuxSmallLogo from './logos/MuxSmallLogo';
import VideojsMonoLogo from './logos/VideojsMonoLogo';
import { GITHUB_URL, MUX_URL, NAV_LINKS, VIDEOJS_URL } from './nav-links';
import { pageFrame } from './PageFrame';
import { focusRing, textLink } from './ui';

const linkClassName = `flex items-center gap-1.5 rounded-md corner-squircle px-2 py-2 font-display font-bold uppercase intent:bg-hover md:px-5 ${focusRing}`;

const FOOTER_LINKS = [...NAV_LINKS, { href: GITHUB_URL, label: 'GitHub', external: true }];

export default function Footer() {
  return (
    <footer className={clsx(pageFrame, 'mt-30 pb-11 md:mt-32')}>
      <div className="border-faded-black dark:border-manila-light md:border-t md:pt-5">
        <nav
          aria-label="Footer"
          className="border-faded-black dark:border-manila-light flex flex-wrap justify-between gap-2 border-t border-b py-3 md:-ml-5 md:justify-start md:border-0 md:py-0"
        >
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a key={link.href} className={linkClassName} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ArrowUpRightIcon className="size-4" />
              </a>
            ) : (
              <AccentLink key={link.href} className={linkClassName} href={link.href}>
                {link.label}
              </AccentLink>
            )
          )}
        </nav>
        <div className="mt-10 flex flex-col-reverse justify-between gap-15 md:mt-15 lg:flex-row">
          {/* 320px wide, or the column's width on a phone narrower than that plus the gutters. */}
          <VideojsMonoLogo className="w-full max-w-80 shrink-0 lg:w-92 lg:max-w-none" />
          <p className="text-p2 flex-1 text-left lg:text-right">
            player.style is a gallery of skins for{' '}
            <a className={textLink} href={VIDEOJS_URL} target="_blank" rel="noreferrer">
              Video.js.
            </a>
            <br />
            Made by{' '}
            <a
              className={clsx('corner-squircle inline-block rounded-sm', focusRing)}
              href={MUX_URL}
              target="_blank"
              rel="noreferrer"
            >
              {/* Cap height of the 16px text, bottom on the baseline, so the wordmark reads as the word it replaces. */}
              <MuxSmallLogo className="inline-block h-[0.72em] w-auto align-baseline" />
              <span className="sr-only">Mux</span>
            </a>
            .
            <br />
            <br />
            The term VIDEO.JS is a registered trademark of Brightcove Inc.
            <br />
            &copy; 2010&ndash;{new Date().getFullYear()} Video.js contributors
          </p>
        </div>
      </div>
    </footer>
  );
}
