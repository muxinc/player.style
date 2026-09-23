import AccentLink from './AccentLink';
import MobileNav from './MobileNav';
import MuxLogo from './MuxLogo';
import { MUX_URL, NAV_LINKS } from './nav-links';
import { NavLink } from './NavLink';
import PageFrame from './PageFrame';
import PlayerStyleLogo from './PlayerStyleLogo';

const linkClassName = 'flex items-center px-0.75 xl:px-1 hover:bg-blue-core hover:text-white';

export default function NavBar() {
  return (
    <PageFrame as="header" className="z-50">
      <div className="relative flex h-2 items-center justify-between md:h-3">
        <div className="relative flex items-center text-sm">
          <AccentLink className="relative block pr-0.25 pl-1 md:pr-0.5" href="/">
            <PlayerStyleLogo className="h-[26px] w-[130px] md:h-[34px] md:w-[170px]" />
            <span className="sr-only">player.style</span>
          </AccentLink>
          <a className="text-blue-core hover:text-blue relative top-px" href={MUX_URL} target="_blank" rel="noreferrer">
            <span className="sr-only">Sponsored by Mux</span>
            <MuxLogo className="w-[60px] fill-current md:w-[70px]" />
          </a>
        </div>
        <MobileNav />
        <nav aria-label="Main" className="hidden self-stretch lg:flex">
          <ul className="flex h-full">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="flex items-stretch whitespace-nowrap">
                {link.external ? (
                  <a className={linkClassName} href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ) : (
                  <NavLink className={linkClassName} href={link.href}>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageFrame>
  );
}
