/*
 * Mux Player for Video.js 10, the video preset's HTML skin: registers the Video.js elements ./skin.html uses and loads
 * the stylesheet. Paste skin.html inside <video-player>, with the media where its placeholder comment is.
 */
import { PlaybackRateRadioGroupElement } from '@videojs/html';

import '../styles/mux-player.css';
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
import '@videojs/html/ui/title';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/seek-button';
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
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/audio-track-radio-group';
import '@videojs/html/ui/captions-radio-group';

/** Mux Player labels rates `1x`, `1.5x`; Video.js 10's default is the multiplication sign. */
function formatRate(rate: number): string {
  return `${rate}x`;
}

/* skin.html's rate menu uses this tag: the stock rate group with Mux Player's labels. */
const RATE_GROUP_TAG = 'ps-mux-player-rate-group';

if (typeof customElements !== 'undefined' && !customElements.get(RATE_GROUP_TAG)) {
  customElements.define(
    RATE_GROUP_TAG,
    class extends PlaybackRateRadioGroupElement {
      formatRate = formatRate;
    }
  );
}

/*
 * Once playback starts the centre play button pops away and turns `visibility: hidden`, and a focused button that hides
 * drops focus to the page. So when it has focus as playback starts (clicked, or Enter or Space), focus passes to the
 * control bar's play button, which shows at that moment. Below 470px the centre button stays as the play toggle and the
 * bar's is not displayed, so focus stays where it is.
 */
function keepFocusOnStart(records: MutationRecord[]): void {
  for (const { target: center } of records) {
    if (center !== document.activeElement || !(center instanceof Element)) continue;
    if (!center.matches('.ps-mux-player .ps-center-play[data-started]')) continue;

    const play = center.closest('.ps-mux-player')?.querySelector<HTMLElement>('.ps-play-button');
    if (play?.getClientRects().length) play.focus();
  }
}

if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  new MutationObserver(keepFocusOnStart).observe(document, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-started'],
  });
}
