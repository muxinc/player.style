import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import ChevronRightIcon from '../_components/icons/ChevronRightIcon';
import InlineCode from '../_components/InlineCode';
import { MUX_URL, SKIN_GUIDE_URL, VIDEOJS_DOCS_URL, VIDEOJS_URL } from '../_components/nav-links';
import PageFrame from '../_components/PageFrame';
import { textLink } from '../_components/ui';

export const metadata: Metadata = {
  title: 'About',
  description:
    'player.style is a gallery of official and community skins for Video.js, made by Mux. Every preview is a real player.',
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
          Who loves video players? Still us! We just want them to be&hellip; prettier. All of them. And we want your
          player to look like it was made for your site, not dropped in from somewhere else. That was the idea behind
          player.style the first time around. It still is.
        </P>
        <P>
          This time we&rsquo;re building on <ExternalLink href={VIDEOJS_URL}>Video.js</ExternalLink>, which keeps a
          player&rsquo;s parts apart: the media, the state, and the skin. So a skin is just a skin. Swap it and nothing
          else has to move, which is the whole trick behind a gallery like this one.
        </P>
        <P>
          Every card on the home page is a real, running player. Not a screenshot. Not a GIF. Press play, drag the
          scrubber, pick an accent color and watch every skin put it on. (Go on, we&rsquo;ll wait.)
        </P>
        <H2>Two kinds of skins</H2>
        <ol className="mb-5 ml-5 list-decimal">
          <LI>
            <strong>Official skins</strong>, made by the Video.js team. They ship inside{' '}
            <InlineCode>@videojs/html</InlineCode> and <InlineCode>@videojs/react</InlineCode>, in default and minimal
            flavors for video, audio, live video, and live audio. Each one sends you to the{' '}
            <ExternalLink href={VIDEOJS_DOCS_URL}>Video.js docs</ExternalLink>, which open with that skin already
            picked.
          </LI>
          <LI>
            <strong>Community skins</strong>, built on Video.js by the rest of us. For now that&rsquo;s mostly the
            classic player.style themes, rebuilt for Video.js as <InlineCode>@player.style/&lt;name&gt;</InlineCode>{' '}
            packages. Install one from npm, or pull its source into your project from our shadcn registry and make it
            properly yours.
          </LI>
        </ol>
        <H2>Who&rsquo;s behind this</H2>
        <P>
          The player.style team built Video.js in the first place and has had a hand in most of your favorite streaming
          sites&rsquo; players, so this still ain&rsquo;t our first rotoscope. We all work at{' '}
          <ExternalLink href={MUX_URL}>Mux</ExternalLink>, and Mux makes player.style, in case you&rsquo;re looking for
          some video hosting to pair with your shiny new player.
        </P>
        <H2>Made a skin?</H2>
        <P>
          We&rsquo;d love to see it. The <ExternalLink href={SKIN_GUIDE_URL}>skin guide</ExternalLink> on GitHub shows
          how a skin package fits together. Send us a pull request and yours could be sitting right next to Winamp.
          (Sitting next to Winamp is an honor. Ask anyone.)
        </P>
        <H2>Looking for the Media Chrome themes?</H2>
        <P>
          They didn&rsquo;t go anywhere. The original player.style lives on at{' '}
          <ExternalLink href="https://media-chrome.player.style">media-chrome.player.style</ExternalLink>, and the
          themes are still on npm as <InlineCode>player.style@media-chrome</InlineCode>.
        </P>
        <H2>One more thing</H2>
        <P>
          Help us get the word out! Post it, skeet it, toot it, whatever the kids are doing now. If you share
          player.style, you&rsquo;ll get one skin for free. (They&rsquo;re all free, but the first one will be{' '}
          <em>really</em> free.)
        </P>
        <P>
          Sincerely,
          <br />
          The player.stylyzers
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
