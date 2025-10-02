/*
<{{{element_name}}}>
  <video
    slot="media"
    src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/high.mp4"
  ></video>
</{{{element_name}}}>
*/

import 'media-chrome';
import { globalThis } from 'media-chrome/dist/utils/server-safe-globals.js';
import { MediaThemeElement } from 'media-chrome/dist/media-theme-element.js';
import 'media-chrome/dist/menu/index.js';

const template = globalThis.document?.createElement?.('template');
if (template) {
  template.innerHTML = String.raw/*html*/`
{{{theme_template}}}
  `;
}

class ___ClassName___ extends MediaThemeElement {
  static template = template;
}

if (globalThis.customElements && !globalThis.customElements.get('{{{element_name}}}')) {
  globalThis.customElements.define('{{{element_name}}}', ___ClassName___);
}

export default ___ClassName___;
