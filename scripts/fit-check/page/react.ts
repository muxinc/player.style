/*
 * The page for a skin's React component: the component inside the preset's player with the media and a captions
 * track as children, the poster and title from the player, the byline as a prop where the component takes one, and
 * the package's `skin.css` linked as a consumer imports it.
 */
import { Audio, AudioPlayer } from '@videojs/react/audio';
import { LiveVideoPlayer } from '@videojs/react/live-video';
import { Video, VideoPlayer } from '@videojs/react/video';
import { type ComponentType, createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { react } from 'virtual:fit-check/skins';

import { install, MEDIA } from './runtime.ts';

const PLAYERS = { video: VideoPlayer, audio: AudioPlayer, 'live-video': LiveVideoPlayer };

install(async ({ skin, preset, byline }) => {
  const load = react[skin];
  if (!load) throw new Error(`No built React entry for ${skin}.`);

  const module = (await load()) as Record<string, unknown>;
  const Skin = Object.entries(module).find(
    ([name, value]) => /Skin$/.test(name) && typeof value === 'function'
  )?.[1] as ComponentType<{ byline?: string; children?: ReactNode }> | undefined;
  if (!Skin) throw new Error(`dist/react.js exports no <Name>Skin component.`);

  const link = document.createElement('link');
  const loaded = new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = () => reject(new Error(`skins/${skin}/dist/skin.css did not load.`));
  });

  link.rel = 'stylesheet';
  link.href = `/skins/${skin}/dist/skin.css`;
  document.head.append(link);
  await loaded;

  const track = createElement('track', { kind: 'captions', srcLang: 'en', label: 'English', src: MEDIA.captions });
  const media =
    preset === 'audio'
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
