import { ReactNode } from 'react';
import clsx from 'clsx';
import HlsVideo from 'hls-video-element/react';
import MediaTheme from '@/app/_components/MediaTheme';
import Link from 'next/link';
import AuthorLink from './AuthorLink';
import AuthorImage from './AuthorImage';
import mediaAssets from '@/media-assets';

import type { Theme } from 'content-collections';

type ThemePreviewProps = {
  key: string;
  children?: ReactNode;
  priority: boolean;
  theme: Theme;
};

const DEFAULT_ASSET = 'landscape';

export default function ThemePreview(props: ThemePreviewProps) {
  const { theme } = props;

  const asset = (theme.defaultAsset ?? DEFAULT_ASSET) as keyof typeof mediaAssets;

  return (
    <>
      <div className="bg-white border-ctx border -m-0.5px relative grid gap-x-2 gap-y-1 p-1 pb-2 md:px-2 md:py-1.5">
        <div className={clsx('w-full', theme.audio ? 'py-2' : undefined)}>
          <div
            className="max-h-[480px] mx-auto"
            style={{
              aspectRatio: !theme.audio ? mediaAssets[asset].aspectRatio : undefined,
              height: theme.height,
            }}
          >
            <MediaTheme name={theme._meta.path} theme={theme} defaultDuration={63}>
              <HlsVideo
                suppressHydrationWarning
                className="block"
                slot="media"
                src={mediaAssets[asset].src}
                poster={!theme.audio ? mediaAssets[asset].poster : undefined}
                crossOrigin="anonymous"
                preload="none"
                playsInline
              >
                <track
                  label="thumbnails"
                  default
                  kind="metadata"
                  src={mediaAssets[asset].thumbnails}
                />
              </HlsVideo>
            </MediaTheme>
          </div>
        </div>
        <div className="pr-1">
          <h2 className="font-body text-xl md:text-4xl leading-heading last:mb-0 mb-0.5 font-bold normal-case decoration-link underline-offset-heading cursor-pointer hover:underline focus-visible:underline group-hover:underline group-focus-visible:underline max-w-26 [text-wrap:pretty]">
            <Link href={`/themes/${theme._meta.path}`}>{theme.title}</Link>
          </h2>
          <p className="mb-0.5 font-body text-md text-base tracking-wide leading-normal font-normal normal-case max-w-26">
            {theme.description}
          </p>
          <div className="flex gap-0.5 flex-row items-center">
            <AuthorLink handle={theme.author} className="rounded-1 overflow-clip">
              <AuthorImage handle={theme.author} className="w-2 h-2" />
            </AuthorLink>
            <div className="font-mono leading-mono font-normal">
              By{' '}
              <AuthorLink handle={theme.author} className="underline">
                {theme.author}
              </AuthorLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
