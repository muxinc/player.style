'use client';

import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';

import { isAudioSkin, type Skin } from '@/lib/skins';

import SkinPreview from './SkinPreview';

const MIN_WIDTH = 320;

type SkinHeroProps = {
  skin: Skin;
};

/** The large preview: a resizable stage on a light or dark backdrop, so the skin can be judged on either. */
export default function SkinHero({ skin }: SkinHeroProps) {
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
    <div className={clsx(dark ? 'bg-charcoal text-white' : 'bg-white text-black')}>
      <div
        ref={stageRef}
        className={clsx(
          'mx-auto flex w-full max-w-40 items-center justify-center px-0.5 py-1 sm:px-1 md:py-2',
          audio && 'min-h-9'
        )}
      >
        <div
          className="max-w-full"
          style={{ width: `${percent}%`, minWidth: Math.min(MIN_WIDTH, stageWidth || MIN_WIDTH) }}
        >
          <SkinPreview skin={skin} preload="metadata" colorScheme={scheme} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-0.5 border-t border-current/20 px-1 py-0.5">
        <div className="flex items-center gap-0.5">
          <label htmlFor={sliderId} className="font-mono text-sm uppercase">
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
          />
          <output htmlFor={sliderId} className="font-mono text-sm tabular-nums">
            {widthPx ? `${widthPx}px` : ''}
          </output>
        </div>
        <div className="flex items-center gap-0.25" role="group" aria-label="Backdrop">
          <button
            type="button"
            aria-pressed={!dark}
            onClick={() => setDark(false)}
            className={clsx(
              'rounded-full border px-0.5 py-[3px] font-mono text-xs uppercase',
              !dark ? 'border-current' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            Light
          </button>
          <button
            type="button"
            aria-pressed={dark}
            onClick={() => setDark(true)}
            className={clsx(
              'rounded-full border px-0.5 py-[3px] font-mono text-xs uppercase',
              dark ? 'border-current' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
