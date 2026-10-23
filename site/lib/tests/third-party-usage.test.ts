import { describe, expect, it } from 'vite-plus/test';

import { DEMO_AUDIO, DEMO_LIVE_HLS, DEMO_PORTRAIT_VIDEO, DEMO_VIDEO } from '../demo-media';
import { isThirdPartySkin, skins, type ThirdPartySkin, type UseCase } from '../skins';
import {
  getDemoSource,
  getThirdPartyInstallCommand,
  getThirdPartyMediaOptions,
  getThirdPartyNames,
  getThirdPartySnippets,
  getUseCaseHref,
  getUseCaseOptions,
  isFramework,
  resolveThirdPartyRenderer,
  type UsageSelection,
} from '../third-party-usage';

const skin: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'x-mas',
  name: 'x-mas',
  useCases: ['video', 'live-video'],
  title: 'X-mas',
  description: 'Festive.',
  author: { name: 'Someone' },
  builds: { video: ['react', 'html'], 'live-video': ['react', 'html'] },
};

const audio: ThirdPartySkin = {
  ...skin,
  slug: 'sutro-audio',
  name: 'sutro-audio',
  useCases: ['audio'],
  builds: { audio: ['react', 'html'] },
};

const defaults: UsageSelection = { framework: 'html', renderer: 'html5-video' };

function code(target: ThirdPartySkin, useCase: UseCase, selection: Partial<UsageSelection>): string {
  return getThirdPartySnippets(target, useCase, { ...defaults, ...selection })
    .flatMap((block) => block.files)
    .map((file) => `// ${file.name}\n${file.code}`)
    .join('\n\n');
}

describe('getThirdPartyMediaOptions', () => {
  it('mirrors the Video.js renderer list for the skin’s preset', () => {
    expect(getThirdPartyMediaOptions(skin, 'video').map((option) => option.label)).toEqual([
      'Video file',
      'HLS',
      'DASH',
      'Mux',
      'Vimeo',
      'YouTube',
      'Cloudflare Stream',
      'TikTok',
      'Twitch',
    ]);
    expect(getThirdPartyMediaOptions(audio, 'audio').map((option) => option.label)).toEqual([
      'Audio file',
      'Mux',
      'Spotify',
    ]);
    expect(getThirdPartyMediaOptions(skin, 'live-video').map((option) => option.label)).toEqual(['HLS', 'Mux']);
  });
});

describe('resolveThirdPartyRenderer', () => {
  it('falls back to the preset’s first option for unknown or foreign media', () => {
    expect(resolveThirdPartyRenderer(skin, 'video', 'youtube')).toBe('youtube');
    expect(resolveThirdPartyRenderer(skin, 'video', 'spotify')).toBe('html5-video');
    expect(resolveThirdPartyRenderer(skin, 'live-video', undefined)).toBe('hls');
    expect(resolveThirdPartyRenderer(audio, 'audio', 'html5-video')).toBe('html5-audio');
  });
});

describe('getUseCaseOptions', () => {
  it('labels each use case the skin covers as the gallery filter does', () => {
    expect(getUseCaseOptions(skin)).toEqual([
      { id: 'video', label: 'Video' },
      { id: 'live-video', label: 'Live Video' },
    ]);
    expect(getUseCaseOptions(audio)).toEqual([{ id: 'audio', label: 'Audio' }]);
  });
});

