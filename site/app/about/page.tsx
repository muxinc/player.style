import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import ArrowUpRightIcon from '../_components/icons/ArrowUpRightIcon';
import InlineCode from '../_components/InlineCode';
import { FEEDBACK_URL, GITHUB_URL, MUX_URL, VIDEOJS_URL } from '../_components/nav-links';
import PageFrame from '../_components/PageFrame';
import { textLink } from '../_components/ui';

export const metadata: Metadata = {
  title: 'About',
  description: 'player.style is a gallery of first- and third-party skins for Video.js 10.',
};

function P({ children }: { children: ReactNode }) {
  return <p className="text-p2 mb-5 text-pretty last:mb-0">{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-h3 md:text-h25 mt-12 mb-5 uppercase">{children}</h2>;
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
        <header className="border-line mb-8 flex flex-col gap-3 border-b pt-10 pb-8 md:pt-14">
          <p className="font-display text-h4 text-accent uppercase">About</p>
          <h1 className="font-display text-h2 md:text-h15 uppercase">About player.style</h1>
        </header>
        <P>
          player.style is a gallery of skins for <ExternalLink href={VIDEOJS_URL}>Video.js 10</ExternalLink>. Every skin
          here is a live player you can try before you install: pick a use case, set an accent color, and see the real
          controls running on real media. The first-party skins are built and maintained by the Video.js team, and
          third-party skins from the community are arriving, starting with ports of the Media Chrome themes.
        </P>
        <H2>How first-party skins work</H2>
        <P>
          First-party skins are built with the Video.js skin toolchain and ship inside the{' '}
          <InlineCode>@videojs/html</InlineCode> and <InlineCode>@videojs/react</InlineCode> packages, one skin per
          preset and tier: default and minimal variants for video, audio, live video, and live audio. They are themed
          with plain CSS custom properties, starting with <InlineCode>--media-accent-color</InlineCode>, and when you
          need to go further the{' '}
          <ExternalLink href="https://videojs.org/docs/guides/customize-skins">skin source</ExternalLink> can be added
          to your project and edited directly.
        </P>
        <H2>Submit a skin</H2>
        <P>
          Built a skin for Video.js 10? Third-party listings are coming soon, and we would love yours to be among the
          first. <ExternalLink href={FEEDBACK_URL}>Open an issue on GitHub</ExternalLink> with a link to the package and
          a demo and we will be in touch when submissions open.
        </P>
        <H2>Looking for Media Chrome themes?</H2>
        <P>
          The previous version of player.style was a gallery of Media Chrome themes. It lives on at{' '}
          <ExternalLink href="https://media-chrome.player.style">media-chrome.player.style</ExternalLink>, and the
          themes are still published on npm as <InlineCode>player.style@media-chrome</InlineCode>.
        </P>
        <H2>Who makes this</H2>
        <P>
          player.style is a Video.js project sponsored by <ExternalLink href={MUX_URL}>Mux</ExternalLink>, where much of
          the Video.js team works on video infrastructure for developers. Feedback and ideas are welcome on{' '}
          <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>, or head back to the{' '}
          <Link className={textLink} href="/">
            skins
          </Link>
          .
        </P>
        <p className="mt-10">
          <Link
            href="/"
            className="corner-squircle border-manila-dark text-p3 intent:bg-manila-75 dark:border-line dark:intent:bg-warm-gray inline-flex items-center gap-1.5 rounded-lg border px-4 py-3 font-semibold"
          >
            Browse the skins
            <ArrowUpRightIcon className="text-muted size-4" />
          </Link>
        </p>
      </article>
    </PageFrame>
  );
}
