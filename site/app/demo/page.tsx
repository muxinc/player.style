import Grid from '../_components/Grid';
import MuxVideo from '@mux/mux-video-react';
import MediaTheme from 'player.style/microvideo/react';

export default function Demo() {
  return (
    <>
      <Grid>
        <MediaTheme className="aspect-video block w-full">
          <MuxVideo
            className="w-full h-full"
            slot="media"
            src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008.m3u8"
            poster="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/thumbnail.webp"
          ></MuxVideo>
        </MediaTheme>
      </Grid>
    </>
  );
}
