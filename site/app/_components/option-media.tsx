import type { ReactNode } from 'react';

import type { Renderer } from '@/lib/presets';
import { isLiveUseCase, type UseCase } from '@/lib/skins';
import type { Framework, InstallKind } from '@/lib/third-party-usage';

import CloudflareLogo from './brands/CloudflareLogo';
import Html5Logo from './brands/Html5Logo';
import NpmLogo from './brands/NpmLogo';
import ReactLogo from './brands/ReactLogo';
import ShadcnLogo from './brands/ShadcnLogo';
import SpotifyLogo from './brands/SpotifyLogo';
import SvelteLogo from './brands/SvelteLogo';
import TiktokLogo from './brands/TiktokLogo';
import TwitchLogo from './brands/TwitchLogo';
import VimeoLogo from './brands/VimeoLogo';
import VueLogo from './brands/VueLogo';
import YoutubeLogo from './brands/YoutubeLogo';
import BroadcastIcon from './icons/BroadcastIcon';
import PlayIcon from './icons/PlayIcon';
import MuxSmallLogo from './logos/MuxSmallLogo';

/**
 * Options without a brand mark get a monogram so every card still has a recognizable badge. Video.js 10 sets it in its
 * compact display face; the extended one this site has runs wider than the badge, so the monogram uses the body face.
 */
function Monogram({ children }: { children: string }) {
  return <span className="text-[0.6875rem] leading-none font-bold tracking-tight uppercase">{children}</span>;
}

const FRAMEWORK_MEDIA: Record<Framework, ReactNode> = {
  html: <Html5Logo className="size-6" />,
  react: <ReactLogo className="size-6" />,
  vue: <VueLogo className="size-6" />,
  svelte: <SvelteLogo className="size-6" />,
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

// Video.js 10's install method picker marks its packaged and shadcn cards the same way.
const INSTALL_MEDIA: Record<InstallKind, ReactNode> = {
  packaged: <NpmLogo className="size-6" />,
  shadcn: <ShadcnLogo className="size-5" />,
};

/** The badge for a framework picker card. */
export function getFrameworkMedia(id: Framework): ReactNode {
  return FRAMEWORK_MEDIA[id];
}

/** The badge for a media picker card. */
export function getRendererMedia(id: Renderer): ReactNode {
  return RENDERER_MEDIA[id];
}

/** The badge for a packaged-or-shadcn picker card. */
export function getInstallMedia(id: InstallKind): ReactNode {
  return INSTALL_MEDIA[id];
}

/** The badge for a use-case picker card: a broadcast mark for live, a play mark otherwise. */
export function getUseCaseMedia(id: UseCase): ReactNode {
  return isLiveUseCase(id) ? <BroadcastIcon className="size-5" /> : <PlayIcon className="size-5" />;
}
