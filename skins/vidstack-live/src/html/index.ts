/*
 * Vidstack for live video on Video.js 10, HTML element: registers `<vidstack-live-skin>` for the live-video preset.
 *
 * The element owns a shadow root that holds the live template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 * The stylesheet is `@player.style/vidstack`'s; the shadow-root host is a copy of that package's.
 */
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
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/captions-radio-group';
import markup from './template.html?raw';

import styles from '../../../vidstack/src/skin.css?inline';

const TAG_NAME = 'vidstack-live-skin';

/* The host is a plain box; everything visual lives on `.ps-vidstack` inside, so this never needs editing per skin. */
const HOST_STYLES = ':host{display:block;width:100%}:host([hidden]){display:none}';

const isBrowser = typeof HTMLElement !== 'undefined';

/* Server runtimes import this module for its types and `customElements.define` guard; they never construct it. */
const BaseElement = (isBrowser ? HTMLElement : class {}) as typeof HTMLElement;

/** Vidstack's speed hint: `Normal` at 1, `1.5x` otherwise; v10's default is `1×`. */
export function formatRate(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}x`;
}

let template: HTMLTemplateElement | undefined;
let sheets: CSSStyleSheet[] | undefined;

function getTemplate(): HTMLTemplateElement {
  if (!template) {
    template = document.createElement('template');
    template.innerHTML = markup;
  }

  return template;
}

/** One shared stylesheet for every instance, parsed once. */
function getSheets(): CSSStyleSheet[] {
  if (!sheets) {
    sheets = [HOST_STYLES, styles].map((text) => {
      const sheet = new CSSStyleSheet();

      sheet.replaceSync(text);
      return sheet;
    });
  }

  return sheets;
}

function supportsAdoptedStyleSheets(): boolean {
  return 'adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype;
}

/**
 * `<vidstack-live-skin>`: the Vidstack default video layout for live video, around a `<video>`, inside a Video.js
 * `<live-video-player>`: the LIVE badge (grey behind the live edge, red at it) in place of the time, and no time
 * slider.
 *
 * @example
 *   ```html
 *   <script type="module">
 *     import '@videojs/html/live-video/player';
 *     import '@player.style/vidstack-live/html';
 *   </script>
 *
 *   <live-video-player>
 *     <vidstack-live-skin>
 *       <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
 *     </vidstack-live-skin>
 *   </live-video-player>
 *   ```;
 */
export class VidstackLiveSkinElement extends BaseElement {
  static readonly tagName = TAG_NAME;

  constructor() {
    super();

    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: 'open' });

    if (supportsAdoptedStyleSheets()) {
      root.adoptedStyleSheets = getSheets();
    } else {
      const style = document.createElement('style');

      style.textContent = `${HOST_STYLES}\n${styles}`;
      root.append(style);
    }

    root.append(getTemplate().content.cloneNode(true));

    // `formatRate` is a plain class field, so it only sticks once the groups have been upgraded.
    customElements.upgrade(root);

    for (const rates of root.querySelectorAll('media-playback-rate-radio-group')) rates.formatRate = formatRate;
  }
}

if (isBrowser && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, VidstackLiveSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: VidstackLiveSkinElement;
  }
}
