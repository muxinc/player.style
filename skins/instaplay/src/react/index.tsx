'use client';

/*
 * Instaplay for Video.js 10, React edition.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import `@player.style/instaplay/skin.css`.
 */
import {
  Container,
  type ContainerProps,
  Controls,
  ErrorDialog,
  Gesture,
  Hotkey,
  MuteButton,
  PlayButton,
  Poster,
  Slider,
  TimeSlider,
} from '@videojs/react';

export type InstaplaySkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The Instaplay theme around a `Video`, inside a Video.js `VideoPlayer`. The player takes the shape of the media, so
 * portrait video gives a portrait player.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { InstaplaySkin } from '@player.style/instaplay/react';
 *   import '@player.style/instaplay/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <InstaplaySkin>
 *       <Video src="video.mp4" />
 *     </InstaplaySkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function InstaplaySkin({ children, className, ...rest }: InstaplaySkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-instaplay', className)}
      data-theme="instaplay"
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
      <Hotkey keys="ArrowLeft" action="seekStep" value={-10} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />

      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
          <ErrorDialog.Close className="ps-dialog-close">Dismiss</ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      {/* The theme's one big affordance: a round play button in the middle, shown only while paused. */}
      <PlayButton className="ps-button ps-play-button">
        <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </PlayButton>

      {/* A mute button in the bottom-right corner above a hairline scrubber on the bottom edge; neither auto-hides. */}
      <Controls.Root>
        <Controls.Content className="ps-chrome">
          <div className="ps-bar">
            <MuteButton className="ps-button ps-mute-button">
              <svg className="ps-icon ps-icon-volume-high" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z" />
              </svg>
              <svg className="ps-icon ps-icon-volume-low" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z" />
              </svg>
              <svg className="ps-icon ps-icon-volume-off" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z" />
              </svg>
            </MuteButton>
          </div>

          <TimeSlider.Root className="ps-range">
            <TimeSlider.Track className="ps-track">
              <TimeSlider.Buffer className="ps-buffer" />
              <TimeSlider.Fill className="ps-fill" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="ps-thumb" />
            <TimeSlider.Preview className="ps-preview" overflow="clamp">
              <Slider.Thumbnail.Root className="ps-thumbnail">
                <Slider.Thumbnail.Image />
              </Slider.Thumbnail.Root>
              <TimeSlider.Value className="ps-preview-time" type="pointer" />
            </TimeSlider.Preview>
          </TimeSlider.Root>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
