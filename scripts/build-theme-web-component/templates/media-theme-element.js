/*
<media-theme-{{{theme_name}}}>
  <video
    slot="media"
    src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
  ></video>
</media-theme-{{{theme_name}}}>
*/

import 'media-chrome';
import { globalThis, document } from 'media-chrome/dist/utils/server-safe-globals.js';
import { MediaThemeElement } from 'media-chrome/dist/media-theme-element.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
{{{theme_template}}}
`;

class MediaTheme extends MediaThemeElement {
  static template = template;
}

if (!globalThis.customElements.get('media-theme-{{{theme_name}}}')) {
  globalThis.customElements.define(
    'media-theme-{{{theme_name}}}',
    MediaTheme
  );
}

export default MediaTheme;
