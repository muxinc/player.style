/*
 * Reelplay for Video.js 10, the video preset's HTML skin: registers the Video.js elements ./skin.html uses, and the
 * skin's own transport button, and loads the stylesheet. Paste skin.html inside <video-player>, with the media where
 * its placeholder comment is.
 */
import { PlayButtonElement, PlayerController, playerContext, selectTime } from '@videojs/html';

import '../styles/reelplay.css';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-separator';

/** What a transport button does: play only plays, pause only pauses, stop pauses and rewinds to the start. */
type TransportAction = 'play' | 'pause' | 'stop';

interface Playback {
  paused: boolean;
  ended: boolean;
  play(): Promise<void>;
  pause(): void;
}

/* skin.html's play, pause and stop buttons use this tag: a play button whose `action` attribute says what it does. */
const TRANSPORT_TAG = 'ps-reelplay-transport-button';

if (typeof customElements !== 'undefined' && !customElements.get(TRANSPORT_TAG)) {
  customElements.define(
    TRANSPORT_TAG,
    class extends PlayButtonElement {
      #player = new PlayerController(this, playerContext);

      constructor() {
        super();
        // The play/pause shortcuts toggle, which none of the three does, so none of them announces one.
        (this as unknown as { hotkeyAction?: string }).hotkeyAction = undefined;
      }

      protected override async activate(playback: Playback): Promise<void> {
        const action = (this.getAttribute('action') ?? 'play') as TransportAction;

        if (action === 'play') {
          if (playback.paused || playback.ended) await playback.play();
          return;
        }

        playback.pause();
        if (action === 'stop') {
          const store = this.#player.value;
          if (store) selectTime(store.state)?.seek(0);
        }
      }
    }
  );
}
