'use client';

/*
 * Media Chrome for live video on Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The stylesheet
 * is @player.style/media-chrome's and is not imported here; consumers import `@player.style/media-chrome-live/skin.css`.
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
  LiveButton,
  MuteButton,
  PiPButton,
  PlayButton,
  Poster,
  Tooltip,
  VolumeSlider,
} from '@videojs/react';
import type { ReactElement } from 'react';

export type MediaChromeLiveSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * A control-bar button with media-chrome's tooltip: `off` is the text for the button's resting state, `on` the text
 * while its state is active (playing, muted, captions on, picture-in-picture, fullscreen).
 */
function WithTooltip({
  children,
  className,
  off,
  on,
}: {
  children: ReactElement;
  className?: string;
  off: string;
  on?: string;
}) {
  return (
    <Tooltip.Root side="top" delay={0}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup className={classNames('ps-tooltip', className)}>
        <span className="ps-tooltip-off">{off}</span>
        {on && <span className="ps-tooltip-on">{on}</span>}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

/**
 * Media Chrome's live control bar around a `Video`, inside a Video.js `LiveVideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
 *   import { MediaChromeLiveSkin } from '@player.style/media-chrome-live/react';
 *   import '@player.style/media-chrome-live/skin.css';
 *
 *   <LiveVideoPlayer>
 *     <MediaChromeLiveSkin>
 *       <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
 *     </MediaChromeLiveSkin>
 *   </LiveVideoPlayer>;
 *   ```;
 */
export function MediaChromeLiveSkin({ children, className, ...rest }: MediaChromeLiveSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-media-chrome', className)}
      data-theme="media-chrome"
      data-preset="live-video"
      {...rest}
    >
      {children}

      <Poster.Root className="ps-poster">
        <Poster.Image className="ps-poster-image" alt="" decoding="async" />
      </Poster.Root>

      {/* A mouse click on the picture plays or pauses, as media-gesture-receiver did. */}
      <Gesture type="tap" action="togglePaused" pointer="mouse" />
      {/* media-controller's default hotkeys. */}
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="p" action="togglePictureInPicture" />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.025} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.025} />

      {/* media-loading-indicator in the centred chrome: the half-ring spinner, 0.5s into a stall while playing. */}
      <BufferingIndicator className="ps-loading" delay={500}>
        <svg className="ps-loading-icon" aria-hidden="true" viewBox="0 0 100 100">
          <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50" />
        </svg>
      </BufferingIndicator>

      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      <Controls.Root>
        <Controls.Content className="ps-layer">
          {/*
           * media-control-bar for live media: play, LIVE, mute, volume, captions, picture-in-picture and fullscreen.
           * Every control paints its own translucent background, and the bar stays transparent past the last one.
           */}
          <Tooltip.Provider>
            <div className="ps-control-bar">
              <WithTooltip className="ps-play-tooltip" off="Play" on="Pause">
                <PlayButton className="ps-button ps-play-button">
                  <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m6 21 15-9L6 3v18Z" />
                  </svg>
                  <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z" />
                  </svg>
                </PlayButton>
              </WithTooltip>

              {/* media-live-button: a dot, grey until playback is at the live edge, then red, and LIVE; no tooltip. */}
              <LiveButton className="ps-button ps-live-button">
                <svg className="ps-icon ps-live-indicator" aria-hidden="true" viewBox="0 0 6 12">
                  <circle cx="3" cy="6" r="2" />
                </svg>
                <span className="ps-live-text">LIVE</span>
              </LiveButton>

              <WithTooltip className="ps-mute-tooltip" off="Mute" on="Unmute">
                <MuteButton className="ps-button ps-mute-button">
                  <svg className="ps-icon ps-icon-volume-off" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z" />
                  </svg>
                  <svg className="ps-icon ps-icon-volume-low" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z" />
                  </svg>
                  <svg className="ps-icon ps-icon-volume-high" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z" />
                  </svg>
                </MuteButton>
              </WithTooltip>

              {/* media-chrome-range: 10px gaps either side of the track are the wrapper's padding, off the slider. */}
              <div className="ps-range ps-volume-range">
                <VolumeSlider.Root className="ps-slider ps-volume-slider">
                  <VolumeSlider.Track className="ps-track">
                    <div className="ps-pointer" />
                    <VolumeSlider.Fill className="ps-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-thumb" />
                </VolumeSlider.Root>
              </div>

              <WithTooltip className="ps-captions-tooltip" off="Enable captions" on="Disable captions">
                <CaptionsButton className="ps-button ps-captions-button">
                  <svg className="ps-icon ps-icon-captions-on" aria-hidden="true" viewBox="0 0 26 24">
                    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z" />
                  </svg>
                  <svg className="ps-icon ps-icon-captions-off" aria-hidden="true" viewBox="0 0 26 24">
                    <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z" />
                  </svg>
                </CaptionsButton>
              </WithTooltip>

              <WithTooltip
                className="ps-pip-tooltip"
                off="Enter picture in picture mode"
                on="Exit picture in picture mode"
              >
                <PiPButton className="ps-button ps-pip-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 28 24">
                    <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z" />
                  </svg>
                </PiPButton>
              </WithTooltip>

              <WithTooltip className="ps-fullscreen-tooltip" off="Enter fullscreen mode" on="Exit fullscreen mode">
                <FullscreenButton className="ps-button ps-fullscreen-button">
                  <svg className="ps-icon ps-icon-fullscreen-enter" aria-hidden="true" viewBox="0 0 26 24">
                    <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z" />
                  </svg>
                  <svg className="ps-icon ps-icon-fullscreen-exit" aria-hidden="true" viewBox="0 0 26 24">
                    <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z" />
                  </svg>
                </FullscreenButton>
              </WithTooltip>
            </div>
          </Tooltip.Provider>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