describe('getUseCaseHref', () => {
  it('switches the use case, leaving the default out of the URL and keeping the other picks', () => {
    expect(getUseCaseHref(skin, 'live-video', { framework: 'react', accent: 'f5c518' })).toBe(
      '/skins/x-mas?framework=react&accent=f5c518&use-case=live-video'
    );
    expect(getUseCaseHref(skin, 'video', { 'use-case': 'live-video', framework: 'vue' })).toBe(
      '/skins/x-mas?framework=vue'
    );
  });

  it('keeps a media choice both presets offer and drops one the target preset lacks or defaults to', () => {
    expect(getUseCaseHref(skin, 'live-video', { media: 'mux-video' })).toBe(
      '/skins/x-mas?media=mux-video&use-case=live-video'
    );
    expect(getUseCaseHref(skin, 'live-video', { media: 'dash' })).toBe('/skins/x-mas?use-case=live-video');
    expect(getUseCaseHref(skin, 'live-video', { media: 'hls' })).toBe('/skins/x-mas?use-case=live-video');
    expect(getUseCaseHref(skin, 'video', { media: 'hls', 'use-case': 'live-video' })).toBe('/skins/x-mas?media=hls');
  });
});

describe('isFramework', () => {
  it('accepts the four frameworks and nothing else', () => {
    expect(['html', 'react', 'vue', 'svelte'].every(isFramework)).toBe(true);
    expect(isFramework('cdn')).toBe(false);
    expect(isFramework('shadcn')).toBe(false);
  });
});

describe('getThirdPartyNames', () => {
  it('derives the component from the name and hosts it on the preset’s player', () => {
    expect(getThirdPartyNames(skin, 'video')).toEqual({
      reactComponent: 'VideoSkin',
      wrapperComponent: 'XMasPlayer',
      player: {
        tag: 'video-player',
        component: 'VideoPlayer',
        htmlEntry: '@videojs/html/video/player',
        reactEntry: '@videojs/react/video',
      },
    });
  });

  it('names live video after the -live registry item and hosts it on the live video player', () => {
    expect(getThirdPartyNames(skin, 'live-video')).toMatchObject({
      reactComponent: 'LiveVideoSkin',
      wrapperComponent: 'XMasLivePlayer',
      player: { tag: 'live-video-player', component: 'LiveVideoPlayer', reactEntry: '@videojs/react/live-video' },
    });
  });
});

describe('getDemoSource', () => {
  it('plays the classic asset, the portrait one for mobile-first skins, and the live stream on live presets', () => {
    expect(getDemoSource(skin, 'video', 'html5-video')).toBe(DEMO_VIDEO.mp4);
    expect(getDemoSource(skin, 'video', 'mux-video')).toBe(DEMO_VIDEO.hls);
    expect(getDemoSource({ ...skin, preview: { portrait: true } }, 'video', 'hls')).toBe(DEMO_PORTRAIT_VIDEO.hls);
    expect(getDemoSource(audio, 'audio', 'html5-audio')).toBe(DEMO_AUDIO);
    expect(getDemoSource(skin, 'live-video', 'hls')).toBe(DEMO_LIVE_HLS);
    expect(getDemoSource(skin, 'live-video', 'mux-video')).toBe(DEMO_LIVE_HLS);
  });
});

describe('getThirdPartyInstallCommand', () => {
  it('installs only the media packages, since the registry item brings the Video.js package', () => {
    expect(getThirdPartyInstallCommand(defaults)).toBeUndefined();
    expect(getThirdPartyInstallCommand({ ...defaults, framework: 'react' })).toBeUndefined();
    expect(getThirdPartyInstallCommand({ ...defaults, renderer: 'hls' })).toBe('npm install @videojs/hlsjs-video');
    expect(getThirdPartyInstallCommand({ ...defaults, renderer: 'mux-video' })).toBe(
      'npm install @videojs/mux-video @videojs/mux-data'
    );
  });
});

