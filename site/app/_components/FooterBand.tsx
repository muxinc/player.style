'use client';

import clsx from 'clsx';
import { useEffect, useRef } from 'react';

/** A new wheel gesture is one that follows a pause this long; a fast scroll landing on the end must not pull. */
const GESTURE_GAP_MS = 250;
const RELEASE_DELAY_MS = 180;

/**
 * Amplified overscroll, as on the Video.js 10 site: a trackpad's rubber band only moves a few pixels and Chrome has
 * none, so at the end of the page wheel deltas slide the page up over the pinned bars, and it springs back when the
 * gesture stops. Touch devices keep the browser's own rubber band, which already reveals them.
 */
function useOverscrollReveal(reveal: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let offset = 0;
    let lastWheelAt = 0;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const page = () => document.querySelector<HTMLElement>('[data-overscroll-page]');
    const atPageEnd = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;

    const release = () => {
      const target = page();
      if (!target) return;

      offset = 0;
      target.style.transition = 'transform 600ms var(--ease-soft)';
      target.style.transform = '';
    };

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      const freshGesture = now - lastWheelAt > GESTURE_GAP_MS;
      lastWheelAt = now;

      const pulling = event.deltaY > 0 && atPageEnd() && (freshGesture || offset > 0);
      if (!pulling && offset === 0) return;

      const target = page();
      const max = reveal.current?.offsetHeight;
      if (!target || !max) return;

      // Ease off as the bars come fully into view so the pull feels elastic rather than linear.
      const resistance = 1 - (offset / max) * 0.6;
      offset = Math.min(max, Math.max(0, offset + event.deltaY * resistance));
      target.style.transition = 'none';
      target.style.transform = offset ? `translate3d(0, ${-offset}px, 0)` : '';

      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(release, RELEASE_DELAY_MS);
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(releaseTimer);
    };
  }, [reveal]);
}

/**
 * The five stacked brand bars from the Video.js 10 site, pinned behind the page so they only show when it overscrolls.
 * The page wrapper marked `data-overscroll-page` must be opaque and stacked above this. Dark mode shifts the run one
 * step.
 */
export default function FooterBand({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useOverscrollReveal(ref);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx('fixed inset-x-0 bottom-0 grid h-52', className)}
      style={{ gridTemplateRows: '80fr 60fr 45fr 20fr 10fr' }}
    >
      <div className="bg-bright-yellow dark:bg-gold" />
      <div className="bg-gold dark:bg-orange" />
      <div className="bg-orange dark:bg-red" />
      <div className="bg-red dark:bg-magenta" />
      <div className="bg-magenta dark:bg-magenta-dark" />
    </div>
  );
}
