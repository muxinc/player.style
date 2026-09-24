import demuxed2022Live from '@player.style/demuxed-2022-live/open/skin.html?open';
import demuxed2022 from '@player.style/demuxed-2022/open/skin.html?open';
import essentialsLive from '@player.style/essentials-live/open/skin.html?open';
import essentials from '@player.style/essentials/open/skin.html?open';
import halloween from '@player.style/halloween/open/skin.html?open';
import instaplay from '@player.style/instaplay/open/skin.html?open';
import microvideo from '@player.style/microvideo/open/skin.html?open';
import notflix from '@player.style/notflix/open/skin.html?open';
import reelplay from '@player.style/reelplay/open/skin.html?open';
import sutroAudio from '@player.style/sutro-audio/open/skin.html?open';
import sutro from '@player.style/sutro/open/skin.html?open';
import tailwindAudio from '@player.style/tailwind-audio/open/skin.html?open';
import vimeonova from '@player.style/vimeonova/open/skin.html?open';
import winamp from '@player.style/winamp/open/skin.html?open';
import xMas from '@player.style/x-mas/open/skin.html?open';
import yt from '@player.style/yt/open/skin.html?open';

import type { ThirdPartySkin } from './skins';

export interface OpenEditionFile {
  name: string;
  code: string;
}

/** The order the file switcher shows the open edition in: markup first, then what it needs, then the React copy. */
const FILE_ORDER = ['skin.html', 'skin.css', 'register.ts', 'Skin.tsx', 'README.md'];

/**
 * Every skin's open edition, read from `@player.style/<name>/open/*` at build time by `lib/build/open-edition-loader`.
 * A live edition is its own package, `@player.style/<name>-live`, registered under the live card's slug once it builds.
 */
const editions: Record<string, Readonly<Record<string, string>>> = {
  yt,
  sutro,
  essentials,
  'essentials-live': essentialsLive,
  notflix,
  vimeonova,
  instaplay,
  microvideo,
  reelplay,
  'demuxed-2022': demuxed2022,
  'demuxed-2022-live': demuxed2022Live,
  halloween,
  'x-mas': xMas,
  winamp,
  'sutro-audio': sutroAudio,
  'tailwind-audio': tailwindAudio,
};

export function hasOpenEdition(skin: ThirdPartySkin): boolean {
  return skin.slug in editions;
}

/** The open edition's files in display order, or an error naming the missing registration. */
export function getOpenEditionFiles(skin: ThirdPartySkin): OpenEditionFile[] {
  const files = editions[skin.slug];
  if (!files) {
    throw new Error(
      `No open edition registered for "${skin.slug}": import "${skin.package}/open/skin.html?open" in site/lib/open-editions.ts once its build exists.`
    );
  }

  const known = FILE_ORDER.filter((name) => name in files);
  const rest = Object.keys(files).filter((name) => !FILE_ORDER.includes(name));

  return [...known, ...rest].map((name) => ({ name, code: files[name]! }));
}
