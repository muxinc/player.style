'use client';

/*
 * Tailwind Audio for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/tailwind-audio/skin.css`.
 */
import {
  Container,
  type ContainerProps,
  Hotkey,
  MuteButton,
  PlaybackRateButton,
  PlayButton,
  SeekButton,
  Time,
  TimeSlider,
} from '@videojs/react';

export type TailwindAudioSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The Tailwind Audio theme around an `Audio`, inside a Video.js `AudioPlayer`.
 *
 * Below 448px a scrubber strip sits over an 80px bar of mute, back 10, play, forward 10 and rate; from 448px one
 * 64px rounded bar adds the elapsed time, an inline scrubber and the total time, with mute moved to the end.
 *
 * @example
 *   ```tsx
 *   import { Audio, AudioPlayer } from '@videojs/react/audio';
 *   import { TailwindAudioSkin } from '@player.style/tailwind-audio/react';
 *   import '@player.style/tailwind-audio/skin.css';
 *
 *   <AudioPlayer>
 *     <TailwindAudioSkin>
 *       <Audio src="episode.mp3" />
 *     </TailwindAudioSkin>
 *   </AudioPlayer>;
 *   ```;
 */
export function TailwindAudioSkin({ children, className, ...rest }: TailwindAudioSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-tailwind-audio', className)}
      data-theme="tailwind-audio"
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

      {/* Below 448px: a full-width scrubber strip above the bar. */}
      <TimeSlider.Root className="ps-range ps-strip-range">
        <TimeSlider.Track className="ps-track">
          <TimeSlider.Buffer className="ps-buffer" />
          <TimeSlider.Fill className="ps-fill" />
        </TimeSlider.Track>
        <TimeSlider.Thumb className="ps-thumb" />
        <TimeSlider.Preview className="ps-preview" overflow="clamp">
          <TimeSlider.Value className="ps-preview-time" type="pointer" />
        </TimeSlider.Preview>
      </TimeSlider.Root>

      <div className="ps-bar">
        <SeekButton className="ps-button ps-seek-button ps-seek-backward" seconds={-10}>
          <svg className="ps-icon ps-seek-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8 5L5 8M5 8L8 11M5 8H13.5C16.5376 8 19 10.4624 19 13.5C19 15.4826 18.148 17.2202 17 18.188" />
            <path d="M5 15V19" />
            <path d="M8 18V16C8 15.4477 8.44772 15 9 15H10C10.5523 15 11 15.4477 11 16V18C11 18.5523 10.5523 19 10 19H9C8.44772 19 8 18.5523 8 18Z" />
          </svg>
        </SeekButton>

        <PlayButton className="ps-button ps-play-button">
          <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
            />
          </svg>
          <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
            />
          </svg>
        </PlayButton>

        <SeekButton className="ps-button ps-seek-button ps-seek-forward" seconds={10}>
          <svg className="ps-icon ps-seek-icon" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M16 5L19 8M19 8L16 11M19 8H10.5C7.46243 8 5 10.4624 5 13.5C5 15.4826 5.85204 17.2202 7 18.188" />
            <path d="M13 15V19" />
            <path d="M16 18V16C16 15.4477 16.4477 15 17 15H18C18.5523 15 19 15.4477 19 16V18C19 18.5523 18.5523 19 18 19H17C16.4477 19 16 18.5523 16 18Z" />
          </svg>
        </SeekButton>

        {/* From 448px: a hairline, the elapsed time, the scrubber, and the total time. */}
        <div className="ps-divider" />

        <Time.Value className="ps-time ps-time-current" type="current" />

        <TimeSlider.Root className="ps-range ps-inline-range">
          <TimeSlider.Track className="ps-track">
            <TimeSlider.Buffer className="ps-buffer" />
            <TimeSlider.Fill className="ps-fill" />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="ps-thumb" />
          <TimeSlider.Preview className="ps-preview" overflow="clamp">
            <TimeSlider.Value className="ps-preview-time" type="pointer" />
          </TimeSlider.Preview>
        </TimeSlider.Root>

        <Time.Value className="ps-time ps-time-duration" type="duration" />

        <PlaybackRateButton className="ps-button ps-rate-button" />

        {/* First in the row below 448px, last from 448px. One speaker for high, medium and low, as the original. */}
        <MuteButton className="ps-button ps-mute-button">
          <svg className="ps-icon ps-icon-volume" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
          </svg>
          <svg className="ps-icon ps-icon-muted" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
          </svg>
        </MuteButton>
      </div>
    </Container>
  );
}
