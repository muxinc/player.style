'use client';

/*
 * Sutro for Video.js 10, React edition.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import `@player.style/sutro/skin.css`.
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
  Menu,
  MuteButton,
  PiPButton,
  PlayButton,
  Poster,
  Slider,
  Time,
  TimeSlider,
  Tooltip,
  VolumeSlider,
} from '@videojs/react';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';
import type { ReactElement, ReactNode } from 'react';

export type SutroSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/* The submenu chevron, the back arrow, and the check mark are media-chrome's own menu glyphs. */
const CHEVRON = 'm8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z';
const BACK = 'm11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z';
const CHECK = 'm10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z';

/** A control-bar button with its tooltip; media buttons fill the label themselves, the settings button names its own. */
function WithTooltip({ children, label }: { children: ReactElement; label?: ReactNode }) {
  return (
    <Tooltip.Root side="top" delay={0}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup className="ps-tooltip">
        <Tooltip.Label className="ps-tooltip-label">{label}</Tooltip.Label>
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
 * The Sutro theme around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { SutroSkin } from '@player.style/sutro/react';
 *   import '@player.style/sutro/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <SutroSkin>
 *       <Video src="video.mp4" />
 *     </SutroSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function SutroSkin({ children, className, ...rest }: SutroSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-sutro', className)}
      data-theme="sutro"
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
          <div className="ps-gradient" />

          {/* One control bar: play, mute (with the volume slide-out above it), time, progress, then the right-hand buttons. */}
          <Tooltip.Provider>
            <div className="ps-bar">
              <WithTooltip>
                <PlayButton className="ps-button ps-play-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                    <path
                      className="ps-play-glyph"
                      d="M20.7131 14.6976C21.7208 15.2735 21.7208 16.7265 20.7131 17.3024L12.7442 21.856C11.7442 22.4274 10.5 21.7054 10.5 20.5536L10.5 11.4464C10.5 10.2946 11.7442 9.57257 12.7442 10.144L20.7131 14.6976Z"
                    />
                    <g className="ps-pause-glyph">
                      <rect className="ps-pause-left" x="10.5" width="1em" y="10.5" height="11" rx="0.5" />
                      <rect className="ps-pause-right" x="17.5" width="1em" y="10.5" height="11" rx="0.5" />
                    </g>
                  </svg>
                </PlayButton>
              </WithTooltip>

              {/* No tooltip on mute, as the original's `notooltip`: the slide-out has to stay the button's next sibling. */}
              <MuteButton className="ps-button ps-mute-button">
                <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                  <g className="ps-vol-paths">
                    <path
                      className="ps-speaker"
                      d="M16.5 20.486v-8.972c0-1.537-2.037-2.08-2.802-.745l-1.026 1.79a2.5 2.5 0 0 1-.8.85l-1.194.78A1.5 1.5 0 0 0 10 15.446v1.11c0 .506.255.978.678 1.255l1.194.782a2.5 2.5 0 0 1 .8.849l1.026 1.79c.765 1.334 2.802.792 2.802-.745Z"
                    />
                    <path
                      className="ps-vol-path ps-vol-low"
                      d="M18.5 18C19.6046 18 20.5 17.1046 20.5 16C20.5 14.8954 19.6046 14 18.5 14"
                    />
                    <path
                      className="ps-vol-path ps-vol-high"
                      d="M18 21C20.7614 21 23 18.7614 23 16C23 13.2386 20.7614 11 18 11"
                    />
                    <path className="ps-muted-path ps-muted-1" d="M23 18L19 14" />
                    <path className="ps-muted-path ps-muted-2" d="M23 14L19 18" />
                  </g>
                </svg>
              </MuteButton>
              <div className="ps-volume-wrapper">
                <VolumeSlider.Root className="ps-volume-slider">
                  <VolumeSlider.Track className="ps-volume-track">
                    <VolumeSlider.Fill className="ps-volume-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-volume-thumb" />
                </VolumeSlider.Root>
              </div>

              {/* Current time alone below 480px; current / duration from there, as the original's two time displays. */}
              <Time.Group className="ps-time">
                <Time.Value className="ps-time-current" type="current" />
                <Time.Separator className="ps-time-separator"> / </Time.Separator>
                <Time.Value className="ps-time-duration" type="duration" />
              </Time.Group>

              {/* Progress bar. Chapters split the track when the media has a chapters track. */}
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

              <WithTooltip>
                <CaptionsButton className="ps-button ps-captions-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                    <use className="ps-svg-shadow" href="#ps-sutro-cc" />
                    <g className="ps-cc-glyph" id="ps-sutro-cc">
                      <path d="M15.6634 14.3574H14.5636C14.4985 14.0523 14.3847 13.7842 14.2221 13.5532C14.0624 13.3222 13.8673 13.1283 13.6367 12.9715C13.409 12.8118 13.1562 12.692 12.8783 12.6122C12.6004 12.5323 12.3107 12.4924 12.0091 12.4924C11.4592 12.4924 10.961 12.6264 10.5146 12.8945C10.0711 13.1625 9.71776 13.5575 9.45463 14.0794C9.19445 14.6012 9.06436 15.2414 9.06436 16C9.06436 16.7586 9.19445 17.3988 9.45463 17.9206C9.71776 18.4425 10.0711 18.8375 10.5146 19.1055C10.961 19.3736 11.4592 19.5076 12.0091 19.5076C12.3107 19.5076 12.6004 19.4677 12.8783 19.3878C13.1562 19.308 13.409 19.1896 13.6367 19.0328C13.8673 18.8731 14.0624 18.6778 14.2221 18.4468C14.3847 18.2129 14.4985 17.9449 14.5636 17.6426H15.6634C15.5806 18.0903 15.4298 18.491 15.2111 18.8446C14.9923 19.1982 14.7203 19.499 14.3951 19.7471C14.0698 19.9924 13.7047 20.1792 13.2996 20.3075C12.8976 20.4358 12.4674 20.5 12.0091 20.5C11.2345 20.5 10.5456 20.3175 9.94246 19.9525C9.33932 19.5875 8.8648 19.0684 8.51888 18.3954C8.17296 17.7224 8 16.924 8 16C8 15.076 8.17296 14.2776 8.51888 13.6046C8.8648 12.9316 9.33932 12.4125 9.94246 12.0475C10.5456 11.6825 11.2345 11.5 12.0091 11.5C12.4674 11.5 12.8976 11.5642 13.2996 11.6925C13.7047 11.8208 14.0698 12.009 14.3951 12.2571C14.7203 12.5024 14.9923 12.8018 15.2111 13.1554C15.4298 13.5062 15.5806 13.9068 15.6634 14.3574Z" />
                      <path d="M24 14.3574H22.9002C22.8351 14.0523 22.7213 13.7842 22.5587 13.5532C22.399 13.3222 22.2039 13.1283 21.9733 12.9715C21.7456 12.8118 21.4928 12.692 21.2149 12.6122C20.937 12.5323 20.6473 12.4924 20.3457 12.4924C19.7958 12.4924 19.2976 12.6264 18.8511 12.8945C18.4077 13.1625 18.0543 13.5575 17.7912 14.0794C17.531 14.6012 17.4009 15.2414 17.4009 16C17.4009 16.7586 17.531 17.3988 17.7912 17.9206C18.0543 18.4425 18.4077 18.8375 18.8511 19.1055C19.2976 19.3736 19.7958 19.5076 20.3457 19.5076C20.6473 19.5076 20.937 19.4677 21.2149 19.3878C21.4928 19.308 21.7456 19.1896 21.9733 19.0328C22.2039 18.8731 22.399 18.6778 22.5587 18.4468C22.7213 18.2129 22.8351 17.9449 22.9002 17.6426H24C23.9172 18.0903 23.7664 18.491 23.5476 18.8446C23.3289 19.1982 23.0569 19.499 22.7316 19.7471C22.4064 19.9924 22.0413 20.1792 21.6362 20.3075C21.2341 20.4358 20.804 20.5 20.3457 20.5C19.5711 20.5 18.8822 20.3175 18.279 19.9525C17.6759 19.5875 17.2014 19.0684 16.8555 18.3954C16.5095 17.7224 16.3366 16.924 16.3366 16C16.3366 15.076 16.5095 14.2776 16.8555 13.6046C17.2014 12.9316 17.6759 12.4125 18.279 12.0475C18.8822 11.6825 19.5711 11.5 20.3457 11.5C20.804 11.5 21.2341 11.5642 21.6362 11.6925C22.0413 11.8208 22.4064 12.009 22.7316 12.2571C23.0569 12.5024 23.3289 12.8018 23.5476 13.1554C23.7664 13.5062 23.9172 13.9068 24 14.3574Z" />
                      <rect className="ps-cc-underline" x="8" y="23" width="16" height="1" rx="0.5" />
                    </g>
                  </svg>
                </CaptionsButton>
              </WithTooltip>

              {/* Settings menu: one root page with a submenu per option group, anchored above the gear button. */}
              <Menu.Root side="top" align="end">
                <WithTooltip label="Settings">
                  <Menu.Trigger className="ps-button ps-settings-button" aria-label="Settings">
                    <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                      <use className="ps-svg-shadow" href="#ps-sutro-settings" />
                      <g id="ps-sutro-settings">
                        <path d="M16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C14.8954 14 14 14.8954 14 16C14 17.1046 14.8954 18 16 18Z" />
                        <path d="M21.0176 13.0362L20.9715 12.9531C20.8445 12.7239 20.7797 12.4629 20.784 12.1982L20.8049 10.8997C20.8092 10.6343 20.675 10.3874 20.4545 10.2549L18.5385 9.10362C18.3186 8.97143 18.0472 8.9738 17.8293 9.10981L16.7658 9.77382C16.5485 9.90953 16.2999 9.98121 16.0465 9.98121H15.9543C15.7004 9.98121 15.4513 9.90922 15.2336 9.77295L14.1652 9.10413C13.9467 8.96728 13.674 8.96518 13.4535 9.09864L11.5436 10.2545C11.3242 10.3873 11.1908 10.6336 11.1951 10.8981L11.216 12.1982C11.2203 12.4629 11.1555 12.7239 11.0285 12.9531L10.9831 13.0351C10.856 13.2645 10.6715 13.4535 10.4493 13.5819L9.36075 14.2109C9.13763 14.3398 8.99942 14.5851 9 14.8511L9.00501 17.152C9.00559 17.4163 9.1432 17.6597 9.36476 17.7883L10.4481 18.4167C10.671 18.546 10.8559 18.7364 10.9826 18.9673L11.0313 19.0559C11.1565 19.284 11.2203 19.5431 11.2161 19.8059L11.1951 21.1003C11.1908 21.3657 11.325 21.6126 11.5456 21.7452L13.4615 22.8964C13.6814 23.0286 13.9528 23.0262 14.1707 22.8902L15.2342 22.2262C15.4515 22.0905 15.7001 22.0188 15.9535 22.0188H16.0457C16.2996 22.0188 16.5487 22.0908 16.7664 22.227L17.8348 22.8959C18.0534 23.0327 18.326 23.0348 18.5465 22.9014L20.4564 21.7455C20.6758 21.6127 20.8092 21.3664 20.8049 21.1019L20.784 19.8018C20.7797 19.5371 20.8445 19.2761 20.9715 19.0469L21.0169 18.9649C21.144 18.7355 21.3285 18.5465 21.5507 18.4181L22.6393 17.7891C22.8624 17.6602 23.0006 17.4149 23 17.1489L22.995 14.848C22.9944 14.5837 22.8568 14.3403 22.6352 14.2117L21.5493 13.5818C21.328 13.4534 21.1442 13.2649 21.0176 13.0362Z" />
                      </g>
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
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                    <use className="ps-svg-shadow" href="#ps-sutro-pip" />
                    <g id="ps-sutro-pip">
                      <path d="M12 22H9.77778C9.34822 22 9 21.6162 9 21.1429V10.8571C9 10.3838 9.34822 10 9.77778 10L22.2222 10C22.6518 10 23 10.3838 23 10.8571V12.5714" />
                      <path d="M15 21.5714V16.4286C15 16.1919 15.199 16 15.4444 16H22.5556C22.801 16 23 16.1919 23 16.4286V17V21.5714C23 21.8081 22.801 22 22.5556 22H20.3333H17.6667H15.4444C15.199 22 15 21.8081 15 21.5714Z" />
                    </g>
                  </svg>
                </PiPButton>
              </WithTooltip>

              <WithTooltip>
                <AirPlayButton className="ps-button ps-airplay-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.5 20h1.722c.43 0 .778-.32.778-.714v-8.572c0-.394-.348-.714-.778-.714H9.778c-.43 0-.778.32-.778.714v1.429"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.5 20H9.778c-.43 0-.778-.32-.778-.714v-8.572c0-.394.348-.714.778-.714h12.444c.43 0 .778.32.778.714v1.429"
                    />
                    <path strokeLinejoin="round" d="m16 19 3.464 3.75h-6.928L16 19Z" />
                  </svg>
                </AirPlayButton>
              </WithTooltip>

              <WithTooltip>
                <CastButton className="ps-button ps-cast-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 32 32">
                    <use className="ps-svg-shadow" href="#ps-sutro-cast" />
                    <g id="ps-sutro-cast">
                      <path d="M18.5 21.833h4.167c.46 0 .833-.373.833-.833V11a.833.833 0 0 0-.833-.833H9.333A.833.833 0 0 0 8.5 11v1.111m0 8.056c.92 0 1.667.746 1.667 1.666M8.5 17.667a4.167 4.167 0 0 1 4.167 4.166" />
                      <path d="M8.5 15.167a6.667 6.667 0 0 1 6.667 6.666" />
                    </g>
                  </svg>
                </CastButton>
              </WithTooltip>

              <WithTooltip>
                <FullscreenButton className="ps-button ps-fullscreen-button">
                  <svg className="ps-icon ps-icon-fs-enter" aria-hidden="true" viewBox="0 0 32 32">
                    <use className="ps-svg-shadow" href="#ps-sutro-fs-enter" />
                    <g id="ps-sutro-fs-enter">
                      <g className="ps-fs-arrow ps-fs-enter-top">
                        <path d="M18 10H22V14" />
                        <path d="M22 10L18 14" />
                      </g>
                      <g className="ps-fs-arrow ps-fs-enter-bottom">
                        <path d="M14 22L10 22V18" />
                        <path d="M10 22L14 18" />
                      </g>
                    </g>
                  </svg>
                  <svg className="ps-icon ps-icon-fs-exit" aria-hidden="true" viewBox="0 0 32 32">
                    <use className="ps-svg-shadow" href="#ps-sutro-fs-exit" />
                    <g id="ps-sutro-fs-exit">
                      <g className="ps-fs-arrow ps-fs-exit-top">
                        <path d="M22 14H18V10" />
                        <path d="M22 10L18 14" />
                      </g>
                      <g className="ps-fs-arrow ps-fs-exit-bottom">
                        <path d="M10 18L14 18V22" />
                        <path d="M14 18L10 22" />
                      </g>
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
