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
            src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8"
            poster="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp"
          ></MuxVideo>
        </MediaTheme>
      </Grid>
    </>
  );
}
