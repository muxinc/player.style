/*
 * Video.js 8 for live video on Video.js 10, HTML element: registers `<videojs-8-live-skin>` for the live-video preset.
 *
 * The element owns a shadow root that holds the live template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 * The stylesheet is @player.style/videojs-8's, adopted from its source; the live-only rules in it key on the root's
 * `data-preset="live-video"`.
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
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/live-button';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import markup from './template.html?raw';

import styles from '../../../videojs-8/src/skin.css?inline';

const TAG_NAME = 'videojs-8-live-skin';

/* The host is a plain box; everything visual lives on `.ps-videojs-8` inside, so this never needs editing per skin. */
const HOST_STYLES = ':host{display:block;width:100%}:host([hidden]){display:none}';

const isBrowser = typeof HTMLElement !== 'undefined';

/* Server runtimes import this module for its types and `customElements.define` guard; they never construct it. */
const BaseElement = (isBrowser ? HTMLElement : class {}) as typeof HTMLElement;

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
 * `<videojs-8-live-skin>`: the Video.js 8 skin for live video, around a `<video>`, inside a Video.js
 * `<live-video-player>`: the live control (a dot and LIVE, red at the live edge) in place of the progress bar and
 * remaining time.
 *
 * @example
 *   ```html
 *   <script type="module">
 *     import '@videojs/html/live-video/player';
 *     import '@player.style/videojs-8-live/html';
 *   </script>
 *
 *   <live-video-player>
 *     <videojs-8-live-skin>
 *       <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
 *     </videojs-8-live-skin>
 *   </live-video-player>
 *   ```;
 */
export class Videojs8LiveSkinElement extends BaseElement {
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
  }
}

if (isBrowser && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, Videojs8LiveSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: Videojs8LiveSkinElement;
  }
}
