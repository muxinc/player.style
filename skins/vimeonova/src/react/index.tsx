'use client';

/*
 * Vimeonova for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/vimeonova/skin.css`.
 */
import {
  AirPlayButton,
  BufferingIndicator,
  CaptionsButton,
  CastButton,
  Container,
  type ContainerProps,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  Menu,
  MuteButton,
  PiPButton,
  PlayButton,
  PlaybackRateButton,
  Poster,
  Slider,
  TimeSlider,
  Title,
  VolumeSlider,
} from '@videojs/react';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';
import type { ComponentProps, ReactNode } from 'react';

export interface VimeonovaSkinProps extends ContainerProps {
  /** Shown under the title, as the original's `mediabyline`. The title comes from `VideoPlayer`'s `title`. */
  byline?: ReactNode;
}

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/** The original labelled rates `1x`, `1.5x`; v10's default is the multiplication sign. */
function formatRate(rate: number): string {
  return `${rate}x`;
}

/* media-chrome's own check mark, which the original's menus inherited. */
const CHECK = 'm10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z';

/** One radio row, shared by the three menus' `renderItem`. */
function MenuItem(
  props: Omit<ComponentProps<typeof Menu.RadioItem>, 'ref'>,
  item: { label: string; checked: boolean }
) {
  return (
    <Menu.RadioItem {...props} className="ps-menu-item">
      <Menu.ItemIndicator className="ps-menu-check" checked={item.checked} forceMount>
        <svg className="ps-menu-check-icon" aria-hidden="true" viewBox="0 1 24 24">
          <path d={CHECK} />
        </svg>
      </Menu.ItemIndicator>
      <span className="ps-menu-label">{item.label}</span>
    </Menu.RadioItem>
  );
}

function PlayIcons() {
  return (
    <>
      <svg
        className="ps-icon ps-icon-play"
        aria-hidden="true"
        viewBox="0 0 24 24"
        strokeWidth="1"
        stroke="currentColor"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 4v16l13 -8z" />
      </svg>
      <svg
        className="ps-icon ps-icon-pause"
        aria-hidden="true"
        viewBox="0 0 24 24"
        strokeWidth="1"
        stroke="currentColor"
        fill="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <rect x="6" y="5" width="4" height="14" rx="0" />
        <rect x="14" y="5" width="4" height="14" rx="0" />
      </svg>
    </>
  );
}

/**
 * The progress bar and its two chips: the current time, always shown, and the pointer time while hovering. The rail
 * carries both so they sit on the track's top edge; `thumbnail` adds the storyboard frame to the pointer chip.
 */
function Range({ size, overflow, thumbnail }: { size: string; overflow: 'clamp' | 'visible'; thumbnail?: boolean }) {
  return (
    <TimeSlider.Root className={`ps-range ${size}`}>
      <TimeSlider.Track className="ps-track">
        <TimeSlider.Buffer className="ps-buffer" />
        <TimeSlider.Fill className="ps-fill" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="ps-thumb" />
      <div className="ps-rail">
        <TimeSlider.Preview className="ps-current" overflow={overflow}>
          <TimeSlider.Value className="ps-current-time" type="current" />
        </TimeSlider.Preview>
        <div className="ps-arrow ps-current-arrow" />
        <TimeSlider.Preview className="ps-preview" overflow={overflow}>
          {thumbnail && (
            <Slider.Thumbnail.Root className="ps-thumbnail">
              <Slider.Thumbnail.Image />
            </Slider.Thumbnail.Root>
          )}
          <TimeSlider.Value className="ps-preview-time" type="pointer" />
        </TimeSlider.Preview>
        <div className="ps-arrow ps-preview-arrow" />
      </div>
    </TimeSlider.Root>
  );
}

