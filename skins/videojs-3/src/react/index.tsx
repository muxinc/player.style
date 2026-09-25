'use client';

/*
 * Video.js 3 for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, in the same order. Every icon
 * is a span painted from the original 3.2 sprite, which the stylesheet inlines. The shared stylesheet is not imported
 * here so the component stays CSS-agnostic; consumers import `@player.style/videojs-3/skin.css`.
 */
import {
  BufferingIndicator,
  CaptionsButton,
  Container,
  type ContainerProps,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  MuteButton,
  PlayButton,
  Poster,
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type Videojs3SkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The 2011 Video.js 3 default skin around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { Videojs3Skin } from '@player.style/videojs-3/react';
 *   import '@player.style/videojs-3/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <Videojs3Skin>
 *       <Video src="video.mp4" />
 *     </Videojs3Skin>
 *   </VideoPlayer>;
 *   ```;
 */
export function Videojs3Skin({ children, className, ...rest }: Videojs3SkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-videojs-3', className)}
      data-theme="videojs-3"
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
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-5} />
      <Hotkey keys="ArrowRight" action="seekStep" value={5} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />

      {/* Eight white balls in a ring, fading from 1 to .12, stepped round 45 degrees at a time. */}
      <BufferingIndicator className="ps-loading" delay={0}>
        <span className="ps-spinner">
          <span className="ps-ball ps-ball-1" />
          <span className="ps-ball ps-ball-2" />
          <span className="ps-ball ps-ball-3" />
          <span className="ps-ball ps-ball-4" />
          <span className="ps-ball ps-ball-5" />
          <span className="ps-ball ps-ball-6" />
          <span className="ps-ball ps-ball-7" />
          <span className="ps-ball ps-ball-8" />
        </span>
      </BufferingIndicator>

      {/* The big play button: shown until the first play and again at the end. */}
      <PlayButton className="ps-big-play">
        <span className="ps-big-play-icon" />
      </PlayButton>

      {/* 3.x had no error display; this one wears its menu popup. */}
      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
          <ErrorDialog.Close className="ps-dialog-close">Dismiss</ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      <Controls.Root>
        {/* The 26px glossy bar; the time readouts and the progress row sit on top of it as a strip of their own. */}
        <Controls.Content className="ps-bar">
          <PlayButton className="ps-control ps-play-control">
            <span className="ps-icon" />
          </PlayButton>

          <div className="ps-time-control ps-current-time">
            <Time.Value className="ps-time-value" type="current" />
          </div>
          {/* Hidden as in 3.x; it only tells the stylesheet how the remaining time is padded. */}
          <div className="ps-time-control ps-duration">
            <Time.Value className="ps-time-value ps-duration-value" type="duration" />
          </div>
          <div className="ps-time-control ps-remaining-time">
            <span className="ps-remaining-display">
              <Time.Value className="ps-time-value ps-remaining-value" type="remaining" negativeSign="" />
            </span>
          </div>

          {/*
           * The progress row. The slider box is the holder less half the handle at each end, where 3.x measured the
           * pointer; the track reaches back out to the holder's full width.
           */}
          <div className="ps-progress-control">
            <TimeSlider.Root className="ps-progress-holder">
              <TimeSlider.Track className="ps-progress-track">
                <TimeSlider.Buffer className="ps-load-progress" />
              </TimeSlider.Track>
              <TimeSlider.Fill className="ps-play-progress" />
              <TimeSlider.Thumb className="ps-seek-handle" />
            </TimeSlider.Root>
          </div>

          <CaptionsButton className="ps-menu-button ps-captions-button">
            <span className="ps-icon" />
          </CaptionsButton>

          <MuteButton className="ps-control ps-mute-control">
            <span className="ps-icon" />
          </MuteButton>

          <div className="ps-volume-control">
            <VolumeSlider.Root className="ps-volume-bar">
              <VolumeSlider.Track className="ps-volume-track" />
              <VolumeSlider.Fill className="ps-volume-level" />
              <VolumeSlider.Thumb className="ps-volume-handle" />
            </VolumeSlider.Root>
          </div>

          <FullscreenButton className="ps-control ps-fullscreen-control">
            <span className="ps-icon" />
          </FullscreenButton>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
