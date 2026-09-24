import { describe, expect, it } from 'vite-plus/test';

import { DEMO_AUDIO, DEMO_LIVE_HLS, DEMO_PORTRAIT_VIDEO, DEMO_VIDEO } from '../demo-media';
import { getSkin, isThirdPartySkin, type ThirdPartySkin, type UseCase } from '../skins';
import {
  getDemoSource,
  getThirdPartyInstallCommand,
  getThirdPartyMediaOptions,
  getThirdPartyNames,
  getThirdPartySnippets,
  getUseCaseHref,
  getUseCaseOptions,
  INSTALL_KINDS,
  isFramework,
  isInstallKind,
  parseInstallKind,
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
  package: '@player.style/x-mas',
};

const audio: ThirdPartySkin = {
  ...skin,
  slug: 'sutro-audio',
  name: 'sutro-audio',
  useCases: ['audio'],
  package: '@player.style/sutro-audio',
};

const defaults: UsageSelection = { framework: 'html', renderer: 'html5-video', install: 'packaged' };

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
    expect(getUseCaseHref(skin, 'video', { 'use-case': 'live-video', install: 'shadcn' })).toBe(
      '/skins/x-mas?install=shadcn'
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

describe('parseInstallKind', () => {
  it('offers packaged and shadcn, defaulting to packaged', () => {
    expect(INSTALL_KINDS.map((kind) => kind.id)).toEqual(['packaged', 'shadcn']);
    expect(isInstallKind('shadcn')).toBe(true);
    expect(parseInstallKind('shadcn')).toBe('shadcn');
    expect(parseInstallKind(undefined)).toBe('packaged');
    expect(parseInstallKind('npm')).toBe('packaged');
  });

  it('sends the retired `open` value to shadcn', () => {
    expect(isInstallKind('open')).toBe(false);
    expect(parseInstallKind('open')).toBe('shadcn');
  });
});

describe('getThirdPartyNames', () => {
  it('derives the tag, component, entries, and root class from the name', () => {
    expect(getThirdPartyNames(skin, 'video')).toMatchObject({
      htmlTag: 'x-mas-skin',
      reactComponent: 'XMasSkin',
      rootClass: 'ps-x-mas',
      htmlEntry: '@player.style/x-mas/html',
      reactEntry: '@player.style/x-mas/react',
      stylesheet: '@player.style/x-mas/skin.css',
      wrapperComponent: 'XMasPlayer',
      player: {
        tag: 'video-player',
        component: 'VideoPlayer',
        htmlEntry: '@videojs/html/video/player',
        reactEntry: '@videojs/react/video',
      },
    });
  });

  it('names live video after the -live sibling package and hosts it on the live video player', () => {
    expect(getThirdPartyNames(skin, 'live-video')).toMatchObject({
      htmlTag: 'x-mas-live-skin',
      reactComponent: 'XMasLiveSkin',
      rootClass: 'ps-x-mas-live',
      htmlEntry: '@player.style/x-mas-live/html',
      reactEntry: '@player.style/x-mas-live/react',
      stylesheet: '@player.style/x-mas-live/skin.css',
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
  it('installs the skin beside the Video.js package for the framework', () => {
    expect(getThirdPartyInstallCommand(skin, 'video', defaults)).toBe('npm install @player.style/x-mas @videojs/html');
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, framework: 'react' })).toBe(
      'npm install @player.style/x-mas @videojs/react'
    );
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, framework: 'vue' })).toBe(
      'npm install @player.style/x-mas @videojs/html'
    );
  });

  it('adds the media adapter, and Mux Data beside Mux media', () => {
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, renderer: 'hls' })).toBe(
      'npm install @player.style/x-mas @videojs/html @videojs/hlsjs-video'
    );
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, framework: 'react', renderer: 'mux-video' })).toBe(
      'npm install @player.style/x-mas @videojs/react @videojs/mux-video @videojs/mux-data'
    );
  });

  it('installs the -live package for live video', () => {
    expect(getThirdPartyInstallCommand(skin, 'live-video', { ...defaults, renderer: 'hls' })).toBe(
      'npm install @player.style/x-mas-live @videojs/html @videojs/hlsjs-video'
    );
  });

  it('installs only the media packages with shadcn, whose registry item brings the Video.js package', () => {
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, install: 'shadcn' })).toBeUndefined();
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, install: 'shadcn', framework: 'react' })).toBe(
      undefined
    );
    expect(getThirdPartyInstallCommand(skin, 'video', { ...defaults, install: 'shadcn', renderer: 'mux-video' })).toBe(
      'npm install @videojs/mux-video @videojs/mux-data'
    );
  });
});

