import { describe, expect, it } from 'vite-plus/test';

import { DEMO_AUDIO, DEMO_LIVE_HLS, DEMO_PORTRAIT_VIDEO, DEMO_VIDEO } from '../demo-media';
import { getSkin, isThirdPartySkin, type ThirdPartySkin } from '../skins';
import {
  getDemoSource,
  getThirdPartyInstallCommand,
  getThirdPartyMediaOptions,
  getThirdPartyNames,
  getThirdPartySnippets,
  isFramework,
  isInstallKind,
  resolveThirdPartyRenderer,
  type UsageSelection,
} from '../third-party-usage';

const skin: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'x-mas',
  name: 'x-mas',
  edition: 'on-demand',
  title: 'X-mas',
  description: 'Festive.',
  useCase: 'video',
  author: { name: 'Someone' },
  package: '@player.style/x-mas',
};

const live: ThirdPartySkin = {
  ...skin,
  slug: 'x-mas-live',
  name: 'x-mas-live',
  package: '@player.style/x-mas-live',
  edition: 'live',
  useCase: 'live-video',
};

const audio: ThirdPartySkin = {
  ...skin,
  slug: 'sutro-audio',
  name: 'sutro-audio',
  useCase: 'audio',
  package: '@player.style/sutro-audio',
};

const defaults: UsageSelection = { framework: 'html', renderer: 'html5-video', install: 'packaged' };

function code(target: ThirdPartySkin, selection: Partial<UsageSelection>): string {
  return getThirdPartySnippets(target, { ...defaults, ...selection })
    .flatMap((block) => block.files)
    .map((file) => `// ${file.name}\n${file.code}`)
    .join('\n\n');
}

