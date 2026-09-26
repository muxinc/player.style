/*
 * Plyr for Video.js 10, HTML element: registers `<plyr-skin>`.
 *
 * The element owns a shadow root that holds the skin template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 */
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
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/fullscreen-button';
import markup from './template.html?raw';

import styles from '../skin.css?inline';

const TAG_NAME = 'plyr-skin';

/* The host is a plain box; everything visual lives on `.ps-plyr` inside, so this never needs editing per skin. */
const HOST_STYLES = ':host{display:block;width:100%}:host([hidden]){display:none}';

const isBrowser = typeof HTMLElement !== 'undefined';

/* Server runtimes import this module for its types and `customElements.define` guard; they never construct it. */
const BaseElement = (isBrowser ? HTMLElement : class {}) as typeof HTMLElement;

/** Plyr's speed labels: `Normal` for 1, `1.5×` otherwise. */
export function formatRate(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}×`;
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
 * `<plyr-skin>`: the Plyr skin around a `<video>`, inside a Video.js `<video-player>`.
 *
 * @example
 *   ```html
 *   <video-player>
 *     <plyr-skin>
 *       <video src="video.mp4"></video>
 *       <img slot="poster" src="poster.jpg" alt="" />
 *     </plyr-skin>
 *   </video-player>
 *   ```;
 */
export class PlyrSkinElement extends BaseElement {
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

    // `formatRate` is a plain class field, so it only sticks once the group has been upgraded.
    customElements.upgrade(root);

    const rates = root.querySelector('media-playback-rate-radio-group');

    if (rates) rates.formatRate = formatRate;
  }
}

if (isBrowser && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, PlyrSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: PlyrSkinElement;
  }
}
