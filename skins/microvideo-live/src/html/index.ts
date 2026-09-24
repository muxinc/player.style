/*
 * Microvideo for Video.js 10, live edition (HTML): registers `<microvideo-live-skin>` for the live-video preset.
 *
 * The element owns a shadow root that holds the live template around a default `<slot>` for the media and a named
 * `poster` slot. The Video.js UI elements it stamps are registered here through their `@videojs/html/ui/*` entries;
 * the shadow root, the stylesheet (shared with `@player.style/microvideo`) and the host variants (`controlbarplace`,
 * `controlbarvertical`) live in ../skin-element.ts.
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
import '@videojs/html/ui/live-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import { MicrovideoSkinBaseElement } from '../skin-element';
import markup from './template.html?raw';

const TAG_NAME = 'microvideo-live-skin';

const isBrowser = typeof HTMLElement !== 'undefined';

/**
 * `<microvideo-live-skin>`: the Microvideo theme's live edition around a `<video>`, inside a Video.js
 * `<live-video-player>`: a Live badge and the volume, captions, remote-playback and fullscreen controls, without a
 * scrubber. Takes the same `controlbarplace` / `controlbarvertical` host variants as `<microvideo-skin>` from
 * `@player.style/microvideo`.
 *
 * @example
 *   ```html
 *   <script type="module">
 *     import '@videojs/html/live-video/player';
 *     import '@player.style/microvideo-live';
 *   </script>
 *
 *   <live-video-player>
 *     <microvideo-live-skin>
 *       <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
 *     </microvideo-live-skin>
 *   </live-video-player>
 *   ```;
 */
export class MicrovideoLiveSkinElement extends MicrovideoSkinBaseElement {
  static readonly tagName = TAG_NAME;
  static override markup = markup;
}

if (isBrowser && !customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, MicrovideoLiveSkinElement);
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: MicrovideoLiveSkinElement;
  }
}
