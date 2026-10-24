/*
 * The page for a skin's HTML build: the preset's player with the skin's markup inside, the media (with a captions
 * track) where its placeholder comment is, and the poster and title on the player, as the registry item's docs say.
 */
import '@videojs/html/video/player';
import '@videojs/html/audio/player';
import '@videojs/html/live-video/player';
import '@videojs/html/live-audio/player';
import { MEDIA_PLACEHOLDER, presetModule } from 'build-skin/names';
import { skins } from 'virtual:fit-check/skins';

import { install, MEDIA } from './runtime.ts';

install(async ({ skin, preset }) => {
  const load = skins[skin];
  if (!load) throw new Error(`No built module for ${skin}.`);

  const { default: template } = await load();
  if (typeof template !== 'string') throw new Error(`${skin}: dist/${preset}.js does not default-export its markup.`);

  const { media: tag, playerTag } = presetModule(preset);
  const media = `<${tag} src="${MEDIA.src}" preload="auto" playsinline><track kind="captions" srclang="en" label="English" src="${MEDIA.captions}"></${tag}>`;
  const player = document.createElement(playerTag);

  player.setAttribute('poster', MEDIA.poster);
  player.setAttribute('content-title', MEDIA.title);
  player.innerHTML = template.replace(MEDIA_PLACEHOLDER, media);
  document.getElementById('root')!.append(player);
});