describe('getThirdPartySnippets', () => {
  it('pastes the installed markup inside the player for HTML, with the imports in src/player.ts', () => {
    const html = getThirdPartySnippets(skin, 'video', { ...defaults, accent: '112233' });
    const [markup, player] = html[0]!.files;

    expect(html[0]!.files.map((file) => file.name)).toEqual(['index.html', 'src/player.ts']);
    expect(markup!.code).toContain(
      `<video-player poster="${DEMO_VIDEO.poster}" style="--media-accent-color: #112233">`
    );
    expect(markup!.code).toContain('<!-- Paste components/skins/x-mas/video/skin.html here');
    expect(markup!.code).toContain(`<video src="${DEMO_VIDEO.mp4}" playsinline></video>`);
    expect(markup!.code).toContain('<script type="module" src="/src/player.ts"></script>');
    expect(player!.code).toBe(
      ["import '@videojs/html/video/player';", "import './components/skins/x-mas/video/skin';"].join('\n')
    );
    expect(code(skin, 'video', {})).not.toContain('style=');
  });

  it('follows the Video.js codegen for each media: element, import, adapter, and Mux Data', () => {
    const hls = code(skin, 'video', { renderer: 'hls' });
    expect(hls).toContain("import '@videojs/html/media/hlsjs-video';");
    expect(hls).toContain(`<hlsjs-video src="${DEMO_VIDEO.hls}" playsinline></hlsjs-video>`);

    const mux = code(skin, 'video', { renderer: 'mux-video' });
    expect(mux).toContain("import '@videojs/html/extensions/mux-data';");
    expect(mux).toContain('<mux-data></mux-data>');

    const youtube = code(skin, 'video', { renderer: 'youtube' });
    expect(youtube).toContain('<youtube-video src="https://www.youtube.com/watch?v=aqz-KE-bpKQ"></youtube-video>');
    expect(youtube).not.toContain('playsinline');
    expect(youtube).not.toContain('poster=');
  });

  it('imports the installed React component and stylesheet, and the media component from its entry', () => {
    const react = code(skin, 'video', { framework: 'react' });
    expect(react).toContain("import { VideoPlayer, Video } from '@videojs/react/video';");
    expect(react).toContain("import { VideoSkin } from './components/skins/x-mas/video/skin';");
    expect(react).not.toContain('.css');
    expect(react).toContain(`<VideoPlayer poster="${DEMO_VIDEO.poster}">`);
    expect(react).toContain(`<Video src="${DEMO_VIDEO.mp4}" playsInline />`);
    expect(react).toContain('<VideoSkin>');
    expect(code(skin, 'video', { framework: 'react', accent: 'f5c518' })).toContain(
      "<VideoSkin style={{ '--media-accent-color': '#f5c518' }}>"
    );

    const mux = code(skin, 'video', { framework: 'react', renderer: 'mux-video' });
    expect(mux).toContain("import { VideoPlayer } from '@videojs/react/video';");
    expect(mux).toContain("import { MuxVideo } from '@videojs/react/media/mux-video';");
    expect(mux).toContain("import { MuxData } from '@videojs/react/extensions/mux-data';");
    expect(mux).toContain('<MuxData />');
  });

  it('renders the installed markup through v-html in Vue, whose renderer leaves <template> contents empty', () => {
    const vue = code(skin, 'video', { framework: 'vue', accent: '112233' });
    expect(vue).toContain('// vite.config.ts');
    expect(vue).toContain('// nuxt.config.ts');
    expect(vue).toContain("const videoJsElements = new Set(['video-player']);");
    expect(vue).toContain('// components/XMasPlayer.vue');
    expect(vue).toContain("import './skins/x-mas/video/skin';");
    expect(vue).toContain("import skin from './skins/x-mas/video/skin.html?raw';");
    expect(vue).toContain("'<!-- Add a compatible media component here. -->',");
    expect(vue).toContain("`<video src=\"${props.src.replaceAll('\"', '&quot;')}\" playsinline></video>`");
    expect(vue).toContain('<video-player v-html="markup" style="--media-accent-color: #112233"></video-player>');
    expect(vue).toContain(`<XMasPlayer src="${DEMO_VIDEO.mp4}" />`);

    const mux = code(skin, 'video', { framework: 'vue', renderer: 'mux-video' });
    expect(mux).toContain("import '@videojs/html/media/mux-video';");
    expect(mux).toContain("import '@videojs/html/extensions/mux-data';");
    expect(mux).toContain('playsinline></mux-video><mux-data></mux-data>`');
  });

  it('never names the Vue component after its own player tag, which Vue would resolve to the component', () => {
    for (const useCase of ['video', 'live-video'] as const) {
      const vue = code(skin, useCase, { framework: 'vue', renderer: 'hls' });
      const player = getThirdPartyNames(skin, useCase).player.component;

      expect(vue).not.toContain(`${player}.vue`);
    }
  });

  it('pastes the installed markup in Svelte, importing the files relative to lib/', () => {
    const svelte = code(skin, 'video', { framework: 'svelte' });
    expect(svelte).not.toContain('isCustomElement');
    expect(svelte).toContain('// lib/XMasPlayer.svelte');
    expect(svelte).toContain('let { src }: { src: string } = $props();');
    expect(svelte).toContain("import '../components/skins/x-mas/video/skin';");
    expect(svelte).toContain('<!-- Paste components/skins/x-mas/video/skin.html here');
    expect(svelte).toContain('<video src={src} playsinline></video>');
    expect(svelte).toContain("import XMasPlayer from '$lib/XMasPlayer.svelte';");
    expect(svelte).toContain("import XMasPlayer from './lib/XMasPlayer.svelte';");
  });

  it('writes every snippet in a language the highlighter loads', () => {
    const langs = new Set(
      (['html', 'react', 'vue', 'svelte'] as const).flatMap((framework) =>
        getThirdPartySnippets(skin, 'video', { ...defaults, framework }).flatMap((block) =>
          block.files.map((file) => file.lang)
        )
      )
    );

    expect([...langs].sort()).toEqual(['html', 'svelte', 'ts', 'tsx', 'vue']);
  });

  it('uses the audio player and media for audio skins', () => {
    const html = code(audio, 'audio', { renderer: 'html5-audio' });
    expect(html).toContain("import '@videojs/html/audio/player';");
    expect(html).toContain(`<audio-player>\n  <!-- Paste components/skins/sutro-audio/audio/skin.html here`);
    expect(html).toContain(`<audio src="${DEMO_AUDIO}"></audio>`);

    const react = code(audio, 'audio', { framework: 'react', renderer: 'spotify' });
    expect(react).toContain("import { AudioPlayer } from '@videojs/react/audio';");
    expect(react).toContain("import { SpotifyAudio } from '@videojs/react/media/spotify-audio';");
    expect(react).toContain('<AudioSkin>');
    expect(react).not.toContain('VideoPlayer');
  });

  it('hosts live video on the live video player with the live preset’s files', () => {
    const html = code(skin, 'live-video', { renderer: 'hls' });
    expect(html).toContain("import '@videojs/html/live-video/player';");
    expect(html).toContain("import './components/skins/x-mas/live-video/skin';");
    expect(html).toContain(`<hlsjs-video src="${DEMO_LIVE_HLS}" playsinline>`);

    const react = code(skin, 'live-video', { framework: 'react', renderer: 'mux-video' });
    expect(react).toContain("import { LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(react).toContain("import { LiveVideoSkin } from './components/skins/x-mas/live-video/skin';");
    expect(react).toContain('<LiveVideoSkin>');
  });

  it('generates every combination for every use case of every listed third-party skin without throwing', () => {
    // The fixture stands in for a skin with a live video preset.
    for (const listed of [...skins.filter(isThirdPartySkin), skin]) {
      for (const useCase of listed.useCases) {
        for (const framework of ['html', 'react', 'vue', 'svelte'] as const) {
          for (const option of getThirdPartyMediaOptions(listed, useCase)) {
            expect(code(listed, useCase, { framework, renderer: option.id })).toMatch(/-player|Player/);
          }
        }
      }
    }
  });

  it('throws for a use case the skin does not cover', () => {
    expect(() => code(audio, 'live-video', {})).toThrow(/no live-video build/);
  });
});
