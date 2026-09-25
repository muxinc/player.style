'use client';

/*
 * Video.js 8 for live video on Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The stylesheet
 * is @player.style/videojs-8's and is not imported here; consumers import `@player.style/videojs-8-live/skin.css`.
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
  VolumeSlider,
} from '@videojs/react';

export type Videojs8LiveSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/* The play glyph is drawn twice: in the big play button and in the control bar. */
const PLAY = 'M16 10v28l22-14z';

/**
 * The Video.js 8 skin for live video, around a `Video`, inside a Video.js `LiveVideoPlayer`: the live control (a dot
 * and LIVE, red at the live edge) in place of the progress bar and remaining time.
 *
 * @example
 *   ```tsx
 *   import { Video, LiveVideoPlayer } from '@videojs/react/live-video';
 *   import { Videojs8LiveSkin } from '@player.style/videojs-8-live/react';
 *   import '@player.style/videojs-8-live/skin.css';
 *
 *   <LiveVideoPlayer>
 *     <Videojs8LiveSkin>
 *       <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
 *     </Videojs8LiveSkin>
 *   </LiveVideoPlayer>;
 *   ```;
 */
export function Videojs8LiveSkin({ children, className, ...rest }: Videojs8LiveSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-videojs-8', className)}
      data-theme="videojs-8"
      data-preset="live-video"
      {...rest}
    >
      {children}

      <Poster.Root className="ps-poster">
        <Poster.Image className="ps-poster-image" alt="" decoding="async" />
      </Poster.Root>

      {/* A click on the picture plays or pauses and a double click toggles fullscreen, as the original's tech did. */}
      <Gesture type="tap" action="togglePaused" pointer="mouse" />
      <Gesture type="doubletap" action="toggleFullscreen" pointer="mouse" />
      {/* The original's `userActions.hotkeys` set. */}
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />

      {/* The ring spinner, shown 0.3s into a stall. */}
      <BufferingIndicator className="ps-loading" delay={300}>
        <div className="ps-spinner" />
      </BufferingIndicator>

      {/* The big play button, centred since 8.0, until playback first starts. */}
      <PlayButton className="ps-big-play">
        <svg className="ps-big-play-icon" aria-hidden="true" viewBox="0 0 48 48">
          <path d={PLAY} />
        </svg>
      </PlayButton>

      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
          <ErrorDialog.Close className="ps-dialog-close" aria-label="Close Modal Dialog">
            <svg className="ps-icon" aria-hidden="true" viewBox="0 0 48 48">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 27.17L31.17 34 24 26.83 16.83 34 14 31.17 21.17 24 14 16.83 16.83 14 24 21.17 31.17 14 34 16.83 26.83 24 34 31.17z" />
            </svg>
          </ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      <Controls.Root>
        <Controls.Content className="ps-layer">
          {/* The control bar: play, volume, the live control in the progress bar's place, then the other buttons. */}
          <div className="ps-bar">
            <PlayButton className="ps-button ps-play-button">
              <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 48 48">
                <path d={PLAY} />
              </svg>
              <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z" />
              </svg>
              <svg className="ps-icon ps-icon-replay" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M24 10V2L14 12l10 10v-8c6.63 0 12 5.37 12 12s-5.37 12-12 12-12-5.37-12-12H8c0 8.84 7.16 16 16 16s16-7.16 16-16-7.16-16-16-16z" />
              </svg>
            </PlayButton>

            {/* The volume panel: the slider slides out of the mute button on hover or keyboard focus. */}
            <div className="ps-volume">
              <MuteButton className="ps-button ps-mute-button">
                <svg className="ps-icon ps-icon-volume-high" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M6 18v12h8l10 10V8L14 18H6zm27 6c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zM28 6.46v4.13c5.78 1.72 10 7.07 10 13.41s-4.22 11.69-10 13.41v4.13c8.01-1.82 14-8.97 14-17.54S36.01 8.28 28 6.46z" />
                </svg>
                <svg className="ps-icon ps-icon-volume-medium" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M37 24c0-3.53-2.04-6.58-5-8.05v16.11c2.96-1.48 5-4.53 5-8.06zm-27-6v12h8l10 10V8L18 18h-8z" />
                </svg>
                <svg className="ps-icon ps-icon-volume-low" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M14 18v12h8l10 10V8L22 18h-8z" />
                </svg>
                <svg className="ps-icon ps-icon-volume-mute" aria-hidden="true" viewBox="0 0 48 48">
                  <path d="M33 24c0-3.53-2.04-6.58-5-8.05v4.42l4.91 4.91c.06-.42.09-.85.09-1.28zm5 0c0 1.88-.41 3.65-1.08 5.28l3.03 3.03C41.25 29.82 42 27 42 24c0-8.56-5.99-15.72-14-17.54v4.13c5.78 1.72 10 7.07 10 13.41zM8.55 6L6 8.55 15.45 18H6v12h8l10 10V26.55l8.51 8.51c-1.34 1.03-2.85 1.86-4.51 2.36v4.13a17.94 17.94 0 0 0 7.37-3.62L39.45 42 42 39.45l-18-18L8.55 6zM24 8l-4.18 4.18L24 16.36V8z" />
                </svg>
              </MuteButton>
              <div className="ps-volume-control">
                <VolumeSlider.Root className="ps-volume-bar">
                  <VolumeSlider.Track className="ps-volume-track">
                    <VolumeSlider.Fill className="ps-volume-level" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-handle ps-volume-handle" />
                </VolumeSlider.Root>
              </div>
            </div>

            {/*
             * The 7.x+ live UI in place of the progress bar and remaining time: a dot and LIVE, grey behind the live
             * edge and red at it. A click seeks to the edge.
             */}
            <div className="ps-live-control">
              <LiveButton className="ps-live-button">
                <svg className="ps-live-indicator" aria-hidden="true" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" />
                </svg>
                <span className="ps-live-text">LIVE</span>
              </LiveButton>
            </div>

            <CaptionsButton className="ps-button ps-captions-button">
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M38 8H10c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4V12c0-2.21-1.79-4-4-4zM22 22h-3v-1h-4v6h4v-1h3v2a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2zm14 0h-3v-1h-4v6h4v-1h3v2a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2z" />
              </svg>
            </CaptionsButton>

            <PiPButton className="ps-button ps-pip-button">
              <svg className="ps-icon ps-icon-pip-enter" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M38 22H22v11.99h16V22zm8 16V9.96C46 7.76 44.2 6 42 6H6C3.8 6 2 7.76 2 9.96V38c0 2.2 1.8 4 4 4h36c2.2 0 4-1.8 4-4zm-4 .04H6V9.94h36v28.1z" />
              </svg>
              <svg className="ps-icon ps-icon-pip-exit" aria-hidden="true" viewBox="-1 -3 24 24">
                <path d="M18 4H4v10h14V4zm4 12V1.98C22 .88 21.1 0 20 0H2C.9 0 0 .88 0 1.98V16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H2V1.97h18v14.05z" />
              </svg>
            </PiPButton>

            <FullscreenButton className="ps-button ps-fullscreen-button">
              <svg className="ps-icon ps-icon-fullscreen-enter" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M14 28h-4v10h10v-4h-6v-6zm-4-8h4v-6h6v-4H10v10zm24 14h-6v4h10V28h-4v6zm-6-24v4h6v6h4V10H28z" />
              </svg>
              <svg className="ps-icon ps-icon-fullscreen-exit" aria-hidden="true" viewBox="0 0 48 48">
                <path d="M10 32h6v6h4V28H10v4zm6-16h-6v4h10V10h-4v6zm12 22h4v-6h6v-4H28v10zm4-22v-6h-4v10h10v-4h-6z" />
              </svg>
            </FullscreenButton>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
