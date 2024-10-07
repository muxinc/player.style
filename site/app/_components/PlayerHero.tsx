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

  const asset = (searchParams.get('asset') ?? theme.defaultAsset ?? DEFAULT_ASSET) as keyof typeof mediaAssets;
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
                    width="32"
                    height="20"
                    viewBox="0 0 32 20"
                    fill="none"
                    stroke="currentColor"
                    className={clsx('size-1.25 transition-opacity duration-short', isPortrait && 'opacity-30')}
                  >
                    <rect width="30" height="18" x="1" y="1" rx="3" />
                    <path stroke-linecap="round" d="M27 7v6" />
                  </svg>
                </button>
                <button onClick={() => setOrientation('portrait')} title="Show portrait">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 32"
                    stroke="currentColor"
                    className={clsx('size-1.25 transition-opacity duration-short', !isPortrait && 'opacity-30')}
                  >
                    <rect width="30" height="18" x="19" y="1" rx="3" transform="rotate(90 19 1)" />
                    <path stroke-linecap="round" d="M13 27H7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-0.5 md:gap-1">
              <button onClick={() => setLightMode(true)} title="Light mode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className={clsx(
                    'size-1 transition-opacity duration-short',
                    !isLightMode ? 'opacity-30' : 'opacity-100'
                  )}
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 4V0M12 24v-4M17.657 6.343l2.828-2.828M3.515 20.485l2.828-2.828M17.657 17.657l2.828 2.828M3.515 3.515l2.828 2.828M20 12h4M0 12h4" />
                </svg>
              </button>
              <button onClick={() => setLightMode(false)} title="Dark mode">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={clsx(
                    'size-1 transition-opacity duration-short',
                    isLightMode ? 'opacity-30' : 'opacity-100'
                  )}
                >
                  <path d="m23 16.229.456.206a.5.5 0 0 0-.662-.662zM7.771 1l.456.206a.5.5 0 0 0-.662-.662zm15.023 14.773a11 11 0 0 1-4.531.973v1c1.761 0 3.435-.38 4.943-1.062zm-4.531.973c-6.08 0-11.009-4.929-11.009-11.009h-1c0 6.632 5.377 12.009 12.009 12.009zM7.254 5.737c0-1.616.348-3.15.973-4.531L7.316.794a12 12 0 0 0-1.062 4.943zM1.5 11.492A11.01 11.01 0 0 1 7.977 1.456L7.565.544C3.4 2.428.5 6.621.5 11.492zM12.509 22.5C6.429 22.5 1.5 17.571 1.5 11.492h-1C.5 18.124 5.876 23.5 12.509 23.5zm10.035-6.477A11.01 11.01 0 0 1 12.51 22.5v1c4.87 0 9.063-2.9 10.947-7.065z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
