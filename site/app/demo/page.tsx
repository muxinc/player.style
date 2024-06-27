import Grid from '../_components/Grid';
import MuxVideo from '@mux/mux-video-react';
import MediaTheme from 'player.style/microvideo/react';

export default function Demo() {
  return (
    <>
      <Grid>
        <MediaTheme className="aspect-video block w-full">
          <MuxVideo
            suppressHydrationWarning
            className="w-full h-full"
            slot="media"
            src="https://stream.mux.com/clGdHA024AM9yU9fueA8Kr601LNt02oVfHMVGceXtQO8DI.m3u8"
            poster="https://image.mux.com/clGdHA024AM9yU9fueA8Kr601LNt02oVfHMVGceXtQO8DI/thumbnail.webp"
          ></MuxVideo>
        </MediaTheme>
      </Grid>
    </>
  );
}
