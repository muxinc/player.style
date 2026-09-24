'use client';

/*
 * YT for Video.js 10, React edition.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import `@player.style/yt/skin.css`.
 */
import {
  CaptionsButton,
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
  Poster,
  SeekButton,
  Slider,
  StatusIndicator,
  Time,
  TimeSlider,
  Tooltip,
  VolumeSlider,
} from '@videojs/react';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';
import type { ReactElement, ReactNode } from 'react';

export type YtSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/* The submenu chevron, the back arrow, and the check mark are media-chrome's own menu glyphs. */
const CHEVRON = 'm8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z';
const BACK = 'm11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z';
const CHECK = 'm10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z';

/** A control-bar button with the tooltip the original keeps hidden behind `--media-tooltip-display`. */
function WithTooltip({ children, label }: { children: ReactElement; label?: ReactNode }) {
  return (
    <Tooltip.Root side="top">
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup className="ps-tooltip">
        {label ?? <Tooltip.Label />}
        {!label && <Tooltip.Shortcut />}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

function SubmenuHint({ value }: { value: ReactNode }) {
  return (
    <span className="ps-menu-hint">
      {value}
      <svg className="ps-menu-chevron" aria-hidden="true" viewBox="0 0 20 24">
        <path d={CHEVRON} />
      </svg>
    </span>
  );
}

function BackItem({ children }: { children: ReactNode }) {
  return (
    <Menu.Item className="ps-menu-back">
      <svg className="ps-menu-back-icon" aria-hidden="true" viewBox="0 0 20 24">
        <path d={BACK} />
      </svg>
      {children}
    </Menu.Item>
  );
}

function CheckIndicator({ checked }: { checked: boolean }) {
  return (
    <Menu.ItemIndicator className="ps-menu-check" checked={checked} forceMount>
      <svg className="ps-menu-check-icon" aria-hidden="true" viewBox="0 1 24 24">
        <path d={CHECK} />
      </svg>
    </Menu.ItemIndicator>
  );
}

/**
 * The YT theme around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { YtSkin } from '@player.style/yt/react';
 *   import '@player.style/yt/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <YtSkin>
 *       <Video src="video.mp4" />
 *     </YtSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function YtSkin({ children, className, ...rest }: YtSkinProps) {
  return (
    <Container className={classNames('media-skin ps-yt', className)} data-theme="yt" data-preset="video" {...rest}>
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
      <Hotkey keys="j" action="seekStep" value={-10} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} />
      <Hotkey keys="l" action="seekStep" value={10} />
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

      {/* The desktop play/pause flash in the middle of the frame; the original animated a centred play button. */}
      <StatusIndicator.Root className="ps-tap-indicator" actions={['togglePaused']} closeDelay={1000}>
        <svg className="ps-tap-icon ps-tap-play" aria-hidden="true" viewBox="0 0 41 41" fill="none">
          <circle cx="20.5" cy="20.5" r="20.5" fill="black" fillOpacity="0.8" />
          <path d="M28 20.5L16 27.8612L16 13.1388L28 20.5Z" fill="#D9D9D9" />
        </svg>
        <svg className="ps-tap-icon ps-tap-pause" aria-hidden="true" viewBox="0 0 41 41" fill="none">
          <circle cx="20.5" cy="20.5" r="20.5" fill="black" fillOpacity="0.8" />
          <path d="M17.7674 13H14V28.0698H17.7674V13Z" fill="#D9D9D9" />
          <path d="M22.4768 13H26.2442V28.0698H22.4768V13Z" fill="#D9D9D9" />
        </svg>
      </StatusIndicator.Root>

      <Controls.Root>
        <Controls.Content className="ps-layer">
          <div className="ps-gradient" />

          {/* Narrow viewports: seek / play / seek across the middle, as the original's `centered-chrome`. */}
          <div className="ps-mobile-controls">
            <SeekButton className="ps-round ps-round-seek" seconds={-30}>
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 20 24">
                <text className="ps-seek-text" transform="translate(2.18 19.87)">
                  30
                </text>
                <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z" />
              </svg>
            </SeekButton>
            <PlayButton className="ps-round ps-round-play">
              <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 24 24">
                <path d="m6 21 15-9L6 3v18Z" />
              </svg>
              <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z" />
              </svg>
            </PlayButton>
            <SeekButton className="ps-round ps-round-seek" seconds={30}>
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 20 24">
                <text className="ps-seek-text" transform="translate(8.9 19.87)">
                  30
                </text>
                <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z" />
              </svg>
            </SeekButton>
          </div>

          {/* Progress bar, above the control bar. Chapters split the track when the media has a chapters track. */}
          <TimeSlider.Root className="ps-range">
            <TimeSlider.Chapters
              className="ps-chapters"
              renderChapter={(props) => (
                <div {...props} className="ps-chapter">
                  <TimeSlider.Track className="ps-track">
                    <TimeSlider.Buffer className="ps-buffer" />
                    <div className="ps-pointer" />
                    <TimeSlider.Fill className="ps-fill" />
                  </TimeSlider.Track>
                </div>
              )}
            />
            <TimeSlider.Thumb className="ps-thumb" />
            <TimeSlider.Preview className="ps-preview" overflow="clamp">
              <Slider.Thumbnail.Root className="ps-thumbnail">
                <Slider.Thumbnail.Image />
              </Slider.Thumbnail.Root>
              <TimeSlider.ChapterTitle className="ps-preview-chapter" />
              <TimeSlider.Value className="ps-preview-time" type="pointer" />
            </TimeSlider.Preview>
          </TimeSlider.Root>

          {/* Control bar. Tooltips are off by default, as in the original (`--media-tooltip-display`). */}
          <Tooltip.Provider>
            <div className="ps-bar">
              <WithTooltip>
                <PlayButton className="ps-button ps-play-button ps-play-morph">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 36 36">
                    <g className="ps-play-shadow">
                      <g className="ps-play-glyph">
                        <path className="ps-play-p1" d="M18.5 14L12 10V26L18.5 22V14Z" />
                        <path className="ps-play-p2" d="M18 13.6953L25 18L18 22.3086V13.6953Z" />
                      </g>
                      <g className="ps-pause-glyph">
                        <path className="ps-pause-p1" d="M16 10H12V26H16V10Z" />
                        <path className="ps-pause-p2" d="M21 10H25V26H21V10Z" />
                      </g>
                    </g>
                  </svg>
                </PlayButton>
              </WithTooltip>

              <div className="ps-volume">
                <WithTooltip>
                  <MuteButton className="ps-button ps-mute-button">
                    <svg className="ps-icon" aria-hidden="true" viewBox="0 0 36 36">
                      <use className="ps-svg-shadow" href="#ps-icon-volume" />
                      <g className="ps-icon-volume" id="ps-icon-volume">
                        <path d="M13 15H9V21H13L18 26V10L13 15Z" />
                        <path d="M20 22.0323C21.4818 21.2959 22.5 19.7669 22.5 18C22.5 16.2332 21.4818 14.7041 20 13.9678V22.0323Z" />
                        <path
                          className="ps-volume-high"
                          d="M20 9.22302V11.2899C22.8915 12.1505 25 14.829 25 18C25 21.171 22.8915 23.8495 20 24.7101V26.777C24.008 25.8675 27 22.2832 27 18C27 13.7168 24.008 10.1325 20 9.22302Z"
                        />
                      </g>
                      <g className="ps-icon-muted">
                        <path d="M10.2207 8.80817L8.80762 10.2213L13.2929 14.7065L13 14.9995H9V20.9995H13L18 25.9995V19.4136L22.1922 23.6058C21.5401 24.0942 20.8 24.4715 20 24.7096V26.7764C21.3453 26.4712 22.5761 25.8646 23.6177 25.0314L25.7782 27.1918L27.1924 25.7776L27.1913 25.7766L27.1902 25.7776L10.2207 8.80817Z" />
                        <path d="M25.8817 22.3478C26.5944 21.0589 27 19.5766 27 17.9995C27 13.7163 24.008 10.132 20 9.22247V11.2894C22.8915 12.1499 25 14.8284 25 17.9995C25 19.0177 24.7826 19.9851 24.3917 20.8578L25.8817 22.3478Z" />
                        <path d="M22.4139 18.88C22.4704 18.5952 22.5 18.3008 22.5 17.9995C22.5 16.2326 21.4818 14.7036 20 13.9672V16.4661L22.4139 18.88Z" />
                        <path d="M18 14.4661V9.99945L15.7667 12.2328L18 14.4661Z" />
                      </g>
                    </svg>
                  </MuteButton>
                </WithTooltip>
                <div className="ps-volume-range">
                  <VolumeSlider.Root className="ps-volume-slider">
                    <VolumeSlider.Track className="ps-volume-track">
                      <VolumeSlider.Fill className="ps-volume-fill" />
                    </VolumeSlider.Track>
                    <VolumeSlider.Thumb className="ps-volume-thumb" />
                  </VolumeSlider.Root>
                </div>
              </div>

              <Time.Group className="ps-time">
                <Time.Value className="ps-time-value" type="current" />
                <Time.Separator className="ps-time-separator"> / </Time.Separator>
                <Time.Value className="ps-time-value" type="duration" />
              </Time.Group>

              <span className="ps-spacer" />

              <WithTooltip>
                <CaptionsButton className="ps-button ps-captions-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 36 36">
                    <use className="ps-svg-shadow" href="#ps-icon-captions" />
                    <path
                      id="ps-icon-captions"
                      d="M9 13.4124C9 12.0801 10.0801 11 11.4124 11H24.5876C25.9199 11 27 12.0801 27 13.4124V22.5876C27 23.9199 25.9199 25 24.5876 25H11.4124C10.0801 25 9 23.9199 9 22.5876V13.4124ZM12 16.1134C12 15.4985 12.4985 15 13.1134 15H15.8866C16.5015 15 17 15.4985 17 16.1134V19.8866C17 20.5015 16.5015 21 15.8866 21H13.1134C12.4985 21 12 20.5015 12 19.8866V16.1134ZM13.5517 16.4545H15.4483V19.5455H13.5517V16.4545ZM17 17H15.4483V19H17V17ZM20.1134 15C19.4985 15 19 15.4985 19 16.1134V19.8866C19 20.5015 19.4985 21 20.1134 21H22.8866C23.5015 21 24 20.5015 24 19.8866V16.1134C24 15.4985 23.5015 15 22.8866 15H20.1134ZM22.4483 16.4545H20.5517V19.5455H22.4483V16.4545ZM22.4483 17H24V19H22.4483V17Z"
                    />
                  </svg>
                </CaptionsButton>
              </WithTooltip>

              {/* Settings menu: one root page with a submenu per option group, anchored above the gear button. */}
              <Menu.Root side="top" align="end">
                <WithTooltip label="Settings">
                  <Menu.Trigger className="ps-button ps-settings-button" aria-label="Settings">
                    <svg className="ps-icon" aria-hidden="true" viewBox="0 0 36 36">
                      <use className="ps-svg-shadow" href="#ps-icon-settings" />
                      <path
                        id="ps-icon-settings"
                        d="M11.8153 12.0477L14.2235 12.9602C14.6231 12.6567 15.0599 12.3996 15.5258 12.1971L15.9379 9.66561C16.5985 9.50273 17.2891 9.41632 18 9.41632C18.7109 9.41632 19.4016 9.50275 20.0622 9.66566L20.4676 12.1555C20.9584 12.3591 21.418 12.6227 21.8372 12.9372L24.1846 12.0477C25.1391 13.0392 25.8574 14.2597 26.249 15.6186L24.3196 17.1948C24.3531 17.4585 24.3704 17.7272 24.3704 18C24.3704 18.2727 24.3531 18.5415 24.3196 18.8051L26.249 20.3814C25.8574 21.7403 25.1391 22.9607 24.1846 23.9522L21.8372 23.0628C21.4179 23.3772 20.9584 23.6408 20.4676 23.8445L20.0622 26.3343C19.4016 26.4972 18.7109 26.5836 18 26.5836C17.2891 26.5836 16.5985 26.4972 15.9379 26.3344L15.5258 23.8029C15.0599 23.6003 14.6231 23.3433 14.2236 23.0398L11.8154 23.9523C10.8609 22.9608 10.1426 21.7404 9.75098 20.3815L11.7633 18.7375C11.7352 18.4955 11.7208 18.2495 11.7208 18C11.7208 17.7505 11.7352 17.5044 11.7633 17.2625L9.75098 15.6185C10.1426 14.2596 10.8609 13.0392 11.8153 12.0477ZM18 20.75C19.5188 20.75 20.75 19.5188 20.75 18C20.75 16.4812 19.5188 15.25 18 15.25C16.4812 15.25 15.25 16.4812 15.25 18C15.25 19.5188 16.4812 20.75 18 20.75Z"
                      />
                    </svg>
                  </Menu.Trigger>
                </WithTooltip>
                <Menu.Popup className="ps-menu">
                  <Menu.Content className="ps-menu-content">
                    <Menu.Root>
                      <PlaybackRateRadioGroup.Root>
                        <Menu.Trigger className="ps-menu-item ps-menu-item-speed">
                          <span className="ps-menu-label">Playback Speed</span>
                          <SubmenuHint value={<PlaybackRateRadioGroup.Value className="ps-menu-hint-value" />} />
                        </Menu.Trigger>
                        <Menu.Content className="ps-menu-content ps-menu-submenu">
                          <BackItem>Playback Speed</BackItem>
                          <PlaybackRateRadioGroup.Options
                            className="ps-menu-group"
                            renderItem={(props, item) => (
                              <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio-item">
                                <CheckIndicator checked={item.checked} />
                                <span className="ps-menu-label">{item.label}</span>
                              </Menu.RadioItem>
                            )}
                          />
                        </Menu.Content>
                      </PlaybackRateRadioGroup.Root>
                    </Menu.Root>

                    <Menu.Root>
                      <QualityRadioGroup.Root>
                        <Menu.Trigger className="ps-menu-item ps-menu-item-quality">
                          <span className="ps-menu-label">Quality</span>
                          <SubmenuHint value={<QualityRadioGroup.Value className="ps-menu-hint-value" />} />
                        </Menu.Trigger>
                        <Menu.Content className="ps-menu-content ps-menu-submenu">
                          <BackItem>Quality</BackItem>
                          <QualityRadioGroup.Options
                            className="ps-menu-group"
                            renderItem={(props, item) => (
                              <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio-item">
                                <CheckIndicator checked={item.checked} />
                                <span className="ps-menu-label">{item.label}</span>
                                <sup className="ps-menu-tier">{item.tier}</sup>
                              </Menu.RadioItem>
                            )}
                          />
                        </Menu.Content>
                      </QualityRadioGroup.Root>
                    </Menu.Root>

                    <Menu.Root>
                      <CaptionsRadioGroup.Root>
                        <Menu.Trigger className="ps-menu-item ps-menu-item-captions">
                          <span className="ps-menu-label">Subtitles/CC</span>
                          <SubmenuHint value={<CaptionsRadioGroup.Value className="ps-menu-hint-value" />} />
                        </Menu.Trigger>
                        <Menu.Content className="ps-menu-content ps-menu-submenu">
                          <BackItem>Subtitles/CC</BackItem>
                          <CaptionsRadioGroup.Options
                            className="ps-menu-group"
                            renderItem={(props, item) => (
                              <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio-item">
                                <CheckIndicator checked={item.checked} />
                                <span className="ps-menu-label">{item.label}</span>
                              </Menu.RadioItem>
                            )}
                          />
                        </Menu.Content>
                      </CaptionsRadioGroup.Root>
                    </Menu.Root>
                  </Menu.Content>
                </Menu.Popup>
              </Menu.Root>

              <WithTooltip>
                <PiPButton className="ps-button ps-pip-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 36 36">
                    <use className="ps-svg-shadow" href="#ps-icon-pip" />
                    <path d="M25 17H17V23H25V17Z" />
                    <path
                      id="ps-icon-pip"
                      d="M7 11C7 9.89543 7.89545 9 9 9H27.0161C28.1207 9 29.0161 9.89543 29.0161 11V24.8837C29.0161 25.9883 28.1207 26.8837 27.0162 26.8837H9C7.89545 26.8837 7 25.9883 7 24.8837V11ZM9 11H27V25H9V11Z"
                    />
                  </svg>
                </PiPButton>
              </WithTooltip>

              <WithTooltip>
                <FullscreenButton className="ps-button ps-fullscreen-button">
                  <svg className="ps-icon ps-icon-fs-enter" aria-hidden="true" viewBox="0 0 36 36">
                    <use className="ps-svg-shadow" href="#ps-icon-fs-enter" />
                    <g id="ps-icon-fs-enter">
                      <path className="ps-fs-path ps-fs-ul" d="M11 15H9V9H15V11H11V15Z" />
                      <path className="ps-fs-path ps-fs-ur" d="M21 11L21 9L27 9L27 15L25 15L25 11L21 11Z" />
                      <path className="ps-fs-path ps-fs-dl" d="M15 25L15 27L9 27L9 21L11 21L11 25L15 25Z" />
                      <path className="ps-fs-path ps-fs-dr" d="M25 21L27 21L27 27L21 27L21 25L25 25L25 21Z" />
                    </g>
                  </svg>
                  <svg className="ps-icon ps-icon-fs-exit" aria-hidden="true" viewBox="0 0 36 36">
                    <use className="ps-svg-shadow" href="#ps-icon-fs-exit" />
                    <g id="ps-icon-fs-exit">
                      <path className="ps-fs-path ps-fs-dr" d="M14 9L16 9L16 16L9 16L9 14L14 14L14 9Z" />
                      <path className="ps-fs-path ps-fs-dl" d="M27 14L27 16L20 16L20 9L22 9L22 14L27 14Z" />
                      <path className="ps-fs-path ps-fs-ur" d="M9 22L9 20L16 20L16 27L14 27L14 22L9 22Z" />
                      <path className="ps-fs-path ps-fs-ul" d="M22 27H20V20H27V22H22V27Z" />
                    </g>
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
