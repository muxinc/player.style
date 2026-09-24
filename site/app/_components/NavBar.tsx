import clsx from 'clsx';

import AppearanceMenu from './AppearanceMenu';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import GithubLogo from './logos/GithubLogo';
import MobileNav from './MobileNav';
import MuxByline from './MuxByline';
import { GITHUB_URL, NAV_LINKS } from './nav-links';
import { NavLink } from './NavLink';
import { pageFrame } from './PageFrame';
import SiteLogo from './SiteLogo';
import { focusRing, navIconButton } from './ui';

const linkClassName = `flex h-full items-center gap-1 rounded-md corner-squircle px-4 py-2 font-display text-h3 uppercase intent:bg-hover xl:px-5 ${focusRing}`;

export default function NavBar() {
  return (
    <header className="border-line bg-manila-light dark:bg-faded-black sticky top-0 z-30 border-b">
      <div className={clsx(pageFrame, 'flex h-(--nav-h) items-center justify-between')}>
        <SiteLogo />
        <nav aria-label="Main" className="hidden h-full items-center lg:flex">
          <ul className="flex h-full items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="flex h-full items-stretch whitespace-nowrap">
                {link.external ? (
                  <a className={linkClassName} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                    <ArrowUpRightIcon className="size-4" />
                  </a>
                ) : (
                  <NavLink className={linkClassName} href={link.href} indicator>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <MuxByline className="mr-2 ml-4" />
          <AppearanceMenu className="ml-1" />
          <a href={GITHUB_URL} className={navIconButton} aria-label="GitHub" target="_blank" rel="noreferrer">
            <GithubLogo className="size-6" />
          </a>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
