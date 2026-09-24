/*
 * Microvideo for Video.js 10, HTML edition: registers `<microvideo-skin>`.
 *
 * The element owns a shadow root that holds the skin template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries.
 * The shadow root, stylesheet and host variants (`controlbarplace`, `controlbarvertical`) live in ../skin-element.ts.
 * The live edition is its own package, `@player.style/microvideo-live`.
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
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import { MicrovideoSkinBaseElement } from '../skin-element';
import markup from './template.html?raw';

const TAG_NAME = 'microvideo-skin';

const isBrowser = typeof HTMLElement !== 'undefined';

/**
 * `<microvideo-skin>`: the Microvideo theme around a `<video>`, inside a Video.js `<video-player>`.
 *
 * Host variants: `controlbarplace` (a `place-self` value such as `center center` or `start end`, or `top` / `center` /
 * `bottom`; default `end center`) moves the control cluster, `controlbarvertical` stacks it in a column. Both are
 * also `controlBarPlace` / `controlBarVertical` properties.
 *
 * @example
 *   ```html
 *   <video-player>
 *     <microvideo-skin controlbarplace="center center">
 *       <video src="video.mp4"></video>
 *       <img slot="poster" src="poster.jpg" alt="" />
 *     </microvideo-skin>
 *   </video-player>
 *   ```;
 */
export class MicrovideoSkinElement extends MicrovideoSkinBaseElement {
  static readonly tagName = TAG_NAME;
  static override markup = markup;
}

if (isBrowser && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, MicrovideoSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: MicrovideoSkinElement;
  }
}
