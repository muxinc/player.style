'use client';

/*
 * Sutro Audio for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/sutro-audio/skin.css`.
 */
import {
  Container,
  type ContainerProps,
  Hotkey,
  MuteButton,
  PlaybackRateButton,
  PlayButton,
  Poster,
  SeekButton,
  Time,
  TimeSlider,
  Title,
} from '@videojs/react';
import type { ReactNode } from 'react';

export interface SutroAudioSkinProps extends ContainerProps {
  /** Shown under the title, as the original's `mediabyline`. The title comes from `AudioPlayer`'s `title`. */
  byline?: ReactNode;
}

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The Sutro Audio theme around an `Audio`, inside a Video.js `AudioPlayer`.
 *
 * Below 480px it is a stacked card (artwork, buttons, times with a small scrubber); from 480px one row with the
 * scrubber along the bottom edge. The artwork is the player's `poster`.
 *
 * @example
 *   ```tsx
 *   import { Audio, AudioPlayer } from '@videojs/react/audio';
 *   import { SutroAudioSkin } from '@player.style/sutro-audio/react';
 *   import '@player.style/sutro-audio/skin.css';
 *
 *   <AudioPlayer title="Episode 12" poster="artwork.jpg">
 *     <SutroAudioSkin byline="The Show">
 *       <Audio src="episode.mp3" />
 *     </SutroAudioSkin>
 *   </AudioPlayer>;
 *   ```;
 */
