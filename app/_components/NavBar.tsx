import Logo from './PlayerStyleLogo';

export default function NavBar() {
  return (
    <>
      <div className="overflow-hidden border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray sticky -top-1px z-50">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="-m-0.5px grid-cols-1 relative h-2 md:h-3 flex items-center justify-end">
            <div className="flex h-full mr-auto">
              <a className="relative group cursor-pointer h-full flex items-center px-1" href="/">
                <Logo />
              </a>
            </div>
            <nav
              aria-label="Main"
              data-orientation="horizontal"
              dir="ltr"
              className="border-ctx -m-0.5px self-stretch hidden lg:flex"
            >
              <div style={{ position: 'relative' }}>
                <ul data-orientation="horizontal" className="h-full flex" dir="ltr">
                  <li className="flex items-stretch whitespace-nowrap -mx-0.25 first:ml-0 last:mr-0 xl:mx-0">
                    <a className="flex items-center p-1 hover:bg-black hover:text-white" href="/">
                      Themes
                    </a>
                  </li>
                  <li className="flex items-stretch whitespace-nowrap -mx-0.25 first:ml-0 last:mr-0 xl:mx-0">
                    <a
                      className="flex items-center p-1 hover:bg-black hover:text-white"
                      href="/about"
                    >
                      About
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
