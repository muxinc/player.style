import type { ComponentType, CSSProperties, ReactNode } from 'react';

import type { PaneKind } from './params';

export interface ReactSkinProps {
  children?: ReactNode;
  style?: CSSProperties;
}

export interface CompareSkin {
  /**
   * Which Video.js preset the ports sit in and which test media the panes play. Defaults to `'video'`. A
   * `'live-video'` entry is a skin's live edition: the original renders with `streamtype="live"`, the ports inside
   * `<live-video-player>` / `LiveVideoPlayer`.
   */
  kind?: PaneKind;
  /**
   * The player box, as a CSS `aspect-ratio` (`'9 / 16'`), set on each pane's skin element. A portrait ratio also
   * switches the default media to the portrait pattern. Unset, each skin sizes itself as it would on a page.
   */
  aspect?: string;
  /** The Media Chrome edition on npm, pinned so the reference does not drift, and its theme tag. */
  legacy: { pkg: string; version: string; tag: string };
  /** The Video.js 10 HTML edition's tag. */
  tag: string;
  /** Registers the HTML edition; imported from the skin's source so no build step sits between edits and the pane. */
  html: () => Promise<unknown>;
  react: () => Promise<{ Skin: ComponentType<ReactSkinProps> }>;
  css: () => Promise<unknown>;
}