/**
 * The Vimeonova theme around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { VimeonovaSkin } from '@player.style/vimeonova/react';
 *   import '@player.style/vimeonova/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg" title="Title">
 *     <VimeonovaSkin byline="Byline">
 *       <Video src="video.mp4" />
 *     </VimeonovaSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function VimeonovaSkin({ children, className, byline, ...rest }: VimeonovaSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-vimeonova', className)}
      data-theme="vimeonova"
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

      {/* No spinner in the original; the indicator only reports buffering, which stripes the progress track. */}
      <BufferingIndicator className="ps-buffering" />

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
          <div className="ps-header">
            <Title className="ps-title" />
            {byline ? <span className="ps-byline">{byline}</span> : null}
          </div>

          {/* Below 384px the play button sits above the middle of the frame instead of beside the bar. */}
          <div className="ps-center">
            <PlayButton className="ps-play-button ps-play-center">
              <PlayIcons />
            </PlayButton>
          </div>

          <div className="ps-bar-container">
            <PlayButton className="ps-play-button ps-play-bar">
              <PlayIcons />
            </PlayButton>

            <div className="ps-bar-right">
              {/* Narrow players: a 5px strip on top of the bar. */}
              <Range size="ps-range-small" overflow="clamp" />

              <div className="ps-bar">
                {/* From 484px the progress bar moves into the control bar. */}
                <Range size="ps-range-large" overflow="visible" thumbnail />

                <span className="ps-spacer" />

                <Menu.Root side="top" align="start">
                  <CaptionsRadioGroup.Root>
                    <Menu.Trigger
                      render={
                        <CaptionsButton className="ps-button ps-captions-button">
                          <svg
                            className="ps-icon ps-icon-captions-on"
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              fillRule="evenodd"
                              d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-.532l-2.2 2.64a1 1 0 0 1-1.536 0l-2.2-2.64H5.999A4 4 0 0 1 2 15V8Zm13.57.183a3.333 3.333 0 0 1 2.338.826.82.82 0 0 1-1.083 1.232 1.693 1.693 0 0 0-2.336.097 1.674 1.674 0 0 0 0 2.324 1.692 1.692 0 0 0 2.336.097.82.82 0 0 1 1.083 1.232 3.333 3.333 0 0 1-4.6-.191 3.314 3.314 0 0 1 0-4.6m2.261-1.017c-.856.035-1.666.4-2.261 1.017Zm-6.7-.005a3.338 3.338 0 0 1 2.342.828.825.825 0 0 1-1.089 1.239 1.688 1.688 0 0 0-2.33.097 1.669 1.669 0 0 0 0 2.316 1.688 1.688 0 0 0 2.33.097.825.825 0 1 1 1.09 1.24 3.338 3.338 0 0 1-4.608-.192 3.319 3.319 0 0 1 0-4.606m2.265-1.02a3.347 3.347 0 0 0-2.265 1.02Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            className="ps-icon ps-icon-captions-off"
                            aria-hidden="true"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.6"
                              d="M17.367 9.625a2.513 2.513 0 0 0-3.469.144 2.494 2.494 0 0 0 0 3.461 2.513 2.513 0 0 0 3.469.145m-6.7-3.75a2.513 2.513 0 0 0-3.469.144 2.494 2.494 0 0 0 0 3.461 2.512 2.512 0 0 0 3.469.145"
                            />
                            <path
                              fill="currentColor"
                              d="M17 18v-1h-.468l-.3.36L17 18Zm-5 0 .768-.64-.3-.36H12v1Zm2.5 3-.768.64a1 1 0 0 0 1.536 0L14.5 21ZM6 6h12V4H6v2Zm14 2v7h2V8h-2ZM4 15V8H2v7h2Zm14 2h-1v2h1v-2Zm-6 0H6v2h6v-2Zm4.232.36-2.5 3 1.536 1.28 2.5-3-1.536-1.28Zm-.964 3-2.5-3-1.536 1.28 2.5 3 1.536-1.28ZM2 15a4 4 0 0 0 4 4v-2a2 2 0 0 1-2-2H2Zm18 0a2 2 0 0 1-2 2v2a4 4 0 0 0 4-4h-2Zm-2-9a2 2 0 0 1 2 2h2a4 4 0 0 0-4-4v2ZM6 4a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2V4Z"
                            />
                          </svg>
                        </CaptionsButton>
                      }
                    />
                    <Menu.Popup className="ps-menu">
                      <Menu.Content className="ps-menu-content">
                        <CaptionsRadioGroup.Options className="ps-menu-group" renderItem={MenuItem} />
                      </Menu.Content>
                    </Menu.Popup>
                  </CaptionsRadioGroup.Root>
                </Menu.Root>

                {/* Shows the current rate as text (`attr(data-rate)`) and opens the rate menu. */}
                <Menu.Root side="top" align="start">
                  <PlaybackRateRadioGroup.Root formatRate={formatRate}>
                    <Menu.Trigger render={<PlaybackRateButton className="ps-button ps-rate-button" />} />
                    <Menu.Popup className="ps-menu">
                      <Menu.Content className="ps-menu-content">
                        <PlaybackRateRadioGroup.Options className="ps-menu-group" renderItem={MenuItem} />
                      </Menu.Content>
                    </Menu.Popup>
                  </PlaybackRateRadioGroup.Root>
                </Menu.Root>

                <div className="ps-volume">
                  <MuteButton className="ps-button ps-mute-button">
                    <svg
                      className="ps-icon ps-icon-volume-high"
                      aria-hidden="true"
                      viewBox="0 0 24 25"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M15 8a5 5 0 0 1 0 8" />
                      <path d="M17.7 5a9 9 0 0 1 0 14" />
                      <path
                        d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"
                        fill="currentColor"
                      />
                    </svg>
                    <svg
                      className="ps-icon ps-icon-volume-low"
                      aria-hidden="true"
                      viewBox="0 0 24 25"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M15 8a5 5 0 0 1 0 8" />
                      <path
                        d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"
                        fill="currentColor"
                      />
                    </svg>
                    <svg
                      className="ps-icon ps-icon-volume-off"
                      aria-hidden="true"
                      viewBox="0 0 24 25"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                      <path d="M16 10l4 4m0 -4l-4 4" />
                    </svg>
                  </MuteButton>
                  {/* A vertical pill above the mute button, open while the button or the pill is hovered or focused. */}
                  <div className="ps-volume-range">
                    <VolumeSlider.Root className="ps-volume-slider" orientation="vertical">
                      <VolumeSlider.Track className="ps-volume-track">
                        <VolumeSlider.Fill className="ps-volume-fill" />
                      </VolumeSlider.Track>
                      <VolumeSlider.Thumb className="ps-volume-thumb" />
                    </VolumeSlider.Root>
                  </div>
                </div>

                {/* The quality menu hides this trigger itself while the media has no renditions to choose from. */}
                <Menu.Root side="top" align="start">
                  <QualityRadioGroup.Root>
                    <Menu.Trigger className="ps-button ps-quality-button" aria-label="Quality">
                      <svg className="ps-icon ps-icon-quality" aria-hidden="true" viewBox="0 0 28 24">
                        <path
                          fill="currentColor"
                          d="M19.866 18.971h-5.458L16.728 5h5.239c1.437 0 2.638.289 3.602.866.964.578 1.648 1.403 2.053 2.477.405 1.073.485 2.351.239 3.834-.237 1.428-.716 2.649-1.44 3.663a7.076 7.076 0 0 1-2.756 2.326c-1.114.537-2.38.805-3.8.805Zm-1.133-3.22h1.378c.691 0 1.308-.12 1.849-.361.546-.246 1-.655 1.364-1.228.369-.578.635-1.367.798-2.367.155-.946.15-1.676-.013-2.19-.164-.519-.476-.878-.935-1.078-.46-.205-1.053-.307-1.78-.307h-1.406l-1.255 7.531ZM0 18.971 2.32 5h3.792l-.9 5.458h5.02L11.134 5h3.794l-2.32 13.971H8.814l.9-5.457h-5.02l-.901 5.457H0Z"
                        />
                      </svg>
                    </Menu.Trigger>
                    <Menu.Popup className="ps-menu">
                      <Menu.Content className="ps-menu-content">
                        <QualityRadioGroup.Options className="ps-menu-group" renderItem={MenuItem} />
                      </Menu.Content>
                    </Menu.Popup>
                  </QualityRadioGroup.Root>
                </Menu.Root>

                <PiPButton className="ps-button ps-pip-button">
                  <svg
                    className="ps-icon ps-icon-pip-enter"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" />
                    <rect x="14" y="14" width="7" height="5" rx="1" fill="currentColor" />
                    <line x1="7" y1="9" x2="11" y2="13" />
                    <path d="M8 13h3v-3" />
                  </svg>
                  <svg
                    className="ps-icon ps-icon-pip-exit"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" />
                    <rect x="14" y="14" width="7" height="5" rx="1" fill="currentColor" />
                    <line x1="7" y1="9" x2="11" y2="13" />
                    <path d="M7 12v-3h3" />
                  </svg>
                </PiPButton>

                {/* The original kept media-chrome's default AirPlay glyph. */}
                <AirPlayButton className="ps-button ps-airplay-button">
                  <svg className="ps-icon ps-icon-airplay" aria-hidden="true" viewBox="0 0 26 24">
                    <path
                      fill="currentColor"
                      d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"
                    />
                  </svg>
                </AirPlayButton>

                <CastButton className="ps-button ps-cast-button">
                  <svg
                    className="ps-icon ps-icon-cast-enter"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <line x1="3" y1="19" x2="3.01" y2="19" />
                    <path d="M7 19a4 4 0 0 0 -4 -4" />
                    <path d="M11 19a8 8 0 0 0 -8 -8" />
                    <path d="M15 19h3a3 3 0 0 0 3 -3v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -2.8 2" />
                  </svg>
                  <svg
                    className="ps-icon ps-icon-cast-exit"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 19h.01" />
                    <path d="M7 19a4 4 0 0 0 -4 -4" />
                    <path d="M11 19a8 8 0 0 0 -8 -8" />
                    <path d="M15 19h3a3 3 0 0 0 .875 -.13m1.997 -2.002a3 3 0 0 0 .128 -.868v-8a3 3 0 0 0 -3 -3h-9m-3.865 .136a3 3 0 0 0 -1.935 1.864" />
                    <path d="M3 3l18 18" />
                  </svg>
                </CastButton>

                <FullscreenButton className="ps-button ps-fullscreen-button">
                  <svg className="ps-icon ps-icon-fullscreen-enter" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 5h4v4M15 9l4-4M9 19H5v-4M5 19l4-4M15 19h4v-4M15 15l4 4M9 5H5v4M5 5l4 4"
                    />
                  </svg>
                  <svg className="ps-icon ps-icon-fullscreen-exit" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 9h4V5M4.5 4.5 9 9M5 15h4v4M4.5 19.5 9 15M19 9h-4V5M15 9l4.5-4.5M19 15h-4v4M15 15l4.5 4.5"
                    />
                  </svg>
                </FullscreenButton>
              </div>
            </div>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
