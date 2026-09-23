import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { FEEDBACK_URL, MUX_URL } from '../_components/nav-links';
import PageFrame from '../_components/PageFrame';

export const metadata: Metadata = {
  title: 'About',
  description: 'player.style is a gallery of first- and third-party skins for Video.js 10.',
};

const linkClassName = 'underline decoration-1 underline-offset-[0.3em] hover:no-underline focus-visible:no-underline';

function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-md mx-auto mb-1 w-full max-w-26 leading-normal tracking-wide text-pretty last:mb-0">
      {children}
    </p>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="leading-heading mx-auto mt-2 mb-0.5 w-full max-w-26 text-xl font-bold md:text-2xl">{children}</h2>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={linkClassName} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function About() {
  return (
    <PageFrame as="section" className="flex-1">
      <div className="bg-white px-1 py-2 md:px-2 md:py-3 lg:px-3 lg:py-4">
        <h1 className="leading-heading-2 md:leading-heading mx-auto mb-1 w-full max-w-26 text-2xl font-bold md:text-4xl">
          About player.style
        </h1>
        <P>
          player.style is a gallery of skins for <ExternalLink href="https://videojs.org">Video.js 10</ExternalLink>.
          Every skin here is a live player you can try before you install: pick a use case, set an accent color, and see
          the real controls running on real media. The first-party skins are built and maintained by the Video.js team,
          and third-party skins from the community are coming next.
        </P>
        <H2>How first-party skins work</H2>
        <P>
          First-party skins are built with the Video.js skin toolchain and ship inside the{' '}
          <code className="font-mono text-base">@videojs/html</code> and{' '}
          <code className="font-mono text-base">@videojs/react</code> packages, one skin per preset and tier: default
          and minimal variants for video, audio, live video, and live audio. They are themed with plain CSS custom
          properties, starting with <code className="font-mono text-base">--media-accent-color</code>, and when you need
          to go further the{' '}
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
          themes are still published on npm as <code className="font-mono text-base">player.style@media-chrome</code>.
        </P>
        <H2>Who makes this</H2>
        <P>
          player.style is a Video.js project sponsored by <ExternalLink href={MUX_URL}>Mux</ExternalLink>, where much of
          the Video.js team works on video infrastructure for developers. Feedback and ideas are welcome on{' '}
          <ExternalLink href="https://github.com/muxinc/player.style">GitHub</ExternalLink>, or head back to the{' '}
          <Link className={linkClassName} href="/">
            skins
          </Link>
          .
        </P>
      </div>
    </PageFrame>
  );
}