describe('getThirdPartyMediaOptions', () => {
  it('mirrors the Video.js renderer list for the skin’s preset', () => {
    expect(getThirdPartyMediaOptions(skin).map((option) => option.label)).toEqual([
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
    expect(getThirdPartyMediaOptions(audio).map((option) => option.label)).toEqual(['Audio file', 'Mux', 'Spotify']);
    expect(getThirdPartyMediaOptions(live).map((option) => option.label)).toEqual(['HLS', 'Mux']);
  });
});

describe('resolveThirdPartyRenderer', () => {
  it('falls back to the preset’s first option for unknown or foreign media', () => {
    expect(resolveThirdPartyRenderer(skin, 'youtube')).toBe('youtube');
    expect(resolveThirdPartyRenderer(skin, 'spotify')).toBe('html5-video');
    expect(resolveThirdPartyRenderer(live, undefined)).toBe('hls');
    expect(resolveThirdPartyRenderer(audio, 'html5-video')).toBe('html5-audio');
  });
});

describe('isFramework', () => {
  it('accepts the four frameworks and nothing else', () => {
    expect(['html', 'react', 'vue', 'svelte'].every(isFramework)).toBe(true);
    expect(isFramework('cdn')).toBe(false);
    expect(isFramework('shadcn')).toBe(false);
    expect(isInstallKind('open')).toBe(true);
    expect(isInstallKind('npm')).toBe(false);
  });
});

describe('getThirdPartyNames', () => {
  it('derives the tag, component, entries, and root class from the name', () => {
    expect(getThirdPartyNames(skin)).toMatchObject({
      htmlTag: 'x-mas-skin',
      reactComponent: 'XMasSkin',
      rootClass: 'ps-x-mas',
      htmlEntry: '@player.style/x-mas',
      reactEntry: '@player.style/x-mas/react',
      stylesheet: '@player.style/x-mas/skin.css',
      player: {
        tag: 'video-player',
        component: 'VideoPlayer',
        htmlEntry: '@videojs/html/video/player',
        reactEntry: '@videojs/react/video',
      },
    });
  });

  it('names a live edition after its sibling package and hosts it on the live video player', () => {
    expect(getThirdPartyNames(live)).toMatchObject({
      htmlTag: 'x-mas-live-skin',
      reactComponent: 'XMasLiveSkin',
      rootClass: 'ps-x-mas-live',
      htmlEntry: '@player.style/x-mas-live',
      reactEntry: '@player.style/x-mas-live/react',
      stylesheet: '@player.style/x-mas-live/skin.css',
      player: { tag: 'live-video-player', component: 'LiveVideoPlayer', reactEntry: '@videojs/react/live-video' },
    });
  });
});

describe('getDemoSource', () => {
  it('plays the classic asset, the portrait one for mobile-first skins, and the live stream on live presets', () => {
    expect(getDemoSource(skin, 'html5-video')).toBe(DEMO_VIDEO.mp4);
    expect(getDemoSource(skin, 'mux-video')).toBe(DEMO_VIDEO.hls);
    expect(getDemoSource({ ...skin, preview: { portrait: true } }, 'hls')).toBe(DEMO_PORTRAIT_VIDEO.hls);
    expect(getDemoSource(audio, 'html5-audio')).toBe(DEMO_AUDIO);
    expect(getDemoSource(live, 'hls')).toBe(DEMO_LIVE_HLS);
    expect(getDemoSource(live, 'mux-video')).toBe(DEMO_LIVE_HLS);
  });
});

describe('getThirdPartyInstallCommand', () => {
  it('installs the skin beside the Video.js package for the framework', () => {
    expect(getThirdPartyInstallCommand(skin, defaults)).toBe('npm install @player.style/x-mas @videojs/html');
    expect(getThirdPartyInstallCommand(skin, { ...defaults, framework: 'react' })).toBe(
      'npm install @player.style/x-mas @videojs/react'
    );
    expect(getThirdPartyInstallCommand(skin, { ...defaults, framework: 'vue' })).toBe(
      'npm install @player.style/x-mas @videojs/html'
    );
  });

  it('adds the media adapter, and Mux Data beside Mux media', () => {
    expect(getThirdPartyInstallCommand(skin, { ...defaults, renderer: 'hls' })).toBe(
      'npm install @player.style/x-mas @videojs/html @videojs/hlsjs-video'
    );
    expect(getThirdPartyInstallCommand(skin, { ...defaults, framework: 'react', renderer: 'mux-video' })).toBe(
      'npm install @player.style/x-mas @videojs/react @videojs/mux-video @videojs/mux-data'
    );
  });

  it('leaves the skin package out of an open install', () => {
    expect(getThirdPartyInstallCommand(skin, { ...defaults, install: 'open' })).toBe('npm install @videojs/html');
  });
});

describe('getThirdPartySnippets', () => {
  it('wraps the media in the skin in the player for HTML', () => {
    const html = code(skin, {});

    expect(html).toContain("import '@videojs/html/video/player';");
    expect(html).toContain("import '@player.style/x-mas';");
    expect(html).toContain(
      '<video-player>\n  <x-mas-skin>\n    <video src="' + DEMO_VIDEO.mp4 + '" playsinline></video>'
    );
    expect(html).toContain(`<img slot="poster" src="${DEMO_VIDEO.poster}" alt="" />`);
    expect(html).not.toContain('style=');
  });

  it('follows the Video.js codegen for each media: element, import, adapter, and Mux Data', () => {
    const hls = code(skin, { renderer: 'hls' });
    expect(hls).toContain("import '@videojs/html/media/hlsjs-video';");
    expect(hls).toContain(`<hlsjs-video src="${DEMO_VIDEO.hls}" playsinline></hlsjs-video>`);

    const mux = code(skin, { renderer: 'mux-video' });
    expect(mux).toContain("import '@videojs/html/extensions/mux-data';");
    expect(mux).toContain('<mux-data></mux-data>');

    const youtube = code(skin, { renderer: 'youtube' });
    expect(youtube).toContain('<youtube-video src="https://www.youtube.com/watch?v=aqz-KE-bpKQ"></youtube-video>');
    expect(youtube).not.toContain('playsinline');
    expect(youtube).not.toContain('slot="poster"');
  });

  it('puts the accent inline on the skin element or component only when one is set', () => {
    expect(code(skin, { accent: 'f5c518' })).toContain('<x-mas-skin style="--media-accent-color: #f5c518">');
    expect(code(skin, { framework: 'react', accent: 'f5c518' })).toContain(
      "<XMasSkin style={{ '--media-accent-color': '#f5c518' }}>"
    );
    expect(code(skin, { framework: 'react' })).toContain('<XMasSkin>');
  });

  it('imports the React component and stylesheet, and the media component from its entry', () => {
    const react = code(skin, { framework: 'react' });
    expect(react).toContain("import { VideoPlayer, Video } from '@videojs/react/video';");
    expect(react).toContain("import { XMasSkin } from '@player.style/x-mas/react';");
    expect(react).toContain("import '@player.style/x-mas/skin.css';");
    expect(react).toContain(`<VideoPlayer poster="${DEMO_VIDEO.poster}">`);
    expect(react).toContain(`<Video src="${DEMO_VIDEO.mp4}" playsInline />`);

    const mux = code(skin, { framework: 'react', renderer: 'mux-video' });
    expect(mux).toContain("import { VideoPlayer } from '@videojs/react/video';");
    expect(mux).toContain("import { MuxVideo } from '@videojs/react/media/mux-video';");
    expect(mux).toContain("import { MuxData } from '@videojs/react/extensions/mux-data';");
    expect(mux).toContain('<MuxData />');
  });

  it('gives Vue the custom element config and an HTML-edition component', () => {
    const vue = code(skin, { framework: 'vue', renderer: 'mux-video', accent: 'abcdef' });
    expect(vue).toContain('// vite.config.ts');
    expect(vue).toContain('// nuxt.config.ts');
    expect(vue).toContain("const videoJsElements = new Set(['video-player', 'x-mas-skin', 'mux-video', 'mux-data']);");
    expect(vue).toContain('isCustomElement: (tag) => videoJsElements.has(tag)');
    expect(vue).toContain('// VideoPlayer.vue');
    expect(vue).toContain('defineProps<{ src: string }>();');
    expect(vue).toContain('<x-mas-skin style="--media-accent-color: #abcdef">');
    expect(vue).toContain('<mux-video :src="src" playsinline></mux-video>');
    expect(vue).toContain(`<VideoPlayer src="${DEMO_VIDEO.hls}" />`);
  });

  it('gives Svelte a component with the HTML edition and no compiler config', () => {
    const svelte = code(skin, { framework: 'svelte' });
    expect(svelte).not.toContain('isCustomElement');
    expect(svelte).toContain('// VideoPlayer.svelte');
    expect(svelte).toContain('let { src }: { src: string } = $props();');
    expect(svelte).toContain('<video src={src} playsinline></video>');
    expect(svelte).toContain('// +page.svelte');
    expect(svelte).toContain("import VideoPlayer from '$lib/VideoPlayer.svelte';");
  });

  it('points an open install at the copied files instead of the package', () => {
    const html = code(skin, { install: 'open', accent: '112233' });
    expect(html).toContain("import './register';\n  import './skin.css';");
    expect(html).not.toContain("import '@player.style/x-mas'");
    expect(html).toContain('<video-player style="--media-accent-color: #112233">');
    expect(html).toContain('Paste skin.html here');

    const react = code(skin, { framework: 'react', install: 'open' });
    expect(react).toContain("import { XMasSkin } from './Skin';");
    expect(react).toContain("import './skin.css';");
  });

  it('uses the audio player and media for audio skins', () => {
    const html = code(audio, { renderer: 'html5-audio' });
    expect(html).toContain("import '@videojs/html/audio/player';");
    expect(html).toContain(`<audio-player>\n  <sutro-audio-skin>\n    <audio src="${DEMO_AUDIO}"></audio>`);
    expect(html).not.toContain('slot="poster"');

    const react = code(audio, { framework: 'react', renderer: 'spotify' });
    expect(react).toContain("import { AudioPlayer } from '@videojs/react/audio';");
    expect(react).toContain("import { SpotifyAudio } from '@videojs/react/media/spotify-audio';");
    expect(react).toContain('<SutroAudioSkin>');
    expect(react).not.toContain('VideoPlayer');
  });

  it('hosts a live edition on the live video player with the live entries', () => {
    const html = code(live, { renderer: 'hls' });
    expect(html).toContain("import '@videojs/html/live-video/player';");
    expect(html).toContain("import '@player.style/x-mas-live';");
    expect(html).toContain(
      `<live-video-player>\n  <x-mas-live-skin>\n    <hlsjs-video src="${DEMO_LIVE_HLS}" playsinline>`
    );

    const react = code(live, { framework: 'react', renderer: 'mux-video' });
    expect(react).toContain("import { LiveVideoPlayer } from '@videojs/react/live-video';");
    expect(react).toContain("import { XMasLiveSkin } from '@player.style/x-mas-live/react';");
    expect(react).toContain('<XMasLiveSkin>');
  });

  it('generates every combination for every listed third-party skin without throwing', () => {
    const listed = getSkin('yt');
    if (!listed || !isThirdPartySkin(listed)) throw new Error('yt is missing');

    for (const framework of ['html', 'react', 'vue', 'svelte'] as const) {
      for (const install of ['packaged', 'open'] as const) {
        for (const option of getThirdPartyMediaOptions(listed)) {
          expect(code(listed, { framework, install, renderer: option.id })).toMatch(/video-player|VideoPlayer/);
        }
      }
    }
  });
});
