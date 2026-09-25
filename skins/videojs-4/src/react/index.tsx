'use client';

/*
 * Video.js 4 for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/videojs-4/skin.css`.
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

export type Videojs4SkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The 2013 Video.js 4 default skin around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { Videojs4Skin } from '@player.style/videojs-4/react';
 *   import '@player.style/videojs-4/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <Videojs4Skin>
 *       <Video src="video.mp4" />
 *     </Videojs4Skin>
 *   </VideoPlayer>;
 *   ```;
 */
export function Videojs4Skin({ children, className, ...rest }: Videojs4SkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-videojs-4', className)}
      data-theme="videojs-4"
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

      {/* The loading spinner: the font's thin broken ring (\e01e), turning while the media waits. */}
      <BufferingIndicator className="ps-loading">
        <svg className="ps-spinner" aria-hidden="true" viewBox="0 0 1024 1024">
          <path
            transform="matrix(1 0 0 -1 0 960)"
            d="M1024 448c-1.278 66.862-15.784 133.516-42.576 194.462-26.704 61-65.462 116.258-113.042 161.92-47.552 45.696-103.944 81.82-164.984 105.652-61.004 23.924-126.596 35.352-191.398 33.966-64.81-1.282-129.332-15.374-188.334-41.356-59.048-25.896-112.542-63.47-156.734-109.576-44.224-46.082-79.16-100.708-102.186-159.798-23.114-59.062-34.128-122.52-32.746-185.27 1.286-62.76 14.964-125.148 40.134-182.206 25.088-57.1 61.476-108.828 106.11-151.548 44.61-42.754 97.472-76.504 154.614-98.72 57.118-22.304 118.446-32.902 179.142-31.526 60.708 1.29 120.962 14.554 176.076 38.914 55.15 24.282 105.116 59.48 146.366 102.644 41.282 43.14 73.844 94.236 95.254 149.43 13.034 33.458 21.88 68.4 26.542 103.798 1.246-0.072 2.498-0.12 3.762-0.12 35.346 0 64 28.652 64 64 0 1.796-0.094 3.572-0.238 5.332h0.238zM922.306 278.052c-23.472-53.202-57.484-101.4-99.178-141.18-41.67-39.81-91-71.186-144.244-91.79-53.228-20.678-110.29-30.452-166.884-29.082-56.604 1.298-112.596 13.736-163.82 36.474-51.25 22.666-97.684 55.49-135.994 95.712-38.338 40.198-68.528 87.764-88.322 139.058-19.87 51.284-29.228 106.214-27.864 160.756 1.302 54.552 13.328 108.412 35.254 157.69 21.858 49.3 53.498 93.97 92.246 130.81 38.73 36.868 84.53 65.87 133.874 84.856 49.338 19.060 102.136 28.006 154.626 26.644 52.5-1.306 104.228-12.918 151.562-34.034 47.352-21.050 90.256-51.502 125.624-88.782 35.396-37.258 63.21-81.294 81.39-128.688 18.248-47.392 26.782-98.058 25.424-148.496h0.238c-0.144-1.76-0.238-3.536-0.238-5.332 0-33.012 24.992-60.174 57.086-63.624-6.224-34.822-16.53-68.818-30.78-100.992z"
          />
        </svg>
      </BufferingIndicator>

      {/* The error display: a big grey X over the frame, the message in a strip along the bottom. */}
      <ErrorDialog.Root>
        <ErrorDialog.Backdrop className="ps-dialog-backdrop" />
        <ErrorDialog.Popup className="ps-dialog-popup">
          <ErrorDialog.Title className="ps-dialog-title" />
          <ErrorDialog.Description className="ps-dialog-description" />
          <ErrorDialog.Close className="ps-dialog-close">Dismiss</ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      {/* The big play button in the top-left corner, until playback starts. */}
      <PlayButton className="ps-big-play">
        <svg className="ps-big-play-icon" aria-hidden="true" viewBox="0 0 1024 1024">
          <path transform="matrix(1 0 0 -1 0 960)" d="M192 832l640-384-640-384z" />
        </svg>
      </PlayButton>

      <Controls.Root>
        <Controls.Content className="ps-layer">
          <div className="ps-bar">
            {/*
             * The progress strip on the bar's top edge. The fill and the handle sit in boxes inset by half the
             * handle's width, as 4.x placed them, so the diamond never leaves the strip at either end.
             */}
            <TimeSlider.Root className="ps-progress">
              <TimeSlider.Track className="ps-progress-track">
                <TimeSlider.Buffer className="ps-progress-buffer" />
                <div className="ps-progress-inset">
                  <TimeSlider.Fill className="ps-progress-fill" />
                </div>
              </TimeSlider.Track>
              <div className="ps-progress-rail">
                <TimeSlider.Thumb className="ps-progress-handle" />
              </div>
            </TimeSlider.Root>

            <PlayButton className="ps-button ps-play-button">
              <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 1024 1024">
                <path transform="matrix(1 0 0 -1 0 960)" d="M192 832l640-384-640-384z" />
              </svg>
              <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 1024 1024">
                <path transform="matrix(1 0 0 -1 0 960)" d="M128 832h320v-768h-320zM576 832h320v-768h-320z" />
              </svg>
            </PlayButton>

            <Time.Group className="ps-time">
              <Time.Value className="ps-time-value" type="current" />
              <Time.Separator className="ps-time-divider">/</Time.Separator>
              <Time.Value className="ps-time-value" type="duration" />
            </Time.Group>

            <span className="ps-spacer" />

            <CaptionsButton className="ps-button ps-captions-button">
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 1374 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M0 960h1374.316v-1030.414h-1374.316v1030.414zM1245.462 449.276c-1.706 180.052-8.542 258.568-51.2 314.036-7.68 11.946-22.186 18.772-34.132 27.296-41.814 30.73-238.944 41.814-467.636 41.814-228.702 0-435.21-11.084-476.17-41.814-12.8-8.524-27.316-15.35-35.84-27.296-41.822-55.468-47.786-133.984-50.346-314.036 2.56-180.062 8.524-258.57 50.346-314.036 8.524-12.8 23.040-18.774 35.84-27.306 40.96-31.574 247.468-41.814 476.17-43.52 228.692 1.706 425.822 11.946 467.636 43.52 11.946 8.532 26.452 14.506 34.132 27.306 42.658 55.466 49.494 133.974 51.2 314.036zM662.358 495.904c-11.58 140.898-86.51 223.906-220.556 223.906-122.458 0-218.722-110.432-218.722-287.88 0-178.212 87.73-289.396 232.734-289.396 115.766 0 196.798 85.298 209.588 226.95h-138.302c-5.48-52.548-27.414-92.914-73.72-92.914-73.108 0-86.51 72.354-86.51 149.27 0 105.868 30.46 159.932 81.032 159.932 45.082 0 73.718-32.75 77.976-89.868h136.48zM1140.026 495.904c-11.57 140.898-86.51 223.906-220.546 223.906-122.466 0-218.722-110.432-218.722-287.88 0-178.212 87.73-289.396 232.734-289.396 115.758 0 196.788 85.298 209.58 226.95h-138.304c-5.47-52.548-27.404-92.914-73.71-92.914-73.116 0-86.518 72.354-86.518 149.27 0 105.868 30.468 159.932 81.030 159.932 45.084 0 73.728-32.75 77.986-89.868h136.47z"
                />
              </svg>
            </CaptionsButton>

            <MuteButton className="ps-button ps-mute-button">
              <svg className="ps-icon ps-icon-volume-off" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M401.332 881.332c25.668 25.668 46.668 16.968 46.668-19.332v-828c0-36.3-21-44.998-46.668-19.33l-241.332 241.33h-160v384h160l241.332 241.332z"
                />
              </svg>
              <svg className="ps-icon ps-icon-volume-low" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M549.020 218.98c-12.286 0-24.568 4.686-33.942 14.058-18.746 18.746-18.746 49.136 0 67.882 81.1 81.1 81.1 213.058 0 294.156-18.746 18.746-18.746 49.138 0 67.882 18.746 18.744 49.136 18.744 67.882 0 118.53-118.53 118.53-311.392 0-429.922-9.372-9.37-21.656-14.056-33.94-14.056zM401.332 881.332c25.668 25.668 46.668 16.968 46.668-19.332v-828c0-36.3-21-44.998-46.668-19.33l-241.332 241.33h-160v384h160l241.332 241.332z"
                />
              </svg>
              <svg className="ps-icon ps-icon-volume-medium" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M719.53 128.47c-12.286 0-24.568 4.686-33.942 14.058-18.744 18.744-18.744 49.136 0 67.882 131.006 131.006 131.006 344.17 0 475.176-18.744 18.746-18.744 49.138 0 67.882 18.744 18.742 49.138 18.744 67.882 0 81.594-81.592 126.53-190.076 126.53-305.468 0-115.39-44.936-223.876-126.53-305.47-9.372-9.374-21.656-14.060-33.94-14.060zM549.020 218.98c-12.286 0-24.568 4.686-33.942 14.058-18.746 18.746-18.746 49.136 0 67.882 81.1 81.1 81.1 213.058 0 294.156-18.746 18.746-18.746 49.138 0 67.882 18.746 18.744 49.136 18.744 67.882 0 118.53-118.53 118.53-311.392 0-429.922-9.372-9.37-21.656-14.056-33.94-14.056zM401.332 881.332c25.668 25.668 46.668 16.968 46.668-19.332v-828c0-36.3-21-44.998-46.668-19.33l-241.332 241.33h-160v384h160l241.332 241.332z"
                />
              </svg>
              <svg className="ps-icon ps-icon-volume-high" aria-hidden="true" viewBox="0 0 1088 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M890.040 37.96c-12.286 0-24.568 4.686-33.942 14.058-18.744 18.746-18.744 49.136 0 67.882 87.638 87.642 135.904 204.16 135.904 328.1 0 123.938-48.266 240.458-135.904 328.098-18.744 18.746-18.744 49.138 0 67.882 18.744 18.744 49.138 18.744 67.882 0 105.77-105.772 164.022-246.4 164.022-395.98 0-149.582-58.252-290.208-164.022-395.98-9.372-9.374-21.656-14.060-33.94-14.060zM719.53 128.47c-12.286 0-24.568 4.686-33.942 14.058-18.744 18.744-18.744 49.136 0 67.882 131.006 131.006 131.006 344.17 0 475.176-18.744 18.746-18.744 49.138 0 67.882 18.744 18.742 49.138 18.744 67.882 0 81.594-81.592 126.53-190.076 126.53-305.468 0-115.39-44.936-223.876-126.53-305.47-9.372-9.374-21.656-14.060-33.94-14.060zM549.020 218.98c-12.286 0-24.568 4.686-33.942 14.058-18.746 18.746-18.746 49.136 0 67.882 81.1 81.1 81.1 213.058 0 294.156-18.746 18.746-18.746 49.138 0 67.882 18.746 18.744 49.136 18.744 67.882 0 118.53-118.53 118.53-311.392 0-429.922-9.372-9.37-21.656-14.056-33.94-14.056zM401.332 881.332c25.668 25.668 46.668 16.968 46.668-19.332v-828c0-36.3-21-44.998-46.668-19.33l-241.332 241.33h-160v384h160l241.332 241.332z"
                />
              </svg>
            </MuteButton>

            <div className="ps-volume-control">
              <VolumeSlider.Root className="ps-volume-bar">
                <VolumeSlider.Track className="ps-volume-track">
                  <div className="ps-volume-inset">
                    <VolumeSlider.Fill className="ps-volume-level" />
                  </div>
                </VolumeSlider.Track>
                <div className="ps-volume-rail">
                  <VolumeSlider.Thumb className="ps-volume-handle" />
                </div>
              </VolumeSlider.Root>
            </div>

            <FullscreenButton className="ps-button ps-fullscreen-button">
              <svg className="ps-icon ps-icon-fullscreen-enter" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M1024 960v-416l-160 160-192-192-96 96 192 192-160 160zM448 288l-192-192 160-160h-416v416l160-160 192 192z"
                />
              </svg>
              <svg className="ps-icon ps-icon-fullscreen-exit" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  transform="matrix(1 0 0 -1 0 960)"
                  d="M448 384v-416l-160 160-192-192-96 96 192 192-160 160zM1024 864l-192-192 160-160h-416v416l160-160 192 192z"
                />
              </svg>
            </FullscreenButton>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
