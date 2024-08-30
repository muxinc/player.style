import Grid from '../_components/Grid';
import Link from '../_components/Link';

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body tracking-wide text-md leading-normal last:mb-0 mb-1 font-normal normal-case [text-wrap:pretty] mx-auto w-full max-w-26">
    {children}
  </p>
);

const LI = ({ children }: { children: React.ReactNode }) => (
  <li className="font-body tracking-wide text-md leading-normal mb-0.25 last:mb-0 font-normal normal-case [text-wrap:pretty] mx-auto w-full max-w-26">
    {children}
  </li>
);

export default function About() {
  return (
    <>
      <Grid withPadding={false}>
        <div className="bg-white py-2 px-1 md:py-3 md:px-2 lg:py-4 lg:px-3 min-h-[calc(100vh-theme(spacing.7))]">
          <h1 className="font-body text-2xl md:text-4xl leading-heading-2 md:leading-heading font-bold normal-case [text-wrap:pretty] mx-auto w-full max-w-26 mb-1">
            About
          </h1>
          <P>
            Who loves video players? We do! We just want them to be… prettier. Like, all of them. More polished, too.
            And what if your player looked like it was made for your website? 🙀 And what if it just worked with your
            dev framework? 🤯
          </P>
          <P>
            We might be shooting for the stars, but we&rsquo;re also building on top of the magical{' '}
            <Link href="https://media-chrome.org" target="_blank">
              media chrome
            </Link>{' '}
            ecosystem of player components, which does a few things for us:
          </P>
          <ol className="list-decimal ml-1 mb-1">
            <LI>
              It uses web components which are compatible across web dev frameworks. Yes, even React (which can be
              grumpy about web components).
            </LI>
            <LI>
              It allows us to separate the player UI from the player streaming technology, so skins can be used across
              “players” rather than being player-specific.
            </LI>
          </ol>
          <P>It&rsquo;s a brave new world…</P>
          <P>
            The player.style team built Video.js and contributed to most of your favorite streaming site players, so
            this ain&rsquo;t our first rotoscope. And we all work at{' '}
            <Link href="https://mux.link/player-style">Mux</Link>, in case you&rsquo;re looking for some video hosting
            to pair with your player. We hope player.style helps you find the ideal player for whatever you&rsquo;re
            trying to do with video.
          </P>
          <P>
            Help us get the word out! TwiX it or something. If you share player.style, you&rsquo;ll get one theme for
            free! (They&rsquo;re all free, but the first one will be <em>really</em> free).
          </P>
          <P>
            Sincerely,
            <br />
            The player.stylyzers
          </P>
        </div>
      </Grid>
    </>
  );
}