export function SutroAudioSkin({ children, className, byline, ...rest }: SutroAudioSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-sutro-audio', className)}
      data-theme="sutro-audio"
      data-preset="audio"
      {...rest}
    >
      {children}

      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-10} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />

      {/* Two blurred white blobs that light the card from either side. */}
      <svg className="ps-bg-shape ps-bg-shape-start" aria-hidden="true" viewBox="0 0 193 115">
        <path d="M50.117 51.13c-40.5-6.5-28 13.5-44 30.5-32.5 51.5 75 32.001 77 13.5 2-18.5 45-19.5 86-3.5 41 16.001 16.5-21 12.5-68s-37-14.5-66.5 16.5-24.5 17.5-65 11Z" />
      </svg>
      <svg className="ps-bg-shape ps-bg-shape-end" aria-hidden="true" viewBox="0 0 178 138">
        <path d="M26.386 103.374C-14.708 79.891-.175 60.583 18.869 34.491c43.6-58.446 66.15-36.529 139.819 20.352 73.668 56.88-88.202 102.802-73.668 74.623 14.533-28.18-17.54-2.61-58.634-26.092Z" />
      </svg>

      {/* Below 480px a stacked card (artwork, buttons, times); from 480px one row of three equal columns. */}
      <div className="ps-layout">
        <div className="ps-info">
          <div className="ps-artwork">
            <Poster.Root className="ps-poster">
              <Poster.Image className="ps-poster-image" alt="" decoding="async" />
            </Poster.Root>
            <div className="ps-artwork-gradient" />
          </div>
          <div className="ps-info-text">
            <Title className="ps-title" />
            {byline ? <span className="ps-byline">{byline}</span> : null}
          </div>
        </div>

        <div className="ps-bar">
          <PlaybackRateButton className="ps-button ps-rate-button" />

          <SeekButton className="ps-button ps-seek-backward" seconds={-10}>
            <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
              <path d="m10 13 3-3" />
              <path
                className="ps-seek-value"
                d="m11.88 16.08-.95 5.793H9.72l.76-4.631h-.033L9 18.074l.179-1.087 1.564-.908h1.137ZM14.12 22c-.48 0-.874-.119-1.18-.356-.308-.24-.518-.585-.63-1.036-.11-.45-.112-.993-.008-1.626.106-.632.288-1.17.545-1.616.259-.445.58-.783.96-1.015A2.441 2.441 0 0 1 15.101 16c.477 0 .87.117 1.177.35.307.235.517.573.631 1.016.116.444.121.982.017 1.616-.104.635-.286 1.178-.545 1.629-.259.449-.58.793-.964 1.033a2.412 2.412 0 0 1-1.296.356Zm.168-1.016c.33 0 .619-.167.867-.5.247-.334.426-.835.536-1.502.072-.438.088-.803.047-1.095-.039-.294-.127-.515-.265-.662a.698.698 0 0 0-.534-.22c-.325 0-.614.165-.866.497-.25.33-.428.823-.536 1.48-.073.445-.089.816-.048 1.114.041.296.13.519.269.668.138.147.314.22.53.22Z"
              />
              <path d="M19.277 22h2.017c.39 0 .706-.432.706-.964v-7.072c0-.532-.316-.964-.706-.964H10" />
            </svg>
          </SeekButton>

          {/* The play triangle scales in; the pause bars grow out of it (the original's keyframes). */}
          <PlayButton className="ps-button ps-play-button">
            <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
              <path
                className="ps-icon-play"
                d="M20.7131 14.6976C21.7208 15.2735 21.7208 16.7265 20.7131 17.3024L12.7442 21.856C11.7442 22.4274 10.5 21.7054 10.5 20.5536L10.5 11.4464C10.5 10.2946 11.7442 9.57257 12.7442 10.144L20.7131 14.6976Z"
              />
              <rect className="ps-pause-left" x="10.5" y="10.5" width="1em" height="11" rx="0.5" />
              <rect className="ps-pause-right" x="17.5" y="10.5" width="1em" height="11" rx="0.5" />
            </svg>
          </PlayButton>

          <SeekButton className="ps-button ps-seek-forward" seconds={10}>
            <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
              <path d="m22 13-3-3" />
              <path
                className="ps-seek-value"
                d="m17.88 16.08-.95 5.793h-1.21l.76-4.631h-.033L15 18.074l.179-1.087 1.564-.908h1.137ZM20.12 22c-.48 0-.874-.119-1.18-.356-.308-.24-.518-.585-.63-1.036-.11-.45-.112-.993-.008-1.626.106-.632.288-1.17.545-1.616.259-.445.58-.783.96-1.015A2.441 2.441 0 0 1 21.101 16c.477 0 .87.117 1.177.35.307.235.517.573.631 1.016.116.444.121.982.017 1.616-.104.635-.286 1.178-.545 1.629-.259.449-.58.793-.964 1.033a2.412 2.412 0 0 1-1.296.356Zm.168-1.016c.33 0 .619-.167.866-.5.248-.334.427-.835.537-1.502.073-.438.088-.803.047-1.095-.039-.294-.127-.515-.265-.662a.698.698 0 0 0-.534-.22c-.326 0-.614.165-.866.497-.25.33-.428.823-.536 1.48-.073.445-.088.816-.048 1.114.041.296.13.519.269.668.137.147.314.22.53.22Z"
              />
              <path d="M12.723 22h-2.017c-.39 0-.706-.432-.706-.964v-7.072c0-.532.316-.964.706-.964H22" />
            </svg>
          </SeekButton>

          {/* One speaker; the waves fade and the cross wipes in by volume level. */}
          <MuteButton className="ps-button ps-mute-button">
            <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
              <path d="M16.5 20.486v-8.972c0-1.537-2.037-2.08-2.802-.745l-1.026 1.79a2.5 2.5 0 0 1-.8.85l-1.194.78A1.5 1.5 0 0 0 10 15.446v1.11c0 .506.255.978.678 1.255l1.194.782a2.5 2.5 0 0 1 .8.849l1.026 1.79c.765 1.334 2.802.792 2.802-.745Z" />
              <path
                className="ps-vol-wave ps-vol-low"
                d="M18.5 18C19.6046 18 20.5 17.1046 20.5 16C20.5 14.8954 19.6046 14 18.5 14"
              />
              <path
                className="ps-vol-wave ps-vol-high"
                d="M18 21C20.7614 21 23 18.7614 23 16C23 13.2386 20.7614 11 18 11"
              />
              <path className="ps-muted-cross ps-muted-cross-first" d="M23 18L19 14" />
              <path className="ps-muted-cross ps-muted-cross-second" d="M23 14L19 18" />
            </svg>
          </MuteButton>
        </div>

        {/* Elapsed and total time; below 480px the small scrubber sits between them. */}
        <div className="ps-times">
          <Time.Value className="ps-time ps-time-current" type="current" />
          <TimeSlider.Root className="ps-range ps-small-range">
            <TimeSlider.Track className="ps-track">
              <TimeSlider.Buffer className="ps-buffer" />
              <TimeSlider.Fill className="ps-fill" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="ps-thumb" />
          </TimeSlider.Root>
          <Time.Value className="ps-time ps-time-duration" type="duration" />
        </div>
      </div>

      {/* From 480px the scrubber runs along the card's bottom edge, with the preview time above the pointer. */}
      <TimeSlider.Root className="ps-range ps-big-range">
        <TimeSlider.Track className="ps-track">
          <TimeSlider.Buffer className="ps-buffer" />
          <TimeSlider.Fill className="ps-fill" />
        </TimeSlider.Track>
        <TimeSlider.Thumb className="ps-thumb" />
        <TimeSlider.Preview className="ps-preview" overflow="clamp">
          <TimeSlider.Value className="ps-preview-time" type="pointer" />
        </TimeSlider.Preview>
      </TimeSlider.Root>
    </Container>
  );
}
