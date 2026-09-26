/*
 * The page for a skin's HTML element: `<name>-skin` inside the preset's player, with the media, a captions track, a
 * poster and (where the template has the slot) a byline slotted in, as a page using the package would write it.
 */
import '@videojs/html/video/player';
import '@videojs/html/audio/player';
import '@videojs/html/live-video/player';
import { html } from 'virtual:fit-check/skins';

import { install, MEDIA } from './runtime.ts';

install(async ({ skin, preset, byline }) => {
  const load = html[skin];
  if (!load) throw new Error(`No built HTML entry for ${skin}.`);

  await load();

  const tag = `${skin}-skin`;
  if (!customElements.get(tag)) throw new Error(`dist/html.js does not define <${tag}>.`);

  const player = document.createElement(`${preset}-player`);
  const element = document.createElement(tag);
  const media = document.createElement(preset === 'audio' ? 'audio' : 'video');
  const track = document.createElement('track');
  const poster = document.createElement('img');

  player.setAttribute('content-title', MEDIA.title);
  media.src = MEDIA.src;
  media.preload = 'auto';
  media.setAttribute('playsinline', '');
  Object.assign(track, { kind: 'captions', srclang: 'en', label: 'English', src: MEDIA.captions });
  media.append(track);
  Object.assign(poster, { slot: 'poster', src: MEDIA.poster, alt: '' });
  element.append(media, poster);

  if (byline) {
    const text = document.createElement('span');

    text.slot = 'byline';
    text.textContent = MEDIA.byline;
    element.append(text);
  }

  player.append(element);
  document.getElementById('root')!.append(player);
});
