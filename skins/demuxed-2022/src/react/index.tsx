'use client';

/*
 * Demuxed 2022 for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/demuxed-2022/skin.css`.
 */
import {
  AirPlayButton,
  CaptionsButton,
  CastButton,
  Container,
  type ContainerProps,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  MuteButton,
  PiPButton,
  PlayButton,
  Poster,
  Slider,
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type Demuxed2022SkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/** The play and pause glyphs, shared by the big centred button and the one in the bar. */
function PlayGlyphs() {
  return (
    <>
      <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 16 16">
        <path d="M13.6 7.2 5.1 3c-.6-.3-1.2.1-1.2.7v8.5c0 .6.7 1 1.2.7l8.5-4.2c.6-.3.6-1.1 0-1.5z" />
      </svg>
      <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 16 16">
        <path d="M11.8 14c-.5 0-.9-.4-.9-.9V2.9c0-.5.4-.9.9-.9s.9.4.9.9v10.2c0 .5-.4.9-.9.9zM4.1 14c-.5 0-.9-.4-.9-.9V2.9c0-.5.4-.9.9-.9s.9.4.9.9v10.2c-.1.5-.5.9-.9.9z" />
      </svg>
    </>
  );
}

/**
 * The Demuxed 2022 theme around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { Demuxed2022Skin } from '@player.style/demuxed-2022/react';
 *   import '@player.style/demuxed-2022/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <Demuxed2022Skin>
 *       <Video src="video.mp4" />
 *     </Demuxed2022Skin>
 *   </VideoPlayer>;
 *   ```;
 */
export function Demuxed2022Skin({ children, className, ...rest }: Demuxed2022SkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-demuxed-2022', className)}
      data-theme="demuxed-2022"
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

      <Controls.Root>
        <Controls.Content className="ps-layer">
          {/* Top chrome: Cast and AirPlay in the top-right corner (row-reversed, so Cast sits rightmost). */}
          <div className="ps-top">
            <CastButton className="ps-button ps-cast-button">
              <svg className="ps-icon ps-icon-cast" aria-hidden="true" viewBox="0 0 26 26">
                <path d="M2.5 18.5v3h3c0-1.7-1.34-3-3-3ZM2.5 14.5v2c2.76 0 5 2.2 5 5h2c0-3.87-3.13-7-7-7Z" />
                <path d="M2.5 10.5v2c4.97 0 9 4 9 9h2c0-6.08-4.93-11-11-11Z" />
                <path d="M22.5 3.5h-18c-1.1 0-2 .9-2 2v3h2v-3h18v14h-7v2h7c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2Z" />
              </svg>
            </CastButton>
            <AirPlayButton className="ps-button ps-airplay-button">
              <svg className="ps-icon ps-icon-airplay" aria-hidden="true" viewBox="0 0 23 23">
                <path d="M20.88 3.5H2.62a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4l1.73-2h-4v-11h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V4.37a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z" />
              </svg>
            </AirPlayButton>
          </div>

          {/* The big round play button, a little above the middle of the frame. */}
          <div className="ps-center">
            <PlayButton className="ps-play-button ps-big-play">
              <PlayGlyphs />
            </PlayButton>
          </div>

          {/* The theme's bottom scrim: a 1×170 PNG gradient, inlined as the original inlined it. */}
          <div className="ps-gradient" />

          {/* A translucent pill inset 30px from the edges; flat and full-width below 600px. */}
          <div className="ps-bar">
            <PlayButton className="ps-button ps-play-button ps-bar-play">
              <PlayGlyphs />
            </PlayButton>

            <div className="ps-volume">
              <MuteButton className="ps-button ps-mute-button">
                <svg className="ps-icon ps-icon-volume-off" aria-hidden="true" viewBox="0 0 16 16">
                  <path
                    d="M7 2.2 4.2 5.1v.1H1.4c-.5 0-.9.4-.9.9V10c0 .5.4.9.9.9h2.8L7 13.8c.3.3.8.1.8-.3v-11c0-.4-.5-.6-.8-.3ZM13.4 8l2-2"
                    fillRule="nonzero"
                  />
                  <path d="M15.622 5.479a.606.606 0 0 1 0 .857l-4.286 4.286a.606.606 0 1 1-.857-.857l4.286-4.286a.606.606 0 0 1 .857 0Z" />
                  <path d="M10.479 5.479a.606.606 0 0 0 0 .857l4.286 4.286a.606.606 0 1 0 .857-.857l-4.286-4.286a.606.606 0 0 0-.857 0Z" />
                </svg>
                <svg className="ps-icon ps-icon-volume-low" aria-hidden="true" viewBox="0 0 16 16">
                  <path d="m7.1 2.2-2.8 3H1.5c-.5 0-.9.4-.9.9V10c0 .5.4.9.9.9h2.8l2.8 2.9c.3.3.8.1.8-.3v-11c0-.4-.5-.6-.8-.3zM10.3 11.4c-.2 0-.3-.1-.4-.2-.3-.3-.3-.6 0-.9.6-.6 1-1.4 1-2.3s-.4-1.6-1-2.3c-.3-.3-.3-.6 0-.9.3-.3.6-.3.9 0 .9.8 1.4 2 1.4 3.2s-.5 2.3-1.4 3.2c-.2.2-.4.2-.5.2z" />
                </svg>
                {/* The original draws `medium` and `high` with the same artwork. */}
                <svg className="ps-icon ps-icon-volume-high" aria-hidden="true" viewBox="0 0 16 16">
                  <path d="m7.1 2.2-2.8 3H1.5c-.5 0-.9.4-.9.9V10c0 .5.4.9.9.9h2.8l2.8 2.9c.3.3.8.1.8-.3v-11c0-.4-.5-.6-.8-.3zM12.6 13.8c-.2 0-.3-.1-.4-.2-.3-.3-.3-.6 0-.9 1.3-1.2 2-2.8 2-4.5s-.7-3.3-2-4.5c-.3-.3-.3-.6 0-.9.3-.3.6-.3.9 0 1.5 1.5 2.3 3.4 2.3 5.4 0 2.1-.8 4-2.3 5.4-.2.1-.4.2-.5.2z" />
                  <path d="M10.3 11.4c-.2 0-.3-.1-.4-.2-.3-.3-.3-.6 0-.9.6-.6 1-1.4 1-2.3s-.4-1.6-1-2.3c-.3-.3-.3-.6 0-.9.3-.3.6-.3.9 0 .9.8 1.4 2 1.4 3.2s-.5 2.3-1.4 3.2c-.2.2-.4.2-.5.2z" />
                </svg>
              </MuteButton>

              {/* A vertical pill above the mute button, shown while either is hovered or focused. */}
              <div className="ps-volume-range">
                <VolumeSlider.Root className="ps-volume-slider" orientation="vertical">
                  <VolumeSlider.Track className="ps-volume-track">
                    <VolumeSlider.Fill className="ps-volume-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-thumb ps-volume-thumb" />
                </VolumeSlider.Root>
              </div>
            </div>

            <Time.Group className="ps-time">
              <Time.Value className="ps-time-value" type="current" />
              <Time.Separator className="ps-time-separator"> / </Time.Separator>
              <Time.Value className="ps-time-value" type="duration" />
            </Time.Group>

            {/* The box media-chrome's range took, 10px gaps included; the slider itself spans the track only. */}
            <div className="ps-range">
              <TimeSlider.Root className="ps-time-slider">
                <TimeSlider.Track className="ps-track">
                  <TimeSlider.Buffer className="ps-buffer" />
                  <TimeSlider.Fill className="ps-fill" />
                </TimeSlider.Track>
                <TimeSlider.Thumb className="ps-thumb ps-time-thumb" />
                <TimeSlider.Preview className="ps-preview" overflow="clamp">
                  <Slider.Thumbnail.Root className="ps-thumbnail">
                    <Slider.Thumbnail.Image />
                  </Slider.Thumbnail.Root>
                  <TimeSlider.Value className="ps-preview-time" type="pointer" />
                </TimeSlider.Preview>
              </TimeSlider.Root>
            </div>

            <CaptionsButton className="ps-button ps-captions-button">
              <svg className="ps-icon ps-icon-captions-off" aria-hidden="true" viewBox="0 0 16 16">
                <path d="M12.6 13.7H3.4C2 13.7.8 12.6.8 11.1V4.9c0-1.4 1.1-2.6 2.6-2.6h9.3c1.4 0 2.6 1.1 2.6 2.6v6.2c-.1 1.5-1.3 2.6-2.7 2.6z" />
                <path
                  fill="#fff"
                  d="M4.7 8H3.2c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h1.5c.2 0 .4.2.4.4s-.2.4-.4.4zM12.5 8H6.7c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h5.7c.2 0 .4.2.4.4s-.1.4-.3.4zM7.7 10.2H3.2c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h4.6c.2 0 .4.2.4.4-.1.2-.3.4-.5.4zM12.5 10.2H9.8c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h2.7c.2 0 .4.2.4.4s-.2.4-.4.4z"
                />
              </svg>
              <svg className="ps-icon ps-icon-captions-on" aria-hidden="true" viewBox="0 0 16 16">
                <path d="M4.7 8H3.2c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h1.5c.2 0 .4.2.4.4s-.2.4-.4.4zM12.5 8H6.7c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h5.7c.2 0 .4.2.4.4s-.1.4-.3.4zM7.7 10.2H3.2c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h4.6c.2 0 .4.2.4.4-.1.2-.3.4-.5.4zM12.5 10.2H9.8c-.2 0-.4-.2-.4-.4s.2-.4.4-.4h2.7c.2 0 .4.2.4.4s-.2.4-.4.4z" />
              </svg>
            </CaptionsButton>

            {/* The original's enter and exit artwork is identical, so one glyph serves both states. */}
            <PiPButton className="ps-button ps-pip-button">
              <svg className="ps-icon ps-icon-pip" aria-hidden="true" viewBox="0 0 16 16">
                <path d="M14.2 13.1H1.8c-.4 0-.7-.3-.7-.7V3.5c0-.4.3-.7.7-.7h12.3c.4 0 .7.3.7.7v8.9c.1.5-.2.7-.6.7zM2.5 11.8h11V4.3h-11v7.5z" />
                <path d="M7.2 7.3h5.1v3.1H7.2z" />
              </svg>
            </PiPButton>

            {/* Same here: one glyph for entering and leaving fullscreen. */}
            <FullscreenButton className="ps-button ps-fullscreen-button">
              <svg className="ps-icon ps-icon-fullscreen" aria-hidden="true" viewBox="0 0 16 16">
                <path d="M2.9 6.6c-.4 0-.7-.3-.7-.7v-3c0-.4.3-.7.7-.7h3c.4 0 .7.3.7.7s-.2.7-.6.7H3.6V6c0 .3-.3.6-.7.6zM13.1 6.6c-.4 0-.7-.3-.7-.7V3.6H10c-.4 0-.7-.3-.7-.7s.3-.7.7-.7h3c.4 0 .7.3.7.7v3c.1.4-.2.7-.6.7zM6 13.8H3c-.4 0-.7-.3-.7-.7v-3c0-.4.3-.7.7-.7.4 0 .7.3.7.7v2.4H6c.4 0 .7.3.7.7-.1.3-.4.6-.7.6zM13.1 13.8h-3c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7h2.4V10c0-.4.3-.7.7-.7.4 0 .7.3.7.7v3c-.1.5-.4.8-.8.8z" />
              </svg>
            </FullscreenButton>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
