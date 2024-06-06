import PlayerHero from '@/app/_components/PlayerHero';
import Grid from '@/app/_components/Grid';
import Code from '@/app/_components/Code';
import { getEntry } from '@/app/_utils/content';
import type { Theme } from '@/app/_types/theme';

export default async function Theme(props: any) {
  const theme = (await getEntry('themes', props.params.slug)) as unknown as Theme;

  return (
    <>
      <div className="flex-1">
        <PlayerHero theme={theme} {...props} />
        <Grid>
          <h1 className="text-3xl font-bold mb-0.5">{theme.title}</h1>
          <p className="text-lg mb-0.5 md:mr-8">{theme.description}</p>
          <p className="mb-1">By {theme.author.name}</p>

          <hr className="border-putty mb-2" />

          <h3 className="text-2xl font-semibold mb-1">How to use</h3>

          <h4 className="text-lg font-medium mb-1">Install dependencies</h4>

          <Code className="mb-2" lang="sh" code="npm install media-chrome" />

          <h4 className="text-lg font-medium mb-1">Embed your player</h4>

          <Code
            className="mb-1"
            lang="js"
            code={`import 'media-chrome';
import 'media-chrome/dist/media-theme-element.js';
import 'media-chrome/dist/themes/${props.params.slug}.js';`}
          />

          <Code
            lang="html"
            code={`<media-theme-${props.params.slug}>
  <video
    slot="media"
    src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4"
  ></video>
</media-theme-${props.params.slug}>`}
          />
        </Grid>
      </div>
    </>
  );
}
