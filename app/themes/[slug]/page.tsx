import Grid from '@/app/_components/Grid';
import MediaTheme from '@/app/_components/MediaTheme';
import { getEntry } from '@/app/_utils/content';
import HlsVideo from 'hls-video-element/react';

export default async function Theme(props: any) {
  const theme = await getEntry('themes', props.params.slug);

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
        <Grid></Grid>
      </div>
    </>
  );
}
