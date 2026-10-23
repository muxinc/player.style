/*
 * Plyr for Video.js 10, the video preset's HTML skin: registers the Video.js elements ./skin.html uses and loads the
 * stylesheet. Paste skin.html inside <video-player>, with the media where its placeholder comment is.
 */
import { PlaybackRateRadioGroupElement } from '@videojs/html';

import '../styles/plyr.css';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/time';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/captions-radio-group';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/fullscreen-button';

/** Plyr's speed labels: `Normal` for 1, `1.5×` otherwise. */
function formatRate(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}×`;
}

/* skin.html's Speed page uses this tag: the stock rate group with Plyr's labels. */
const RATE_GROUP_TAG = 'ps-plyr-rate-group';

if (typeof customElements !== 'undefined' && !customElements.get(RATE_GROUP_TAG)) {
  customElements.define(
    RATE_GROUP_TAG,
    class extends PlaybackRateRadioGroupElement {
      formatRate = formatRate;
    }
  );
}
