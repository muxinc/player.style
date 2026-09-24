import type { ReactNode } from 'react';

import type { Framework, Renderer } from '@/lib/installation-url';
import type { SkinFramework } from '@/lib/skins';

import CloudflareLogo from './brands/CloudflareLogo';
import Html5Logo from './brands/Html5Logo';
import ReactLogo from './brands/ReactLogo';
import ShadcnLogo from './brands/ShadcnLogo';
import SpotifyLogo from './brands/SpotifyLogo';
import SvelteLogo from './brands/SvelteLogo';
import TiktokLogo from './brands/TiktokLogo';
import TwitchLogo from './brands/TwitchLogo';
import VimeoLogo from './brands/VimeoLogo';
import VueLogo from './brands/VueLogo';
import YoutubeLogo from './brands/YoutubeLogo';
import MuxSmallLogo from './logos/MuxSmallLogo';

/** Options without a brand mark get a monogram so every card still has a recognizable badge. */
function Monogram({ children }: { children: string }) {
  return <span className="font-display text-[0.625rem] font-bold tracking-tight uppercase">{children}</span>;
}

const FRAMEWORK_MEDIA: Record<Framework | SkinFramework, ReactNode> = {
  react: <ReactLogo className="size-6" />,
  html: <Html5Logo className="size-6" />,
  vue: <VueLogo className="size-6" />,
  svelte: <SvelteLogo className="size-6" />,
  shadcn: <ShadcnLogo className="size-5" />,
  cdn: <Monogram>CDN</Monogram>,
};

const RENDERER_MEDIA: Record<Renderer, ReactNode> = {
  'html5-video': <Html5Logo className="size-6" />,
  'html5-audio': <Html5Logo className="size-6" />,
  hls: <Monogram>HLS</Monogram>,
  dash: <Monogram>DASH</Monogram>,
  'mux-video': <MuxSmallLogo className="w-7" />,
  'mux-audio': <MuxSmallLogo className="w-7" />,
  vimeo: <VimeoLogo className="size-6" />,
  youtube: <YoutubeLogo className="size-6" />,
  cloudflare: <CloudflareLogo className="size-6" />,
  tiktok: <TiktokLogo className="size-6" />,
  twitch: <TwitchLogo className="size-6" />,
  spotify: <SpotifyLogo className="size-6" />,
};

/** The badge for a framework picker card; the framework ids are shared by first- and third-party skins. */
export function getFrameworkMedia(id: Framework | SkinFramework): ReactNode {
  return FRAMEWORK_MEDIA[id];
}

/** The badge for a media picker card. */
export function getRendererMedia(id: Renderer): ReactNode {
  return RENDERER_MEDIA[id];
}