describe('getThirdPartySnippets', () => {
  it('wraps the media in the skin in the player for HTML', () => {
    const html = code(skin, 'video', {});

    expect(html).toContain("import '@videojs/html/video/player';");
    expect(html).toContain("import '@player.style/x-mas/html';");
    expect(html).toContain(
      '<video-player>\n  <x-mas-skin>\n    <video src="' + DEMO_VIDEO.mp4 + '" playsinline></video>'
    );
    expect(html).toContain(`<img slot="poster" src="${DEMO_VIDEO.poster}" alt="" />`);
    expect(html).not.toContain('style=');
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
    expect(youtube).not.toContain('slot="poster"');
  });

  it('puts the accent inline on the skin element or component only when one is set', () => {
    expect(code(skin, 'video', { accent: 'f5c518' })).toContain('<x-mas-skin style="--media-accent-color: #f5c518">');
    expect(code(skin, 'video', { framework: 'react', accent: 'f5c518' })).toContain(
      "<XMasSkin style={{ '--media-accent-color': '#f5c518' }}>"
    );
    expect(code(skin, 'video', { framework: 'react' })).toContain('<XMasSkin>');
  });

  it('imports the React component and stylesheet, and the media component from its entry', () => {
    const react = code(skin, 'video', { framework: 'react' });
    expect(react).toContain("import { VideoPlayer, Video } from '@videojs/react/video';");
    expect(react).toContain("import { XMasSkin } from '@player.style/x-mas/react';");
    expect(react).toContain("import '@player.style/x-mas/skin.css';");
    expect(react).toContain(`<VideoPlayer poster="${DEMO_VIDEO.poster}">`);
    expect(react).toContain(`<Video src="${DEMO_VIDEO.mp4}" playsInline />`);

    const mux = code(skin, 'video', { framework: 'react', renderer: 'mux-video' });
    expect(mux).toContain("import { VideoPlayer } from '@videojs/react/video';");
    expect(mux).toContain("import { MuxVideo } from '@videojs/react/media/mux-video';");
    expect(mux).toContain("import { MuxData } from '@videojs/react/extensions/mux-data';");
    expect(mux).toContain('<MuxData />');
  });

  it('gives Vue the custom element config and a component around the HTML element', () => {
    const vue = code(skin, 'video', { framework: 'vue', renderer: 'mux-video', accent: 'abcdef' });
    expect(vue).toContain('// vite.config.ts');
    expect(vue).toContain('// nuxt.config.ts');
    expect(vue).toContain("const videoJsElements = new Set(['video-player', 'x-mas-skin', 'mux-video', 'mux-data']);");
    expect(vue).toContain('isCustomElement: (tag) => videoJsElements.has(tag)');
    expect(vue).toContain('// components/XMasPlayer.vue');
    expect(vue).toContain('defineProps<{ src: string }>();');
    expect(vue).toContain('<x-mas-skin style="--media-accent-color: #abcdef">');
    expect(vue).toContain('<mux-video :src="src" playsinline></mux-video>');
    expect(vue).toContain("import XMasPlayer from './components/XMasPlayer.vue';");
    expect(vue).toContain(`<XMasPlayer src="${DEMO_VIDEO.hls}" />`);
  });

  it('never names the Vue component after its own player tag, which Vue would resolve to the component', () => {
    for (const useCase of ['video', 'live-video'] as const) {
      const vue = code(skin, useCase, { framework: 'vue', renderer: 'hls' });
      const player = getThirdPartyNames(skin, useCase).player.component;

      expect(vue).not.toContain(`${player}.vue`);
    }
  });

  it('gives Svelte a component with the HTML element and no compiler config', () => {
    const svelte = code(skin, 'video', { framework: 'svelte' });
    expect(svelte).not.toContain('isCustomElement');
    expect(svelte).toContain('// lib/XMasPlayer.svelte');
    expect(svelte).toContain('let { src }: { src: string } = $props();');
    expect(svelte).toContain('<video src={src} playsinline></video>');
    expect(svelte).toContain('// +page.svelte');
    expect(svelte).toContain("import XMasPlayer from '$lib/XMasPlayer.svelte';");
    expect(svelte).toContain("import XMasPlayer from './lib/XMasPlayer.svelte';");
  });

  it('points a shadcn install at the installed files instead of the package', () => {
    const html = getThirdPartySnippets(skin, 'video', { ...defaults, install: 'shadcn', accent: '112233' });
    const [markup, player] = html[0]!.files;
    expect(html[0]!.files.map((file) => file.name)).toEqual(['index.html', 'src/player.ts']);
    expect(markup!.code).toContain('<video-player style="--media-accent-color: #112233">');
    expect(markup!.code).toContain('<!-- Paste components/player-style/x-mas/skin.html here');
    expect(markup!.code).toContain('<script type="module" src="/src/player.ts"></script>');
    expect(player!.code).toBe(
      [
        "import '@videojs/html/video/player';",
        "import './components/player-style/x-mas/register';",
        "import './components/player-style/x-mas/skin.css';",
      ].join('\n')
    );

    const react = code(skin, 'video', { framework: 'react', install: 'shadcn' });
    expect(react).toContain("import { XMasSkin } from './components/player-style/x-mas/Skin';");
    expect(react).toContain("import './components/player-style/x-mas/skin.css';");
    expect(react).not.toContain('@player.style/x-mas');
  });

  it('renders the installed markup through v-html in Vue, whose renderer leaves <template> contents empty', () => {
    const vue = code(skin, 'video', { framework: 'vue', install: 'shadcn', accent: '112233' });
    expect(vue).toContain("const videoJsElements = new Set(['video-player']);");
    expect(vue).toContain("import './player-style/x-mas/register';");
    expect(vue).toContain("import './player-style/x-mas/skin.css';");
    expect(vue).toContain("import skin from './player-style/x-mas/skin.html?raw';");
    expect(vue).toContain("'<!-- Add a compatible media element here. -->',");
    expect(vue).toContain("`<video src=\"${props.src.replaceAll('\"', '&quot;')}\" playsinline></video>`");
    expect(vue).toContain('<video-player v-html="markup" style="--media-accent-color: #112233"></video-player>');

    const mux = code(skin, 'video', { framework: 'vue', install: 'shadcn', renderer: 'mux-video' });
    expect(mux).toContain("import '@videojs/html/media/mux-video';");
    expect(mux).toContain("import '@videojs/html/extensions/mux-data';");
    expect(mux).toContain('playsinline></mux-video><mux-data></mux-data>`');
    expect(mux).toContain("const videoJsElements = new Set(['video-player']);");
  });

  it('pastes the installed markup in Svelte, importing the files relative to lib/', () => {
    const svelte = code(skin, 'video', { framework: 'svelte', install: 'shadcn' });
    expect(svelte).toContain("import '../components/player-style/x-mas/register';");
    expect(svelte).toContain("import '../components/player-style/x-mas/skin.css';");
    expect(svelte).toContain('<!-- Paste components/player-style/x-mas/skin.html here');
    expect(svelte).toContain('<video src={src} playsinline></video>');

    expect(code(skin, 'live-video', { framework: 'react', install: 'shadcn', renderer: 'hls' })).toContain(
      "import { XMasLiveSkin } from './components/player-style/x-mas-live/Skin';"
    );
  });

  it('writes every snippet in a language the highlighter loads', () => {
    const langs = new Set(
      (['html', 'react', 'vue', 'svelte'] as const).flatMap((framework) =>
        (['packaged', 'shadcn'] as const).flatMap((install) =>
          getThirdPartySnippets(skin, 'video', { ...defaults, framework, install }).flatMap((block) =>
            block.files.map((file) => file.lang)
          )
        )
      )
    );

    expect([...langs].sort()).toEqual(['html', 'svelte', 'ts', 'tsx', 'vue']);
  });

  it('uses the audio player and media for audio skins', () => {
    const html = code(audio, 'audio', { renderer: 'html5-audio' });
    expect(html).toContain("import '@videojs/html/audio/player';");
    expect(html).toContain(`<audio-player>\n  <sutro-audio-skin>\n    <audio src="${DEMO_AUDIO}"></audio>`);
    expect(html).not.toContain('slot="poster"');

    const react = code(audio, 'audio', { framework: 'react', renderer: 'spotify' });
    expect(react).toContain("import { AudioPlayer } from '@videojs/react/audio';");
    expect(react).toContain("import { SpotifyAudio } from '@videojs/react/media/spotify-audio';");
    expect(react).toContain('<SutroAudioSkin>');
    expect(react).not.toContain('VideoPlayer');
  });

  it('hosts live video on the live video player with the -live package entries', () => {
    const html = code(skin, 'live-video', { renderer: 'hls' });
    expect(html).toContain("import '@videojs/html/live-video/player';");
    expect(html).toContain("import '@player.style/x-mas-live/html';");
    expect(html).toContain(
      `<live-video-player>\n  <x-mas-live-skin>\n    <hlsjs-video src="${DEMO_LIVE_HLS}" playsinline>`
    );

    const react = code(skin, 'live-video', { framework: 'react', renderer: 'mux-video' });
    expect(react).toContain("import { LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(react).toContain("import { XMasLiveSkin } from '@player.style/x-mas-live/react';");
    expect(react).toContain('<XMasLiveSkin>');
  });

  it('generates every combination for every use case of every listed third-party skin without throwing', () => {
    for (const slug of ['yt', 'microvideo', 'sutro-audio']) {
      const listed = getSkin(slug);
      if (!listed || !isThirdPartySkin(listed)) throw new Error(`${slug} is missing`);

      for (const useCase of listed.useCases) {
        for (const framework of ['html', 'react', 'vue', 'svelte'] as const) {
          for (const install of ['packaged', 'shadcn'] as const) {
            for (const option of getThirdPartyMediaOptions(listed, useCase)) {
              expect(code(listed, useCase, { framework, install, renderer: option.id })).toMatch(/-player|Player/);
            }
          }
        }
      }
    }
  });

  it('throws for a use case the skin does not cover', () => {
    expect(() => code(audio, 'live-video', {})).toThrow(/no live-video package/);
  });
});
