import type { ComponentType, CSSProperties, ReactNode } from 'react';

export type Preset = 'video' | 'audio' | 'live-video';

export interface SkinProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  byline?: ReactNode;
}

export interface SkinPackage {
  /** The package basename: `@player.style/<name>`, `<name>-skin`. */
  name: string;
  title: string;
  preset: Preset;
  /** Draws the media's title and a byline. */
  metadata?: boolean;
  /** Mobile-first, so it plays the portrait demo asset. */
  portrait?: boolean;
  /** Draws at its own size rather than filling a 16:9 box. */
  fixedSize?: boolean;
  /** The React component, with the package's `skin.css` on the page. */
  react: () => Promise<ComponentType<SkinProps>>;
  /** The HTML element: defines `<name>-skin`, which adopts its own stylesheet. */
  html: () => Promise<unknown>;
}

/** Waits for the component module and its stylesheet together, so the skin never paints unstyled. */
function withCss<M>(module: Promise<M>, css: Promise<unknown>, pick: (module: M) => ComponentType<SkinProps>) {
  return Promise.all([module, css]).then(([loaded]) => pick(loaded));
}

// Every import is a literal, so the build resolves each package's `./react`, `./html` and `./skin.css` exports.
export const SKINS: SkinPackage[] = [
  {
    name: 'yt',
    title: 'YT',
    preset: 'video',
    react: () => withCss(import('@player.style/yt/react'), import('@player.style/yt/skin.css'), (m) => m.YtSkin),
    html: () => import('@player.style/yt/html'),
  },
  {
    name: 'sutro',
    title: 'Sutro',
    preset: 'video',
    react: () =>
      withCss(import('@player.style/sutro/react'), import('@player.style/sutro/skin.css'), (m) => m.SutroSkin),
    html: () => import('@player.style/sutro/html'),
  },
  {
    name: 'essentials',
    title: 'Essentials',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/essentials/react'),
        import('@player.style/essentials/skin.css'),
        (m) => m.EssentialsSkin
      ),
    html: () => import('@player.style/essentials/html'),
  },
  {
    name: 'essentials-live',
    title: 'Essentials Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/essentials-live/react'),
        import('@player.style/essentials-live/skin.css'),
        (m) => m.EssentialsLiveSkin
      ),
    html: () => import('@player.style/essentials-live/html'),
  },
  {
    name: 'notflix',
    title: 'Notflix',
    preset: 'video',
    react: () =>
      withCss(import('@player.style/notflix/react'), import('@player.style/notflix/skin.css'), (m) => m.NotflixSkin),
    html: () => import('@player.style/notflix/html'),
  },
  {
    name: 'vimeonova',
    title: 'Vimeonova',
    preset: 'video',
    metadata: true,
    react: () =>
      withCss(
        import('@player.style/vimeonova/react'),
        import('@player.style/vimeonova/skin.css'),
        (m) => m.VimeonovaSkin
      ),
    html: () => import('@player.style/vimeonova/html'),
  },
  {
    name: 'instaplay',
    title: 'Instaplay',
    preset: 'video',
    portrait: true,
    react: () =>
      withCss(
        import('@player.style/instaplay/react'),
        import('@player.style/instaplay/skin.css'),
        (m) => m.InstaplaySkin
      ),
    html: () => import('@player.style/instaplay/html'),
  },
  {
    name: 'microvideo',
    title: 'Microvideo',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/microvideo/react'),
        import('@player.style/microvideo/skin.css'),
        (m) => m.MicrovideoSkin
      ),
    html: () => import('@player.style/microvideo/html'),
  },
  {
    name: 'microvideo-live',
    title: 'Microvideo Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/microvideo-live/react'),
        import('@player.style/microvideo-live/skin.css'),
        (m) => m.MicrovideoLiveSkin
      ),
    html: () => import('@player.style/microvideo-live/html'),
  },
  {
    name: 'reelplay',
    title: 'Reelplay',
    preset: 'video',
    react: () =>
      withCss(import('@player.style/reelplay/react'), import('@player.style/reelplay/skin.css'), (m) => m.ReelplaySkin),
    html: () => import('@player.style/reelplay/html'),
  },
  {
    name: 'demuxed-2022',
    title: 'Demuxed 2022',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/demuxed-2022/react'),
        import('@player.style/demuxed-2022/skin.css'),
        (m) => m.Demuxed2022Skin
      ),
    html: () => import('@player.style/demuxed-2022/html'),
  },
  {
    name: 'demuxed-2022-live',
    title: 'Demuxed 2022 Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/demuxed-2022-live/react'),
        import('@player.style/demuxed-2022-live/skin.css'),
        (m) => m.Demuxed2022LiveSkin
      ),
    html: () => import('@player.style/demuxed-2022-live/html'),
  },
  {
    name: 'halloween',
    title: 'Halloween',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/halloween/react'),
        import('@player.style/halloween/skin.css'),
        (m) => m.HalloweenSkin
      ),
    html: () => import('@player.style/halloween/html'),
  },
  {
    name: 'x-mas',
    title: 'X-mas',
    preset: 'video',
    react: () =>
      withCss(import('@player.style/x-mas/react'), import('@player.style/x-mas/skin.css'), (m) => m.XMasSkin),
    html: () => import('@player.style/x-mas/html'),
  },
  {
    name: 'x-mas-live',
    title: 'X-mas Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/x-mas-live/react'),
        import('@player.style/x-mas-live/skin.css'),
        (m) => m.XMasLiveSkin
      ),
    html: () => import('@player.style/x-mas-live/html'),
  },
  {
    name: 'winamp',
    title: 'Winamp',
    preset: 'video',
    fixedSize: true,
    react: () =>
      withCss(import('@player.style/winamp/react'), import('@player.style/winamp/skin.css'), (m) => m.WinampSkin),
    html: () => import('@player.style/winamp/html'),
  },
  {
    name: 'videojs-1',
    title: 'Video.js 1',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/videojs-1/react'),
        import('@player.style/videojs-1/skin.css'),
        (m) => m.Videojs1Skin
      ),
    html: () => import('@player.style/videojs-1/html'),
  },
  {
    name: 'videojs-3',
    title: 'Video.js 3',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/videojs-3/react'),
        import('@player.style/videojs-3/skin.css'),
        (m) => m.Videojs3Skin
      ),
    html: () => import('@player.style/videojs-3/html'),
  },
  {
    name: 'videojs-4',
    title: 'Video.js 4',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/videojs-4/react'),
        import('@player.style/videojs-4/skin.css'),
        (m) => m.Videojs4Skin
      ),
    html: () => import('@player.style/videojs-4/html'),
  },
  {
    name: 'videojs-4-live',
    title: 'Video.js 4 Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/videojs-4-live/react'),
        import('@player.style/videojs-4-live/skin.css'),
        (m) => m.Videojs4LiveSkin
      ),
    html: () => import('@player.style/videojs-4-live/html'),
  },
  {
    name: 'videojs-8',
    title: 'Video.js 8',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/videojs-8/react'),
        import('@player.style/videojs-8/skin.css'),
        (m) => m.Videojs8Skin
      ),
    html: () => import('@player.style/videojs-8/html'),
  },
  {
    name: 'videojs-8-live',
    title: 'Video.js 8 Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/videojs-8-live/react'),
        import('@player.style/videojs-8-live/skin.css'),
        (m) => m.Videojs8LiveSkin
      ),
    html: () => import('@player.style/videojs-8-live/html'),
  },
  {
    name: 'plyr',
    title: 'Plyr',
    preset: 'video',
    react: () => withCss(import('@player.style/plyr/react'), import('@player.style/plyr/skin.css'), (m) => m.PlyrSkin),
    html: () => import('@player.style/plyr/html'),
  },
  {
    name: 'vidstack',
    title: 'Vidstack',
    preset: 'video',
    react: () =>
      withCss(import('@player.style/vidstack/react'), import('@player.style/vidstack/skin.css'), (m) => m.VidstackSkin),
    html: () => import('@player.style/vidstack/html'),
  },
  {
    name: 'vidstack-live',
    title: 'Vidstack Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/vidstack-live/react'),
        import('@player.style/vidstack-live/skin.css'),
        (m) => m.VidstackLiveSkin
      ),
    html: () => import('@player.style/vidstack-live/html'),
  },
  {
    name: 'media-chrome',
    title: 'Media Chrome',
    preset: 'video',
    react: () =>
      withCss(
        import('@player.style/media-chrome/react'),
        import('@player.style/media-chrome/skin.css'),
        (m) => m.MediaChromeSkin
      ),
    html: () => import('@player.style/media-chrome/html'),
  },
  {
    name: 'media-chrome-live',
    title: 'Media Chrome Live',
    preset: 'live-video',
    react: () =>
      withCss(
        import('@player.style/media-chrome-live/react'),
        import('@player.style/media-chrome-live/skin.css'),
        (m) => m.MediaChromeLiveSkin
      ),
    html: () => import('@player.style/media-chrome-live/html'),
  },
  {
    name: 'sutro-audio',
    title: 'Sutro Audio',
    preset: 'audio',
    metadata: true,
    react: () =>
      withCss(
        import('@player.style/sutro-audio/react'),
        import('@player.style/sutro-audio/skin.css'),
        (m) => m.SutroAudioSkin
      ),
    html: () => import('@player.style/sutro-audio/html'),
  },
  {
    name: 'tailwind-audio',
    title: 'Tailwind Audio',
    preset: 'audio',
    react: () =>
      withCss(
        import('@player.style/tailwind-audio/react'),
        import('@player.style/tailwind-audio/skin.css'),
        (m) => m.TailwindAudioSkin
      ),
    html: () => import('@player.style/tailwind-audio/html'),
  },
];
