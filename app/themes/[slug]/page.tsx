import HlsVideo from 'hls-video-element/react';
import MediaTheme from '@/app/_components/MediaTheme';
import Grid from '@/app/_components/Grid';
import Code from '@/app/_components/Code';
import { getEntry } from '@/app/_utils/content';
import type { Theme } from '@/app/_types/theme';

export default async function Theme(props: any) {
  const theme = (await getEntry('themes', props.params.slug)) as unknown as Theme;

  return (
    <>
      <div className="flex-1">
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="-m-0.5px grid grid-cols-1 h-2"></div>
          </div>
        </div>
        <div className="relative grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="block lg:flex items-center dark">
              <MediaTheme name={props.params.slug} theme={theme}>
                <HlsVideo
                  suppressHydrationWarning
                  className="aspect-video block w-full"
                  slot="media"
                  src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008.m3u8"
                  poster="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/thumbnail.webp?time=13"
                  crossOrigin="anonymous"
                >
                  <track
                    label="thumbnails"
                    default
                    kind="metadata"
                    src="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/storyboard.vtt"
                  />
                </HlsVideo>
              </MediaTheme>
            </div>
          </div>
        </div>
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-charcoal border-ctx-black text-white set-bg-ctx-charcoal set-border-ctx-black z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx-black">
            <div className="-m-0.5px grid grid-cols-1 h-3"></div>
          </div>
        </div>
        <Grid>
          <h1 className="text-3xl font-bold mb-0.5">{theme.title}</h1>
          <p className="text-lg mb-0.5 md:mr-8">{theme.description}</p>
          <p className="mb-1">By {theme.author.name}</p>

          <hr className="border-putty mb-2" />

          <h3 className="text-2xl font-semibold mb-1">How to use</h3>

          <h4 className="text-lg font-medium mb-1">Install dependencies</h4>

          <Code lang="sh" code="npm install media-chrome" />

          <h4 className="text-lg font-medium mb-1">Embed your player</h4>

          <p className="mb-1 md:mr-8">
            Ok so...Player.style isn’t a bunch of “players” per se.
            It’s helps you create your own player, so there is some assembly required.
            We’ve tried to make this part as Ikea-furniture like as possible,
            but don’t be afraid to break out of it if you know what you’re doing.
          </p>

          <Code lang="js" code={
`import 'media-chrome';
import 'media-chrome/dist/media-theme-element.js'`} />

          <Code lang="html" code={
`<template id="media-theme-${props.params.slug}">
  ${theme.templates.html.content.replace(/^(.)/gm, '  $1').trim()}
</template>

<media-theme template="media-theme-${props.params.slug}">
  <video slot="media" src=""></video>
</media-theme>`} />
        </Grid>
      </div>
    </>
  );
}
