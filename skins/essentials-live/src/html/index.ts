/*
 * Essentials Live for Video.js 10, HTML edition: registers `<essentials-live-skin>` for the live-video preset.
 *
 * The element owns a shadow root that holds the skin template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 * The stylesheet is @player.style/essentials's, adopted from its source; the live-only rules in it key on the root's
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
import '@videojs/html/ui/title';
import '@videojs/html/ui/live-button';
import '@videojs/html/ui/time';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import markup from './template.html?raw';

import styles from '../../../essentials/src/skin.css?inline';

const TAG_NAME = 'essentials-live-skin';

/* The host is a plain box; everything visual lives on `.ps-essentials` inside, so this never needs editing per skin. */
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
 * `<essentials-live-skin>`: the Essentials theme's live layout around a `<video>`, inside a Video.js
 * `<live-video-player>`: a Live badge and the elapsed time on the left of the bar, the volume, captions,
 * remote-playback and fullscreen controls on the right, without a play button or scrubber.
 *
 * @example
 *   ```html
 *   <live-video-player>
 *     <essentials-live-skin>
 *       <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
 *     </essentials-live-skin>
 *   </live-video-player>
 *   ```;
 */
export class EssentialsLiveSkinElement extends BaseElement {
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
  customElements.define(TAG_NAME, EssentialsLiveSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: EssentialsLiveSkinElement;
  }
}
