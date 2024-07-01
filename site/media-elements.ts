const mediaElements = {
  video: {
    tag: 'video',
    src: 'https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4',
    package: undefined,
  },
  audio: {
    tag: 'audio',
    src: 'https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/low.mp4',
    package: undefined,
  },
  hls: {
    tag: 'hls-video',
    src: 'https://stream.mux.com/clGdHA024AM9yU9fueA8Kr601LNt02oVfHMVGceXtQO8DI.m3u8',
    package: {
      default: 'hls-video-element',
      react: 'hls-video-element/react',
    },
  },
  dash: {
    tag: 'dash-video',
    src: 'https://player.vimeo.com/external/648359100.mpd?s=a4419a2e2113cc24a87aef2f93ef69a8e4c8fb0c',
    package: {
      default: 'dash-video-element',
      react: 'dash-video-element/react',
    },
  },
  mux: {
    tag: 'mux-video',
    src: 'https://stream.mux.com/clGdHA024AM9yU9fueA8Kr601LNt02oVfHMVGceXtQO8DI.m3u8',
    package: {
      default: '@mux/mux-video',
      react: '@mux/mux-video-react',
    },
  },
  youtube: {
    tag: 'youtube-video',
    src: 'https://www.youtube.com/watch?v=uxsOYVWclA0',
    package: {
      default: 'youtube-video-element',
      react: 'youtube-video-element/react',
    },
  },
  vimeo: {
    tag: 'vimeo-video',
    src: 'https://vimeo.com/648359100',
    package: {
      default: 'vimeo-video-element',
      react: 'vimeo-video-element/react',
    },
  },
  wistia: {
    tag: 'wistia-video',
    src: 'https://wesleyluyten.wistia.com/medias/oifkgmxnkb',
    package: {
      default: 'wistia-video-element',
      react: 'wistia-video-element/react',
    },
  },
  cloudflare: {
    tag: 'cloudflare-video',
    src: 'https://watch.videodelivery.net/bfbd585059e33391d67b0f1d15fe6ea4',
    package: {
      default: 'cloudflare-video-element',
      react: 'cloudflare-video-element/react',
    },
  },
  jwplayer: {
    tag: 'jwplayer-video',
    src: 'https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html',
    package: {
      default: 'jwplayer-video-element',
      react: 'jwplayer-video-element/react',
    },
  },
} as const;

export default mediaElements;
