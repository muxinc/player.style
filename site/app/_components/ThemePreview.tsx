import { ReactNode } from 'react';
import clsx from 'clsx';
import HlsVideo from 'hls-video-element/react';
import MediaTheme from '@/app/_components/MediaTheme';
import Link from 'next/link';
import AuthorLink from './AuthorLink';

import type { Theme } from 'content-collections';

type ThemePreviewProps = {
  key: string;
  children?: ReactNode;
  priority: boolean;
  theme: Theme;
};

export default function ThemePreview(props: ThemePreviewProps) {
  const { theme } = props;

  return (
    <>
      <div className="border-ctx border -m-0.5px relative grid gap-x-2 gap-y-1 p-1 pb-2 md:px-2 md:py-1.5">
        <div className="relative">
          <MediaTheme name={theme._meta.path} theme={theme} defaultDuration={63}>
            <HlsVideo
              suppressHydrationWarning
              className={clsx('block', !theme.audio ? 'h-fit aspect-video' : undefined)}
              style={{ height: theme.height }}
              slot="media"
              src="https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ.m3u8"
              poster={!theme.audio ? 'https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp?time=52' : undefined}
              crossOrigin="anonymous"
              preload="none"
            >
              <track
                label="thumbnails"
                default
                kind="metadata"
                src="https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/storyboard.vtt"
              />
            </HlsVideo>
          </MediaTheme>
        </div>
        <div className="pr-1">
          <h2 className="font-body text-xl md:text-3xl leading-heading last:mb-0 mb-0.5 font-bold normal-case decoration-link underline-offset-heading cursor-pointer hover:underline focus-visible:underline group-hover:underline group-focus-visible:underline max-w-26 [text-wrap:pretty]">
            <Link href={`/themes/${theme._meta.path}`}>{theme.title}</Link>
          </h2>
          <p className="mb-0.5 font-body text-base tracking-wide leading-normal font-normal normal-case max-w-26">
            {theme.description}
          </p>
          <div className="flex gap-0.5 flex-row items-center">
            <div className="font-mono text-sm leading-mono font-normal uppercase text-gray-dark">
              By <AuthorLink handle={theme.author}></AuthorLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
