import { ReactNode } from 'react';
import clsx from 'clsx';
import Video from '@/app/_components/Video';
import MediaTheme from '@/app/_components/MediaTheme';
import AuthorLink from './AuthorLink';
import mediaAssets from '@/media-assets';

import type { Theme } from 'content-collections';
import Link from './Link';

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
  const hasFeature = (feature: string) => theme.tagGroups?.features.includes(feature);

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img slot="poster" src={assetItem.poster} alt="" />
              <Video
                className="block"
                slot="media"
                src={assetItem.src}
                poster={!theme.audio ? assetItem.poster : undefined}
                preload="none"
              >
                <track default label="thumbnails" kind="metadata" src={assetItem.thumbnails} />
                {assetItem.chapters && hasFeature('chapters') && (
                  <track default kind="chapters" src={assetItem.chapters} key={assetItem.chapters} />
                )}
              </Video>
            </MediaTheme>
          </div>
        </div>
        <div>
          <Link
            href={`/themes/${theme._meta.path}`}
            className="group cursor-pointer flex items-center justify-between gap-0.5 mb-0.5"
          >
            <h2 className="text-xl md:text-4xl leading-heading font-bold [text-wrap:balance] underline-offset-heading decoration-link group-hover:underline group-focus-visible:underline">
              {theme.title}
            </h2>
            <div className="px-0.5 py-0.25 rounded-4 font-mono leading-mono tracking-wide text-xs uppercase bg-putty-light border border-ctx group-hover:bg-blue group-hover:text-white group-hover:border-blue-dark group-focus-visible:bg-blue group-focus-visible:text-white group-focus-visible:border-blue-dark">
              View theme
            </div>
          </Link>
          <p className="mb-0.5 font-body text-md text-pretty tracking-wide leading-normal font-normal normal-case max-w-26 pr-1">
            {theme.description}
          </p>
          <AuthorLink handle={theme.author} />
        </div>
      </div>
    </>
  );
}
