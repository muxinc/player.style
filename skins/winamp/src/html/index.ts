/*
 * Winamp for Video.js 10, HTML element: registers `<winamp-skin>`.
 *
 * The element owns a shadow root that holds the skin template, with a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 */
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
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-thumb';
import markup from './template.html?raw';

import styles from '../skin.css?inline';

const TAG_NAME = 'winamp-skin';

/* The host is a plain box; everything visual lives on `.ps-winamp` inside, so this never needs editing per skin. */
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
 * `<winamp-skin>`: the Winamp theme around a `<video>`, inside a Video.js `<video-player>`.
 *
 * @example
 *   ```html
 *   <video-player>
 *     <winamp-skin>
 *       <video src="video.mp4"></video>
 *       <img slot="poster" src="poster.jpg" alt="" />
 *     </winamp-skin>
 *   </video-player>
 *   ```;
 */
export class WinampSkinElement extends BaseElement {
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
  customElements.define(TAG_NAME, WinampSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: WinampSkinElement;
  }
}
