/*
 * Sutro Audio for Video.js 10, HTML element: registers `<sutro-audio-skin>`.
 *
 * The element owns a shadow root that holds the skin template around a default `<slot>` for the `<audio>` and the
 * `poster` (artwork) and `byline` slots. It sits inside an `<audio-player>` (`@videojs/html/audio/player`); the
 * Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 */
import '@videojs/html/ui/container';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/title';
import '@videojs/html/ui/playback-rate-button';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-value';
import markup from './template.html?raw';

import styles from '../skin.css?inline';

const TAG_NAME = 'sutro-audio-skin';

/* The host is a plain box; everything visual lives on `.ps-sutro-audio` inside, so this never needs editing per skin. */
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
 * `<sutro-audio-skin>`: the Sutro Audio theme around an `<audio>`, inside a Video.js `<audio-player>`.
 *
 * @example
 *   ```html
 *   <audio-player content-title="Episode 12">
 *     <sutro-audio-skin>
 *       <audio src="episode.mp3"></audio>
 *       <img slot="poster" src="artwork.jpg" alt="" />
 *       <span slot="byline">The Show</span>
 *     </sutro-audio-skin>
 *   </audio-player>
 *   ```;
 */
export class SutroAudioSkinElement extends BaseElement {
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
  customElements.define(TAG_NAME, SutroAudioSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: SutroAudioSkinElement;
  }
}
