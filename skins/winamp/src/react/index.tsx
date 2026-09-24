'use client';

/*
 * Winamp for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same artwork classes. The
 * bitmaps are drawn by the shared stylesheet (inlined data URIs), which is not imported here so the component stays
 * CSS-agnostic; consumers import `@player.style/winamp/skin.css`.
 *
 * The window frame and the main window carry `data-interactive`: the original's controls sat outside its
 * media-controller, so a click there never toggled playback; only the screen takes the tap gesture.
 */
import {
  CaptionsButton,
  Container,
  type ContainerProps,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  PlayButton,
  Poster,
  SeekButton,
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type WinampSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The Winamp theme around a `Video`, inside a Video.js `VideoPlayer`: the classic main window, with its transport
 * buttons, LCD readouts, and scrolling marquee, over a bitmap-framed video window.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { WinampSkin } from '@player.style/winamp/react';
 *   import '@player.style/winamp/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <WinampSkin>
 *       <Video src="video.mp4" />
 *     </WinampSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function WinampSkin({ children, className, ...rest }: WinampSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-winamp', className)}
      data-theme="winamp"
      data-preset="video"
      {...rest}
    >
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

      <div className="ps-frame">
        {/* The video window: a bitmap frame around the screen. */}
        <div className="ps-window">
          <div className="ps-window-top" data-interactive="">
            <span className="ps-window-tl" />
            <span className="ps-window-t" />
            <span className="ps-window-tr" />
          </div>
          <div className="ps-window-center">
            <span className="ps-window-l" data-interactive="" />
            <div className="ps-screen">
              {children}

              <Poster.Root className="ps-poster">
                <Poster.Image className="ps-poster-image" alt="" decoding="async" />
              </Poster.Root>

              <ErrorDialog.Root>
                <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
                <ErrorDialog.Popup className="ps-dialog-popup">
                  <ErrorDialog.Title className="ps-dialog-title" />
                  <ErrorDialog.Description className="ps-dialog-description" />
                  <ErrorDialog.Close className="ps-dialog-close">Dismiss</ErrorDialog.Close>
                </ErrorDialog.Popup>
              </ErrorDialog.Root>
            </div>
            <span className="ps-window-r" data-interactive="" />
          </div>
          <div className="ps-window-bottom" data-interactive="">
            <span className="ps-window-bl" />
            <span className="ps-window-b" />
            <span className="ps-window-br" />
          </div>
        </div>

        {/* The main window. */}
        <div className="ps-main" data-interactive="">
          <div className="ps-transport">
            <SeekButton className="ps-button ps-transport-button ps-seek-backward" seconds={-30}>
              <span className="ps-icon" />
            </SeekButton>
            {/* Play, pause, and stop are three play buttons with their own artwork, as in the original. */}
            <PlayButton className="ps-button ps-transport-button ps-play">
              <span className="ps-icon" />
            </PlayButton>
            <PlayButton className="ps-button ps-transport-button ps-pause">
              <span className="ps-icon" />
            </PlayButton>
            <PlayButton className="ps-button ps-transport-button ps-stop">
              <span className="ps-icon" />
            </PlayButton>
            <SeekButton className="ps-button ps-transport-button ps-seek-forward" seconds={30}>
              <span className="ps-icon" />
            </SeekButton>
            <FullscreenButton className="ps-button ps-fullscreen-button">
              <span className="ps-icon" />
            </FullscreenButton>
          </div>

          <Time.Value className="ps-time" type="current" />

          <div className="ps-posbar">
            <TimeSlider.Root className="ps-range ps-time-range">
              <TimeSlider.Track className="ps-track" />
              <TimeSlider.Thumb className="ps-thumb" />
            </TimeSlider.Root>
          </div>

          <div className="ps-volume">
            <VolumeSlider.Root className="ps-range ps-volume-range">
              <VolumeSlider.Track className="ps-track" />
              <VolumeSlider.Thumb className="ps-thumb" />
            </VolumeSlider.Root>
          </div>

          <span className="ps-art ps-header" />
          <span className="ps-art ps-display" />
          <span className="ps-art ps-eq" />
          <span className="ps-art ps-pl" />
          <span className="ps-art ps-loop" />

          <CaptionsButton className="ps-button ps-shuffle">
            <span className="ps-icon" />
          </CaptionsButton>

          <span className="ps-art ps-balance" />
          <span className="ps-art ps-monoster">
            <span className="ps-mono" />
            <span className="ps-stereo" />
          </span>

          <div className="ps-lcd-text ps-marquee" role="marquee">
            <span className="ps-marquee-text">Video.js, it really whips the llama&apos;s ass!</span>
          </div>
          <div className="ps-lcd-text ps-kbps">192</div>
          <div className="ps-lcd-text ps-khz">44</div>

          {/* The play-state light and the VU meter are play buttons too, as in the original. */}
          <PlayButton className="ps-button ps-indicator">
            <span className="ps-icon" />
          </PlayButton>
          <PlayButton className="ps-button ps-vu">
            <span className="ps-icon" />
          </PlayButton>
        </div>
      </div>
    </Container>
  );
}
