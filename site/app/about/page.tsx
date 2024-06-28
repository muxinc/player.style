import Grid from '../_components/Grid';

export default function About() {
  return (
    <>
      <Grid className="flex-1">
        <h1 className="text-3xl font-bold mb-0.5">About</h1>
        <p className="text-md mb-0.5 md:mr-8">
        Who loves video players? We do! We just want them to be…prettier. Like, all of them. More polished, too. And what if your player looked like it was made for your website? 🙀 And what if it just worked with your dev framework? 🤯
        </p>
        <p className="text-md mb-0.5 md:mr-8">We might be shooting for the stars, but we&rsquo;re also building on top of the magical <a href="https://media-chrome.org" target="_blank">media chrome</a> ecosystem of player components, which does a few things for us:</p>
        <ol>
          <li className="list-decimal text-md mb-0.5 md:mr-8">It uses web components which are compatible across web dev frameworks. Yes, even React (which can be grumpy about web components).</li>
          <li className="list-decimal text-md mb-0.5 md:mr-8">It allows us to separate the player UI from the player streaming technology, so skins can be used across “players” rather than being player-specific.</li>
        </ol>
        <p className="text-md mb-0.5 md:mr-8">It&rsquo;s a brave new world…</p>
        <p className="text-md mb-0.5 md:mr-8">The Player.style team built Video.js and contributed to most of your favorite streaming site players, so this ain&rsquo;t our first rotoscope. And we all work at <a href="https://www.mux.com/">Mux</a>, in case you&rsquo;re looking for some video hosting to pair with your player. We hope player.style helps you find the ideal player for whatever you&rsquo;re trying to do with video.</p>
        <p className="text-md mb-0.5 md:mr-8">Help us get the word out! TwiX it or something. If you share player.style, you&rsquo;ll get one theme for free! (They&rsquo;re all free, but the first one will be <em>really</em> free).</p>
        <p className="text-md mb-0.5 md:mr-8">Sincerely,<br />The player.stylyzers</p>
      </Grid>
    </>
  );
}
