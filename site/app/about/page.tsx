import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SITE_NAME } from '@/lib/site';

import ChevronRightIcon from '../_components/icons/ChevronRightIcon';
import InlineCode from '../_components/InlineCode';
import { ISSUES_URL, VIDEOJS_DOCS_URL, VIDEOJS_URL } from '../_components/nav-links';
import PageFrame from '../_components/PageFrame';
import { textLink } from '../_components/ui';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME} is a catalog of community and recreated skins for Video.js 10, maintained by the Video.js team. Every preview is a real player.`,
};

function P({ children }: { children: ReactNode }) {
  return <p className="text-p2 mb-5 text-pretty last:mb-0">{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-h3 md:text-h25 mt-12 mb-5 leading-[1.15] uppercase md:leading-[1.15]">
      {children}
    </h2>
  );
}

function LI({ children }: { children: ReactNode }) {
  return <li className="text-p2 mb-3 pl-1 text-pretty last:mb-0">{children}</li>;
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={textLink} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function About() {
  return (
    <PageFrame as="section" className="flex-1">
      <article className="mx-auto max-w-3xl pb-8">
        <header className="border-line mb-8 border-b pt-10 pb-8 md:pt-14">
          <h1 className="font-display text-h2 md:text-h15 uppercase">About</h1>
        </header>
        <P>
          {SITE_NAME} is a catalog of skins for <ExternalLink href={VIDEOJS_URL}>Video.js 10</ExternalLink>, maintained
          by the Video.js team. Video.js keeps a player&rsquo;s parts apart: the media, the state, and the skin. So a
          skin is just a skin. Swap it and nothing else has to move.
        </P>
        <P>
          Every card on the home page is a real, running player. Not a screenshot. Not a GIF. Press play, drag the
          scrubber, pick an accent color and watch every skin put it on.
        </P>
        <H2>Two kinds of skins</H2>
        <ol className="mb-5 ml-5 list-decimal">
          <LI>
            <strong>First-party skins</strong>, made by the Video.js team. They ship inside{' '}
            <InlineCode>@videojs/html</InlineCode> and <InlineCode>@videojs/react</InlineCode>. Each card links to the{' '}
            <ExternalLink href={VIDEOJS_DOCS_URL}>Video.js docs</ExternalLink>, which open with that skin already
            picked.
          </LI>
          <LI>
            <strong>Community skins</strong>, built on Video.js by others. For now most of them recreate the classic
            Media Chrome themes. They install as source: the shadcn CLI copies a skin&rsquo;s files into your project
            from this site&rsquo;s registry, and from there they&rsquo;re yours to edit.
          </LI>
        </ol>
        <H2>Looking for player.style?</H2>
        <P>
          You found it. The Media Chrome-era player.style site is retired, and player.style now redirects here. Its
          themes carry on as the recreated skins in this catalog.
        </P>
        <H2>Want a skin listed?</H2>
        <P>
          <ExternalLink href={ISSUES_URL}>Open an issue</ExternalLink>.
        </P>
        <p className="mt-10">
          <Link
            href="/"
            className="corner-squircle border-manila-dark text-p3 intent:bg-manila-75 dark:border-line dark:intent:bg-warm-gray inline-flex items-center gap-1.5 rounded-lg border px-4 py-3 font-semibold"
          >
            Browse the skins
            <ChevronRightIcon className="text-muted size-4" />
          </Link>
        </p>
      </article>
    </PageFrame>
  );
}
