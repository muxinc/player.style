'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { NavLink } from './NavLink';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div data-state="closed" className="h-full block lg:hidden">
      <button
        className={clsx('relative z-20 px-0.75 md:px-1 h-full group transition-colors ease-in-out-energetic duration-medium', open && 'bg-charcoal text-white')}
        type="button"
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen(!open)}
      >
        <span className="sr-only">Toggle navigation menu</span>
        <svg
          role="img"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          data-state={open ? 'open' : 'closed'}
          className="group/x transition-transform transform-gpu origin-center ease-in-out-energetic duration-medium group-active:-rotate-[10deg] data-[state=closed]:group-active:rotate-[10deg]"
        >
          <title>X</title>
          <path
            d="M5 5L23 23"
            className="stroke-current transition-transform transform-gpu origin-center ease-in-out-energetic duration-medium group-data-[state=closed]/x:-translate-y-[15%] group-data-[state=closed]/x:rotate-[135deg]"
            vectorEffect="non-scaling-stroke"
          ></path>
          <path
            d="M5 23L23 5"
            className="stroke-current transition-transform transform-gpu origin-center ease-in-out-energetic duration-medium group-data-[state=closed]/x:translate-y-[15%] group-data-[state=closed]/x:rotate-45"
            vectorEffect="non-scaling-stroke"
          ></path>
        </svg>
      </button>
      <nav
        className="z-20 overflow-clip absolute -left-0.5px md:left-1/2 -right-0.5px top-[calc(100%-0.5px)] mb-0.5 duration-medium ease-in-out-energetic transition-[height] data-[state=open]:h-[170px] data-[state=closed]:h-0"
        data-orientation="vertical"
        data-state={open ? 'open' : 'closed'}
      >
        <NavLink
          className="bg-charcoal text-white hover:bg-black focus-visible:bg-black w-full min-h-2 px-1 py-0.5 border-b border-gray-dark flex items-center justify-between"
          href="/"
        >
          Themes
        </NavLink>
        <NavLink
          className="bg-charcoal text-white hover:bg-black focus-visible:bg-black w-full min-h-2 px-1 py-0.5 border-b border-gray-dark flex items-center justify-between"
          href="/about"
        >
          About
        </NavLink>
        <a
          className="bg-charcoal text-white hover:bg-black focus-visible:bg-black w-full min-h-2 px-1 py-0.5 border-b border-gray-dark flex items-center justify-between"
          href="https://github.com/muxinc/player.style/issues/new"
          target="_blank"
        >
          Feedback ⧉
        </a>
      </nav>
    </div>
  );
}
