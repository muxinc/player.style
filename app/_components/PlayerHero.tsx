'use client';

import HlsVideo from 'hls-video-element/react';
import MediaTheme from '@/app/_components/MediaTheme';
import { FormEvent, useEffect, useRef, useState } from 'react';

type PlayerHeroProps = {
  theme: any;
  params: any;
};

const MIN_PLAYER_WIDTH = 200;

export default function PlayerHero(props: PlayerHeroProps) {
  const { theme } = props;

  const container = useRef<HTMLDivElement>(null);
  const playerView = useRef<HTMLDivElement>(null);

  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState('100%');
  const [isLightMode, setLightMode] = useState(false);

  useEffect(() => {
    const onWindowResize = () => {
      if (!playerView.current?.offsetWidth) return;
      setMinWidth(MIN_PLAYER_WIDTH / playerView.current?.offsetWidth * 100);
    };

    globalThis.addEventListener('resize', onWindowResize);

    return () => {
      globalThis.removeEventListener('resize', onWindowResize);
    };
  }, [playerView.current]);

  const onInput = (event: FormEvent<HTMLInputElement>) => {
    setWidth(`${parseInt(event.currentTarget.value, 10)}%`);
  };

  const toggleLightMode = () => {
    setLightMode(!isLightMode);
  };

  return (
    <>
      <div
        ref={container}
        className={
          isLightMode
            ? 'set-bg-ctx-putty-light set-border-ctx-gray text-black'
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
            <div className="aspect-video flex items-center justify-center dark">
              <div ref={playerView} style={{ width, minWidth: 200, maxWidth: '100%' }}>
                <MediaTheme name={props.params.slug} theme={theme}>
                  <HlsVideo
                    suppressHydrationWarning
                    className="aspect-video block w-full"
                    slot="media"
                    src="https://stream.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008.m3u8"
                    poster="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/thumbnail.webp?time=52"
                    crossOrigin="anonymous"
                  >
                    <track
                      label="thumbnails"
                      default
                      kind="metadata"
                      src="https://image.mux.com/Sc89iWAyNkhJ3P1rQ02nrEdCFTnfT01CZ2KmaEcxXfB008/storyboard.vtt"
                    />
                  </HlsVideo>
                </MediaTheme>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-y -mt-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-ctx border-ctx z-10">
          <div className="col-start-2 col-end-3 border-x border-ctx flex justify-between p-1">
            <div className="flex">
              <label htmlFor="player-size" className="mr-0.5">
                Size
              </label>
              <input
                type="range"
                id="player-size"
                min={minWidth}
                max="100"
                defaultValue="100"
                onInput={onInput}
              />
            </div>
            <div className="flex gap-0.5">
              <button onClick={toggleLightMode}>
                {isLightMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
