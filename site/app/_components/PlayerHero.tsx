'use client';

import Video from '@/app/_components/Video';
import MediaTheme from '@/app/_components/MediaTheme';
import { FormEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import mediaAssets from '@/media-assets';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type PlayerHeroProps = {
  theme: any;
  params: any;
};

const MIN_PLAYER_WIDTH = 300;
const DEFAULT_ASSET = 'landscape';

export default function PlayerHero(props: PlayerHeroProps) {
  const { theme } = props;

  const container = useRef<HTMLDivElement>(null);
  const playerContainer = useRef<HTMLDivElement>(null);

  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(100);
  const [isLightMode, setLightMode] = useState(false);

  const onWindowResize = () => {
    if (!playerContainer.current?.offsetWidth) return;
    setMinWidth((MIN_PLAYER_WIDTH / playerContainer.current?.offsetWidth) * 100);
  };

  useEffect(() => {
    onWindowResize();
    globalThis.addEventListener('resize', onWindowResize);

    return () => {
      globalThis.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const onInput = (event: FormEvent<HTMLInputElement>) => {
    setWidth(parseInt(event.currentTarget.value, 10));
  };

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const asset = (searchParams.get('asset') ??
    theme.defaultAsset ??
    DEFAULT_ASSET) as keyof typeof mediaAssets;
  const assetItem = mediaAssets[asset];
  const isPortrait = assetItem.aspectRatio < 1;

  const setOrientation = (orientation: string) => {
    // Reset sizing input to 100%.
    setWidth(100);
    changeAsset(orientation);
    // Add a delay so that the player has time to resize.
    setTimeout(onWindowResize, 100);
  };

  const changeAsset = (asset?: string) => {
    if (asset === theme.defaultAsset) asset = '';

    const params = new URLSearchParams(searchParams);
    if (asset) {
      params.set('asset', asset);
    } else {
      params.delete('asset');
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div
        ref={container}
        className={
          isLightMode
            ? 'set-bg-ctx-white set-border-ctx-gray text-black'
            : 'set-bg-ctx-charcoal set-border-ctx-black text-white'
        }
      >
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-ctx border-ctx z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx">
            <div className="-m-0.5px grid grid-cols-1 h-2"></div>
          </div>
        </div>
        <div className="relative grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-ctx border-ctx z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx">
            <div
              ref={playerContainer}
              className={clsx(
                'flex items-center justify-center dark max-h-[719px] mx-auto overflow-hidden',
                theme.audio && 'sm:p-1 md:p-2'
              )}
              style={{
                aspectRatio: !theme.audio ? assetItem.aspectRatio : undefined,
                width: theme.audio ? assetItem.aspectRatio * 719 : undefined,
              }}
            >
              <div
                className="@container max-w-full"
                style={{
                  aspectRatio: !theme.audio ? assetItem.aspectRatio : undefined,
                  width: `${width}%`,
                  minWidth: MIN_PLAYER_WIDTH,
                }}
              >
                <MediaTheme
                  name={props.params.slug}
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
                  >
                    <track
                      label="thumbnails"
                      default
                      kind="metadata"
                      src={assetItem.thumbnails}
                      // Use key so the track element is replaced if src changes.
                      // custom-media-element doesn't support track attr changes.
                      key={assetItem.thumbnails}
                    />
                  </Video>
                </MediaTheme>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-ctx border-ctx z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx flex justify-between p-1">
            <div className="flex items-center gap-1">
              <div className="hidden sm:flex items-center border-r border-black pr-1">
                <label htmlFor="player-size" className="mr-0.5">
                  Size
                </label>
                <input
                  type="range"
                  id="player-size"
                  min={Math.round(minWidth)}
                  max="100"
                  value={width}
                  onInput={onInput}
                />
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => setOrientation('landscape')} title="Show landscape">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={clsx(
                      'size-1.25 transition-opacity duration-short rotate-90',
                      isPortrait && 'opacity-30'
                    )}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                </button>
                <button onClick={() => setOrientation('portrait')} title="Show portrait">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={clsx(
                      'size-1.25 transition-opacity duration-short',
                      !isPortrait && 'opacity-30'
                    )}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => setLightMode(true)} title="Light mode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={clsx(
                    'size-1 transition-opacity duration-short',
                    !isLightMode ? 'opacity-30' : 'opacity-100'
                  )}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              </button>
              <button onClick={() => setLightMode(false)} title="Dark mode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={clsx(
                    'size-1 transition-opacity duration-short',
                    isLightMode ? 'opacity-30' : 'opacity-100'
                  )}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
