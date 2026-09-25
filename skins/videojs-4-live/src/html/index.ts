/*
 * Video.js 4 for live video on Video.js 10, HTML element: registers `<videojs-4-live-skin>` for the live-video preset.
 *
 * The element owns a shadow root that holds the live template around a default `<slot>` for the media and the named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 * The stylesheet is the on-demand skin's (`skins/videojs-4/src/skin.css`), shared by both packages.
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
import '@videojs/html/ui/live-button';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import markup from './template.html?raw';

import styles from '../../../videojs-4/src/skin.css?inline';

const TAG_NAME = 'videojs-4-live-skin';

/* The host is a plain box; everything visual lives on `.ps-videojs-4` inside. */
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
 * `<videojs-4-live-skin>`: the 2013 Video.js 4 default skin for live video, around a `<video>`, inside a Video.js
 * `<live-video-player>`: the LIVE label in place of the progress strip and the time readout.
 *
 * @example
 *   ```html
 *   <live-video-player>
 *     <videojs-4-live-skin>
 *       <video src="stream.m3u8"></video>
 *       <img slot="poster" src="poster.jpg" alt="" />
 *     </videojs-4-live-skin>
 *   </live-video-player>
 *   ```;
 */
export class Videojs4LiveSkinElement extends BaseElement {
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
  customElements.define(TAG_NAME, Videojs4LiveSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: Videojs4LiveSkinElement;
  }
}
