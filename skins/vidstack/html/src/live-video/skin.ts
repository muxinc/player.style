/*
 * Vidstack for Video.js 10, the live-video preset's HTML skin: registers the Video.js elements ./skin.html uses and
 * loads the stylesheet. Paste skin.html inside <live-video-player>, with the media where its placeholder comment is.
 */
import { PlaybackRateRadioGroupElement } from '@videojs/html';

import '../styles/vidstack.css';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/live-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/title';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/captions-radio-group';

/** Vidstack's speed hint: `Normal` at 1, `1.5x` otherwise; Video.js 10's default is `1×`. */
function formatRate(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}x`;
}

/* skin.html's Speed menus use this tag: the stock rate group with Vidstack's labels. */
const RATE_GROUP_TAG = 'ps-vidstack-rate-group';

if (typeof customElements !== 'undefined' && !customElements.get(RATE_GROUP_TAG)) {
  customElements.define(
    RATE_GROUP_TAG,
    class extends PlaybackRateRadioGroupElement {
      formatRate = formatRate;
    }
  );
}
