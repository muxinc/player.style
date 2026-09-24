'use client';

/*
 * Reelplay for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same artwork classes. The
 * pixel art is drawn by the shared stylesheet (inlined PNG data URIs), which is not imported here so the component
 * stays CSS-agnostic; consumers import `@player.style/reelplay/skin.css`.
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
  SeekButton,
  Slider,
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type ReelplaySkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/** One play button of the transport trio, or the status light: a glyph for the paused state and one for playing. */
function PlayStateButton({ className }: { className: string }) {
  return (
    <PlayButton className={className}>
      <span className="ps-icon ps-icon-paused" />
      <span className="ps-icon ps-icon-playing" />
    </PlayButton>
  );
}

/**
 * The Reelplay theme around a `Video`, inside a Video.js `VideoPlayer`: a nostalgic desktop media player with a
 * title strip, a pixel-art transport bar, and an LCD status bar.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { ReelplaySkin } from '@player.style/reelplay/react';
 *   import '@player.style/reelplay/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <ReelplaySkin>
 *       <Video src="video.mp4" />
 *     </ReelplaySkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function ReelplaySkin({ children, className, ...rest }: ReelplaySkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-reelplay', className)}
      data-theme="reelplay"
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
        <Controls.Content className="ps-chrome">
          {/* The window: a title strip over the transport bar. */}
          <div className="ps-top">
            <div className="ps-titlebar">
              <span className="ps-title">ReelPlay: Welcome!</span>
            </div>

            <div className="ps-bar">
              {/* Play, pause, and stop are three play buttons with their own artwork for each state. */}
              <PlayStateButton className="ps-button ps-transport ps-transport-play" />
              <PlayStateButton className="ps-button ps-transport ps-transport-pause" />
              <PlayStateButton className="ps-button ps-transport ps-transport-stop" />

              <SeekButton className="ps-button ps-seek ps-seek-backward" seconds={-30}>
                <span className="ps-icon ps-icon-seek" />
              </SeekButton>

              <div className="ps-range-box">
                <TimeSlider.Root className="ps-range ps-time-range">
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
              </div>

              <SeekButton className="ps-button ps-seek ps-seek-forward" seconds={30}>
                <span className="ps-icon ps-icon-seek" />
              </SeekButton>

              <div className="ps-spacer" />

              <MuteButton className="ps-button ps-mute-button">
                <span className="ps-icon ps-icon-volume-on" />
                <span className="ps-icon ps-icon-volume-off" />
              </MuteButton>

              <div className="ps-range-box ps-volume-box">
                <VolumeSlider.Root className="ps-range ps-volume-range">
                  <VolumeSlider.Track className="ps-track">
                    <VolumeSlider.Fill className="ps-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-thumb" />
                </VolumeSlider.Root>
              </div>
            </div>
          </div>

          {/* The status bar: LCD panels with the play state, a fixed bitrate, the time, and the credits. */}
          <div className="ps-bottom">
            <div className="ps-panel">
              <PlayStateButton className="ps-button ps-status" />
              <span className="ps-panel-text">32.1 Kbps</span>
            </div>
            <div className="ps-panel">
              <Time.Group className="ps-time">
                <Time.Value className="ps-time-value" type="current" />
                <Time.Separator className="ps-time-separator"> / </Time.Separator>
                <Time.Value className="ps-time-value" type="duration" />
              </Time.Group>
            </div>
            <div className="ps-panel">
              <span className="ps-panel-text">Theme by @davekiss</span>
            </div>
            <div className="ps-panel">
              <span className="ps-panel-text">
                Powered by{' '}
                <a className="ps-link" href="https://mux.com" title="Mux">
                  Mux
                </a>
              </span>
            </div>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
