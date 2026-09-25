'use client';

import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';

import { isAudioSkin, isFixedSizeSkin, type Skin, type UseCase } from '@/lib/skins';

import SkinPreview from './SkinPreview';
import { focusRing } from './ui';

const MIN_WIDTH = 320;

type SkinHeroProps = {
  skin: Skin;
  /** The use case the page's picker holds, for a third-party skin that covers several. */
  useCase?: UseCase;
};

const BACKDROPS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

/**
 * The large preview: a resizable stage on a light or dark backdrop, so the skin can be judged on either. The backdrop
 * is a local preview control and does not follow the site theme.
 */
export default function SkinHero({ skin, useCase }: SkinHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [percent, setPercent] = useState(100);
  const [dark, setDark] = useState(true);
  const sliderId = useId();
  const audio = isAudioSkin(skin);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStageWidth(entry.contentRect.width);
    });
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const minPercent = stageWidth ? Math.min(100, Math.ceil((MIN_WIDTH / stageWidth) * 100)) : 0;
  const widthPx = stageWidth ? Math.round((stageWidth * percent) / 100) : undefined;
  const scheme = dark ? 'dark' : 'light';

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-xl corner-squircle border border-line shadow-sm',
        dark ? 'bg-faded-black text-manila-light dark:bg-black' : 'bg-white text-faded-black'
      )}
    >
      <div
        ref={stageRef}
        className={clsx(
          'mx-auto flex w-full max-w-5xl items-center justify-center px-3 py-6 sm:px-6 md:py-10',
          audio && 'min-h-72',
          // As on the card: a centred fixed-size skin needs the stage's full width on a 320px phone.
          isFixedSizeSkin(skin) && 'max-sm:px-0'
        )}
      >
        <div
          className="max-w-full"
          style={{ width: `${percent}%`, minWidth: Math.min(MIN_WIDTH, stageWidth || MIN_WIDTH) }}
        >
          <SkinPreview skin={skin} useCase={useCase} preload="metadata" colorScheme={scheme} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-current/15 px-4 py-3">
        <div className="flex items-center gap-3">
          <label htmlFor={sliderId} className="text-p3 font-semibold">
            Width
          </label>
          <input
            id={sliderId}
            type="range"
            min={minPercent}
            max={100}
            step={1}
            value={percent}
            disabled={minPercent >= 100}
            onChange={(event) => setPercent(Number(event.currentTarget.value))}
            aria-valuetext={widthPx ? `${widthPx} pixels` : undefined}
            className={clsx('range-accent rounded-full', focusRing)}
          />
          <output htmlFor={sliderId} className="text-p3 min-w-14 font-mono tabular-nums">
            {widthPx ? `${widthPx}px` : ''}
          </output>
        </div>
        <div
          className="corner-squircle grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-current/20 p-1"
          role="group"
          aria-label="Backdrop"
        >
          {BACKDROPS.map((backdrop) => {
            const pressed = (backdrop.value === 'dark') === dark;

            return (
              <button
                key={backdrop.value}
                type="button"
                aria-pressed={pressed}
                onClick={() => setDark(backdrop.value === 'dark')}
                className={clsx(
                  'cursor-pointer rounded-md corner-squircle px-3 py-1 text-p3 leading-tight select-none',
                  focusRing,
                  pressed ? 'bg-current/15 font-semibold' : 'opacity-70 intent:opacity-100'
                )}
              >
                {backdrop.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
