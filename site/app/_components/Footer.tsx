import AccentLink from './AccentLink';
import FooterBand from './FooterBand';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import VideojsMonoLogo from './logos/VideojsMonoLogo';
import { GITHUB_URL, MUX_URL, NAV_LINKS, VIDEOJS_URL } from './nav-links';
import { focusRing, textLink } from './ui';

const linkClassName = `flex items-center gap-1.5 rounded-md corner-squircle px-2 py-2 font-display font-bold uppercase intent:bg-hover md:px-5 ${focusRing}`;

const FOOTER_LINKS = [...NAV_LINKS, { href: GITHUB_URL, label: 'GitHub', external: true }];

export default function Footer() {
  return (
    <>
      <footer className="mx-auto mt-30 w-full max-w-305 px-5 pb-11 md:mt-32">
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
            <VideojsMonoLogo className="w-80 shrink-0 lg:w-92" />
            <p className="text-p2 flex-1 text-left lg:text-right">
              player.style is a gallery of skins for{' '}
              <a className={textLink} href={VIDEOJS_URL} target="_blank" rel="noreferrer">
                Video.js.
              </a>
              <br />
              Video hosting and streaming{' '}
              <a className={textLink} href={MUX_URL} target="_blank" rel="noreferrer">
                sponsored by Mux
              </a>
              <br />
              <br />
              The term VIDEO.JS is a registered trademark of Brightcove Inc.
              <br />
              &copy; 2010&ndash;{new Date().getFullYear()} Video.js contributors
            </p>
          </div>
        </div>
      </footer>
      <FooterBand />
    </>
  );
}
