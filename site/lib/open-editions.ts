import demuxed2022Live from '@player.style/demuxed-2022-live/open/skin.html?open';
import demuxed2022 from '@player.style/demuxed-2022/open/skin.html?open';
import essentialsLive from '@player.style/essentials-live/open/skin.html?open';
import essentials from '@player.style/essentials/open/skin.html?open';
import halloween from '@player.style/halloween/open/skin.html?open';
import instaplay from '@player.style/instaplay/open/skin.html?open';
import microvideoLive from '@player.style/microvideo-live/open/skin.html?open';
import microvideo from '@player.style/microvideo/open/skin.html?open';
import notflix from '@player.style/notflix/open/skin.html?open';
import reelplay from '@player.style/reelplay/open/skin.html?open';
import sutroAudio from '@player.style/sutro-audio/open/skin.html?open';
import sutro from '@player.style/sutro/open/skin.html?open';
import tailwindAudio from '@player.style/tailwind-audio/open/skin.html?open';
import vimeonova from '@player.style/vimeonova/open/skin.html?open';
import winamp from '@player.style/winamp/open/skin.html?open';
import xMasLive from '@player.style/x-mas-live/open/skin.html?open';
import xMas from '@player.style/x-mas/open/skin.html?open';
import yt from '@player.style/yt/open/skin.html?open';

import { getThirdPartyPackage, type ThirdPartySkin, type UseCase } from './skins';

export interface OpenEditionFile {
  name: string;
  code: string;
}

/** The order the file switcher shows the open edition in: markup first, then what it needs, then the React copy. */
const FILE_ORDER = ['skin.html', 'skin.css', 'register.ts', 'Skin.tsx', 'README.md'];

/**
 * Every package's open files, read from `@player.style/<name>/open/*` at build time by `lib/build/open-edition-loader`
 * and keyed by package basename: a skin's live video package, `@player.style/<name>-live`, registers as `<name>-live`.
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
  'microvideo-live': microvideoLive,
  reelplay,
  'demuxed-2022': demuxed2022,
  'demuxed-2022-live': demuxed2022Live,
  halloween,
  'x-mas': xMas,
  'x-mas-live': xMasLive,
  winamp,
  'sutro-audio': sutroAudio,
  'tailwind-audio': tailwindAudio,
};

export function hasOpenEdition(skin: ThirdPartySkin, useCase: UseCase): boolean {
  return getThirdPartyPackage(skin, useCase).name in editions;
}

/** The open files of the package serving the use case, in display order, or an error naming the missing registration. */
export function getOpenEditionFiles(skin: ThirdPartySkin, useCase: UseCase): OpenEditionFile[] {
  const { name, package: pkg } = getThirdPartyPackage(skin, useCase);
  const files = editions[name];
  if (!files) {
    throw new Error(
      `No open files registered for "${name}": import "${pkg}/open/skin.html?open" in site/lib/open-editions.ts once its build exists.`
    );
  }

  const known = FILE_ORDER.filter((name) => name in files);
  const rest = Object.keys(files).filter((name) => !FILE_ORDER.includes(name));

  return [...known, ...rest].map((name) => ({ name, code: files[name]! }));
}
