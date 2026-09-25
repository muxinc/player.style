'use client';

/*
 * Video.js 1 for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/videojs-1/skin.css`.
 */
import {
  BufferingIndicator,
  Container,
  type ContainerProps,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  PlayButton,
  Poster,
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type Videojs1SkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The original 2010 Video.js skin around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { Videojs1Skin } from '@player.style/videojs-1/react';
 *   import '@player.style/videojs-1/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <Videojs1Skin>
 *       <Video src="video.mp4" />
 *     </Videojs1Skin>
 *   </VideoPlayer>;
 *   ```;
 */
export function Videojs1Skin({ children, className, ...rest }: Videojs1SkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-videojs-1', className)}
      data-theme="videojs-1"
      data-preset="video"
      {...rest}
    >
      {children}

      <Poster.Root className="ps-poster">
        <Poster.Image className="ps-poster-image" alt="" decoding="async" />
      </Poster.Root>

      <Gesture type="tap" action="togglePaused" pointer="mouse" />
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-5} />
      <Hotkey keys="ArrowRight" action="seekStep" value={5} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />

      {/* Eight dots growing and brightening round the circle, a comet tail stepped 45 degrees at a time. */}
      <BufferingIndicator className="ps-spinner" delay={0}>
        <svg className="ps-spinner-icon" aria-hidden="true" viewBox="0 0 100 100">
          <circle cx="51" cy="11" r="1.05" strokeWidth="0.1" opacity="0.12" />
          <circle cx="79.28" cy="22.72" r="2.1" strokeWidth="0.2" opacity="0.25" />
          <circle cx="91" cy="51" r="4.2" strokeWidth="0.4" opacity="0.37" />
          <circle cx="79.28" cy="79.28" r="6.3" strokeWidth="0.6" opacity="0.5" />
          <circle cx="51" cy="91" r="8.4" strokeWidth="0.8" opacity="0.62" />
          <circle cx="22.72" cy="79.28" r="10.5" strokeWidth="1" opacity="0.75" />
          <circle cx="11" cy="51" r="11.55" strokeWidth="1.1" opacity="0.87" />
          <circle cx="22.72" cy="22.72" r="13.65" strokeWidth="1.3" opacity="1" />
        </svg>
      </BufferingIndicator>

      {/* The big play button: shown until the first play and again at the end. */}
      <PlayButton className="ps-big-play-button">
        <svg className="ps-big-play-icon" aria-hidden="true" viewBox="0 0 80 80">
          <path d="M23 20 63 40 23 60Z" />
        </svg>
      </PlayButton>

      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
          <ErrorDialog.Close className="ps-pill ps-dialog-close">Dismiss</ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      <Controls.Root>
        {/* A transparent strip along the bottom holding separate floating pills. */}
        <Controls.Content className="ps-bar">
          <PlayButton className="ps-pill ps-play-button">
            <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 25 25">
              <path d="M8 8 18 13 8 18Z" />
            </svg>
            <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 25 25">
              <path d="M8 8h3v10H8Zm6 0h3v10h-3Z" />
            </svg>
          </PlayButton>

          {/* Progress and time are one pill: the original squared off the corners where its two pills met. */}
          <div className="ps-pill ps-progress">
            <TimeSlider.Root className="ps-progress-slider">
              <TimeSlider.Track className="ps-progress-track">
                <TimeSlider.Buffer className="ps-progress-buffer" />
                <TimeSlider.Fill className="ps-progress-fill" />
              </TimeSlider.Track>
              {/* The original had no handle; the thumb stays for keyboard access and draws nothing. */}
              <TimeSlider.Thumb className="ps-progress-thumb" />
            </TimeSlider.Root>

            <Time.Group className="ps-time">
              <Time.Value className="ps-time-value ps-time-current" type="current" />
              <Time.Separator className="ps-time-separator"> / </Time.Separator>
              <Time.Value className="ps-time-value ps-time-duration" type="duration" />
            </Time.Group>
          </div>

          {/* Six stepped bars in place of a mute button: the volume slider, masked to the bar shapes. */}
          <div className="ps-pill ps-volume">
            <VolumeSlider.Root className="ps-volume-slider">
              <VolumeSlider.Track className="ps-volume-track">
                <VolumeSlider.Fill className="ps-volume-fill" />
              </VolumeSlider.Track>
              <VolumeSlider.Thumb className="ps-volume-thumb" />
            </VolumeSlider.Root>
          </div>

          <FullscreenButton className="ps-pill ps-fullscreen-button">
            <svg className="ps-icon ps-icon-fs-enter" aria-hidden="true" viewBox="0 0 25 25">
              <path d="M5 5h6l-6 6Zm9 0h6v6Zm-9 9 6 6H5Zm15 0v6h-6Z" />
            </svg>
            <svg className="ps-icon ps-icon-fs-exit" aria-hidden="true" viewBox="0 0 25 25">
              <path d="M11 5v6H5Zm3 0 6 6h-6Zm-9 9h6v6Zm9 0h6l-6 6Z" />
            </svg>
          </FullscreenButton>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
