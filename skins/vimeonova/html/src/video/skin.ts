/*
 * Vimeonova for Video.js 10, the video preset's HTML skin: registers the Video.js elements ./skin.html uses and loads the
 * stylesheet. Paste skin.html inside <video-player>, with the media where its placeholder comment is.
 */
import { PlaybackRateRadioGroupElement } from '@videojs/html';

import '../styles/vimeonova.css';
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
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/captions-radio-group';
import '@videojs/html/ui/quality-radio-group';

/** The original labelled rates `1x`, `1.5x`; v10's default is the multiplication sign. */
function formatRate(rate: number): string {
  return `${rate}x`;
}

/* skin.html's rate menu uses this tag: the stock rate group with the original's labels. */
const RATE_GROUP_TAG = 'ps-vimeonova-rate-group';

/**
 * Scrolls a menu that has just opened so its checked row shows. On a short player the rate menu is shorter than its
 * eight rows and would open at 0.2x with the checked 1x out of view. Two frames: the menu is shown and given its
 * available height a frame after it opens.
 */
function scrollToChecked(menu: HTMLElement): void {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const item = menu.querySelector<HTMLElement>('[aria-checked="true"]');
      if (!item) return;
      const box = menu.getBoundingClientRect();
      const row = item.getBoundingClientRect();
      if (row.top < box.top || row.bottom > box.bottom) {
        menu.scrollTop += row.top - box.top - (box.height - row.height) / 2;
      }
    })
  );
}

if (typeof customElements !== 'undefined' && !customElements.get(RATE_GROUP_TAG)) {
  customElements.define(
    RATE_GROUP_TAG,
    class extends PlaybackRateRadioGroupElement {
      formatRate = formatRate;

      #abort: AbortController | null = null;

      override connectedCallback(): void {
        super.connectedCallback();
        const menu = this.closest<HTMLElement>('media-menu');
        if (!menu) return;
        this.#abort = new AbortController();
        menu.addEventListener(
          'open-change',
          (event) => {
            if (event.target === menu && (event as CustomEvent<{ open: boolean }>).detail.open) scrollToChecked(menu);
          },
          { signal: this.#abort.signal }
        );
      }

      override disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#abort?.abort();
        this.#abort = null;
      }
    }
  );
}
