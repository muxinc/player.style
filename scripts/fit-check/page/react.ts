/*
 * The page for a skin's React build: the preset's skin component inside the preset's player with the media and a
 * captions track as children, the poster and title from the player, and the byline as a prop where the skin shows
 * metadata. The module imports its own CSS.
 */
import { Audio, AudioPlayer } from '@videojs/react/audio';
import { LiveAudioPlayer } from '@videojs/react/live-audio';
import { LiveVideoPlayer } from '@videojs/react/live-video';
import { Video, VideoPlayer } from '@videojs/react/video';
import { type ComponentType, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { skins } from 'virtual:fit-check/skins';

import { install, MEDIA } from './runtime.ts';

const PLAYERS = {
  video: VideoPlayer,
  audio: AudioPlayer,
  'live-video': LiveVideoPlayer,
  'live-audio': LiveAudioPlayer,
};

/** `live-video` → `LiveVideoSkin`, the component a preset module exports. */
function skinComponent(preset: string): string {
  return `${preset.replace(/(^|-)([a-z])/g, (_match, _dash, letter: string) => letter.toUpperCase())}Skin`;
}

install(async ({ skin, preset, byline }) => {
  const load = skins[skin];
  if (!load) throw new Error(`No built module for ${skin}.`);

  const module = await load();
  const Skin = module[skinComponent(preset)] as ComponentType<{ byline?: string; children?: ReactNode }> | undefined;
  if (typeof Skin !== 'function') throw new Error(`${skin}: dist/${preset}.js exports no ${skinComponent(preset)}.`);

  const track = createElement('track', { kind: 'captions', srcLang: 'en', label: 'English', src: MEDIA.captions });
  const media = preset.endsWith('audio')
    ? createElement(Audio, { src: MEDIA.src, preload: 'auto' }, track)
    : createElement(Video, { src: MEDIA.src, preload: 'auto', playsInline: true }, track);
  const player = PLAYERS[preset] as ComponentType<{ title?: string; poster?: string; children?: ReactNode }>;

  createRoot(document.getElementById('root')!).render(
    createElement(
      player,
      { title: MEDIA.title, poster: MEDIA.poster },
      createElement(Skin, byline ? { byline: MEDIA.byline } : {}, media)
    )
  );
});
