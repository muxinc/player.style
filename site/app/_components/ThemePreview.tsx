import { ReactNode } from 'react';
import clsx from 'clsx';
import Video from '@/app/_components/Video';
import MediaTheme from '@/app/_components/MediaTheme';
import AuthorLink from './AuthorLink';
import mediaAssets from '@/media-assets';

import type { Theme } from 'content-collections';
import ThemeLink from './ThemeLink';

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
  const assetItem = mediaAssets[asset];

  return (
    <>
      <div className="bg-white border-ctx border -m-0.5px relative grid gap-x-2 gap-y-1 p-1 pb-2 md:px-2 md:py-1.5">
        <div className={clsx('w-full', theme.audio ? 'py-2' : undefined)}>
          <div
            className="@container max-h-[480px] mx-auto"
            style={{
              aspectRatio: !theme.audio ? assetItem.aspectRatio : undefined,
            }}
          >
            <MediaTheme
              name={theme._meta.path}
              theme={theme}
              defaultDuration={assetItem.duration}
              mediaTitle={assetItem.title}
              mediaByline={assetItem.byline}
            >
              <img slot="poster" src={assetItem.poster} alt="" />
              <Video
                className="block"
                slot="media"
                src={assetItem.src}
                poster={!theme.audio ? assetItem.poster : undefined}
                preload="none"
              >
                <track label="thumbnails" default kind="metadata" src={assetItem.thumbnails} />
              </Video>
            </MediaTheme>
          </div>
        </div>
        <div>
          <ThemeLink theme={theme} className="mb-0.5"/>
          <p className="mb-0.5 font-body text-md text-pretty tracking-wide leading-normal font-normal normal-case max-w-26 pr-1">
            {theme.description}
          </p>
          <AuthorLink handle={theme.author} />
        </div>
      </div>
    </>
  );
}