/* Add a line per ported skin. The paths point at sources under `skins/*`, so `pnpm dev` picks edits up live. */
export const SKINS: Record<string, CompareSkin> = {
  microvideo: {
    legacy: { pkg: '@player.style/microvideo', version: '0.2.0', tag: 'media-theme-microvideo' },
    tag: 'microvideo-skin',
    html: () => import('../../../skins/microvideo/src/html/index.ts'),
    react: () => import('../../../skins/microvideo/src/react/index.tsx').then((m) => ({ Skin: m.MicrovideoSkin })),
    css: () => import('../../../skins/microvideo/src/skin.css'),
  },
  'microvideo-live': {
    kind: 'live-video',
    legacy: { pkg: '@player.style/microvideo', version: '0.2.0', tag: 'media-theme-microvideo' },
    tag: 'microvideo-live-skin',
    html: () => import('../../../skins/microvideo/src/live/html/index.ts'),
    react: () =>
      import('../../../skins/microvideo/src/live/react/index.tsx').then((m) => ({ Skin: m.MicrovideoLiveSkin })),
    css: () => import('../../../skins/microvideo/src/skin.css'),
  },
  instaplay: {
    aspect: '9 / 16',
    legacy: { pkg: '@player.style/instaplay', version: '0.1.2', tag: 'media-theme-instaplay' },
    tag: 'instaplay-skin',
    html: () => import('../../../skins/instaplay/src/html/index.ts'),
    react: () => import('../../../skins/instaplay/src/react/index.tsx').then((m) => ({ Skin: m.InstaplaySkin })),
    css: () => import('../../../skins/instaplay/src/skin.css'),
  },
  yt: {
    legacy: { pkg: '@player.style/yt', version: '0.2.1', tag: 'media-theme-yt' },
    tag: 'yt-skin',
    html: () => import('../../../skins/yt/src/html/index.ts'),
    react: () => import('../../../skins/yt/src/react/index.tsx').then((m) => ({ Skin: m.YtSkin })),
    css: () => import('../../../skins/yt/src/skin.css'),
  },
  // Scaffolded; the ports land here as placeholders until each skin is written.
  'demuxed-2022': {
    legacy: { pkg: '@player.style/demuxed-2022', version: '0.1.2', tag: 'media-theme-demuxed-2022' },
    tag: 'demuxed-2022-skin',
    html: () => import('../../../skins/demuxed-2022/src/html/index.ts'),
    react: () => import('../../../skins/demuxed-2022/src/react/index.tsx').then((m) => ({ Skin: m.Demuxed2022Skin })),
    css: () => import('../../../skins/demuxed-2022/src/skin.css'),
  },
  halloween: {
    legacy: { pkg: '@player.style/halloween', version: '0.1.2', tag: 'media-theme-halloween' },
    tag: 'halloween-skin',
    html: () => import('../../../skins/halloween/src/html/index.ts'),
    react: () => import('../../../skins/halloween/src/react/index.tsx').then((m) => ({ Skin: m.HalloweenSkin })),
    css: () => import('../../../skins/halloween/src/skin.css'),
  },
  // Renamed from the classic `minimal` theme; the Media Chrome edition keeps its old package name and tag.
  essentials: {
    legacy: { pkg: '@player.style/minimal', version: '0.2.1', tag: 'media-theme-minimal' },
    tag: 'essentials-skin',
    html: () => import('../../../skins/essentials/src/html/index.ts'),
    react: () => import('../../../skins/essentials/src/react/index.tsx').then((m) => ({ Skin: m.EssentialsSkin })),
    css: () => import('../../../skins/essentials/src/skin.css'),
  },
  notflix: {
    legacy: { pkg: '@player.style/notflix', version: '0.1.2', tag: 'media-theme-notflix' },
    tag: 'notflix-skin',
    html: () => import('../../../skins/notflix/src/html/index.ts'),
    react: () => import('../../../skins/notflix/src/react/index.tsx').then((m) => ({ Skin: m.NotflixSkin })),
    css: () => import('../../../skins/notflix/src/skin.css'),
  },
  reelplay: {
    legacy: { pkg: '@player.style/reelplay', version: '0.1.2', tag: 'media-theme-reelplay' },
    tag: 'reelplay-skin',
    html: () => import('../../../skins/reelplay/src/html/index.ts'),
    react: () => import('../../../skins/reelplay/src/react/index.tsx').then((m) => ({ Skin: m.ReelplaySkin })),
    css: () => import('../../../skins/reelplay/src/skin.css'),
  },
  sutro: {
    legacy: { pkg: '@player.style/sutro', version: '0.2.1', tag: 'media-theme-sutro' },
    tag: 'sutro-skin',
    html: () => import('../../../skins/sutro/src/html/index.ts'),
    react: () => import('../../../skins/sutro/src/react/index.tsx').then((m) => ({ Skin: m.SutroSkin })),
    css: () => import('../../../skins/sutro/src/skin.css'),
  },
  vimeonova: {
    legacy: { pkg: '@player.style/vimeonova', version: '0.1.2', tag: 'media-theme-vimeonova' },
    tag: 'vimeonova-skin',
    html: () => import('../../../skins/vimeonova/src/html/index.ts'),
    react: () => import('../../../skins/vimeonova/src/react/index.tsx').then((m) => ({ Skin: m.VimeonovaSkin })),
    css: () => import('../../../skins/vimeonova/src/skin.css'),
  },
  'x-mas': {
    legacy: { pkg: '@player.style/x-mas', version: '0.1.2', tag: 'media-theme-x-mas' },
    tag: 'x-mas-skin',
    html: () => import('../../../skins/x-mas/src/html/index.ts'),
    react: () => import('../../../skins/x-mas/src/react/index.tsx').then((m) => ({ Skin: m.XMasSkin })),
    css: () => import('../../../skins/x-mas/src/skin.css'),
  },
  winamp: {
    legacy: { pkg: '@player.style/winamp', version: '0.0.13', tag: 'media-theme-winamp' },
    tag: 'winamp-skin',
    html: () => import('../../../skins/winamp/src/html/index.ts'),
    react: () => import('../../../skins/winamp/src/react/index.tsx').then((m) => ({ Skin: m.WinampSkin })),
    css: () => import('../../../skins/winamp/src/skin.css'),
  },
  'sutro-audio': {
    kind: 'audio',
    legacy: { pkg: '@player.style/sutro-audio', version: '0.0.8', tag: 'media-theme-sutro-audio' },
    tag: 'sutro-audio-skin',
    html: () => import('../../../skins/sutro-audio/src/html/index.ts'),
    react: () => import('../../../skins/sutro-audio/src/react/index.tsx').then((m) => ({ Skin: m.SutroAudioSkin })),
    css: () => import('../../../skins/sutro-audio/src/skin.css'),
  },
  'tailwind-audio': {
    kind: 'audio',
    legacy: { pkg: '@player.style/tailwind-audio', version: '0.0.13', tag: 'media-theme-tailwind-audio' },
    tag: 'tailwind-audio-skin',
    html: () => import('../../../skins/tailwind-audio/src/html/index.ts'),
    react: () =>
      import('../../../skins/tailwind-audio/src/react/index.tsx').then((m) => ({ Skin: m.TailwindAudioSkin })),
    css: () => import('../../../skins/tailwind-audio/src/skin.css'),
  },
};

export function getSkin(name: string): CompareSkin {
  const skin = SKINS[name];
  if (!skin) throw new Error(`Unknown skin "${name}". Add it to apps/skin-compare/src/skins.ts.`);

  return skin;
}
