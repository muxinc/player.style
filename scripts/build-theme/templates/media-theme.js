/*
<{{{element_name}}}>
  <video
    slot="media"
    src="https://stream.mux.com/clGdHA024AM9yU9fueA8Kr601LNt02oVfHMVGceXtQO8DI/high.mp4"
  ></video>
</{{{element_name}}}>
*/

import "media-chrome";
import { globalThis } from "media-chrome/dist/utils/server-safe-globals.js";
import { MediaThemeElement } from "media-chrome/dist/media-theme-element.js";

const template = globalThis.document?.createElement?.("template");
if (template) {
  template.innerHTML = /*html*/ `
{{{theme_template}}}
  `;
}

class ___ClassName___ extends MediaThemeElement {
  static template = template;
}

if (
  globalThis.customElements &&
  !globalThis.customElements.get("{{{element_name}}}")
) {
  globalThis.customElements.define("{{{element_name}}}", ___ClassName___);
}

export default ___ClassName___;
