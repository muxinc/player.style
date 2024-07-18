import Link from 'next/link';
import PlayerStyleLogo from './PlayerStyleLogo';
import MuxLogo from './MuxLogo';
import { NavLink } from './NavLink';
import MobileNav from './MobileNav';

export default function NavBar() {
  return (
    <>
      <div className="border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray sticky -top-1px z-50">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="-m-0.5px grid-cols-1 relative h-2 md:h-3 flex items-center justify-between">
            <div className="flex items-center text-sm relative -top-2px">
              <Link className="block relative pl-0.5 sm:pl-1 pr-0.25 md:pr-0.5" href="/">
                <PlayerStyleLogo className="h-[26px] md:h-[34px]" />
                <span className="sr-only">Player.style</span>
              </Link>
              <a
                className="flex gap-3px items-center rounded-1 relative text-putty-light bg-blue-core hover:bg-orange h-[18px] -bottom-[1px] px-[8px] text-[9px] scale-90 md:scale-100"
                href="https://www.mux.com/"
                target="_blank"
              >
                <span>BY</span>
                <span className="sr-only">Made by Mux</span>
                <MuxLogo className="fill-current w-[36px] h-[11px]" />
              </a>
            </div>
            <MobileNav />
            <nav
              aria-label="Main"
              data-orientation="horizontal"
              dir="ltr"
              className="border-ctx -m-0.5px self-stretch hidden lg:flex"
            >
              <div className="relative">
                <ul data-orientation="horizontal" className="h-full flex" dir="ltr">
                  <li className="flex items-stretch whitespace-nowrap -mx-0.25 first:ml-0 last:mr-0 xl:mx-0">
                    <NavLink
                      className="flex items-center p-1 hover:bg-black hover:text-white"
                      href="/"
                    >
                      Themes
                    </NavLink>
                  </li>
                  <li className="flex items-stretch whitespace-nowrap -mx-0.25 first:ml-0 last:mr-0 xl:mx-0">
                    <NavLink
                      className="flex items-center p-1 hover:bg-black hover:text-white"
                      href="/about"
                    >
                      About
                    </NavLink>
                  </li>
                  <li className="flex items-stretch whitespace-nowrap -mx-0.25 first:ml-0 last:mr-0 xl:mx-0">
                    <a
                      className="flex items-center p-1 hover:bg-black hover:text-white"
                      href="https://github.com/muxinc/player.style/issues/new"
                      target="_blank"
                    >
                      Feedback ⧉
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
