'use client';

/*
 * Plyr for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import `@player.style/plyr/skin.css`.
 */
import {
  AirPlayButton,
  BufferingIndicator,
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
  Time,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';
import type { ReactNode } from 'react';

export type PlyrSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/* Plyr's sprite glyphs (`plyr.svg`, 18 × 18). Play is drawn twice, and both caption states share one path. */
const PLAY =
  'M15.562 8.1 3.87.225c-.818-.562-1.87 0-1.87.9v15.75c0 .9 1.052 1.462 1.87.9L15.563 9.9c.584-.45.584-1.35 0-1.8';
const CAPTIONS =
  'M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3s.5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7s1.65 3.69 3.63 3.69m7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7s1.65 3.69 3.63 3.69';

/** Plyr's speed labels: `Normal` for 1, `1.5×` otherwise. */
function formatRate(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}×`;
}

/** A settings page's entry in the root menu: its name, the current value, and Plyr's ▸ caret (drawn in CSS). */
function ForwardItem({ children, value }: { children: ReactNode; value: ReactNode }) {
  return (
    <Menu.Trigger className="ps-menu-item ps-menu-forward">
      <span className="ps-menu-label">{children}</span>
      {value}
    </Menu.Trigger>
  );
}

/**
 * The Plyr skin around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { PlyrSkin } from '@player.style/plyr/react';
 *   import '@player.style/plyr/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <PlyrSkin>
 *       <Video src="video.mp4" />
 *     </PlyrSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function PlyrSkin({ children, className, ...rest }: PlyrSkinProps) {
  return (
    <Container className={classNames('media-skin ps-plyr', className)} data-theme="plyr" data-preset="video" {...rest}>
      {children}

      <Poster.Root className="ps-poster">
        <Poster.Image className="ps-poster-image" alt="" decoding="async" />
      </Poster.Root>

      {/* A click on the picture plays or pauses and a double click toggles fullscreen, as Plyr's container did. */}
      <Gesture type="tap" action="togglePaused" pointer="mouse" />
      <Gesture type="doubletap" action="toggleFullscreen" pointer="mouse" />
      {/* Plyr's `keyboard: { focused: true }` shortcuts. */}
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-10} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.1} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.1} />
      <Hotkey keys="0-9" action="seekToPercent" />

      {/* The large play button, over the picture whenever playback is not running. */}
      <PlayButton className="ps-big-play">
        <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 18">
          <path d={PLAY} />
        </svg>
      </PlayButton>

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
          {/* The control bar over its black gradient, in Plyr's default `controls` order. */}
          <div className="ps-controls-bar">
            <PlayButton className="ps-button ps-play-button">
              <svg className="ps-icon ps-icon-play" aria-hidden="true" viewBox="0 0 18 18">
                <path d={PLAY} />
              </svg>
              <svg className="ps-icon ps-icon-pause" aria-hidden="true" viewBox="0 0 18 18">
                <path d="M6 1H3c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1m6 0c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z" />
              </svg>
            </PlayButton>

            {/*
             * The progress bar. The slider is inset half a thumb from either end, so the thumb's centre travels its
             * whole width, while the track, buffer and loading stripes reach back out to the container's edges as
             * Plyr's did.
             */}
            <div className="ps-progress-container">
              <TimeSlider.Root className="ps-progress">
                <TimeSlider.Track className="ps-progress-track">
                  <TimeSlider.Buffer className="ps-progress-buffer" />
                  <BufferingIndicator className="ps-progress-loading" delay={250} />
                  <TimeSlider.Fill className="ps-progress-fill" />
                </TimeSlider.Track>
                <TimeSlider.Thumb className="ps-thumb ps-progress-thumb" />
                <TimeSlider.Preview className="ps-tooltip" overflow="visible">
                  <TimeSlider.Value className="ps-tooltip-value" type="pointer" />
                </TimeSlider.Preview>
              </TimeSlider.Root>
            </div>

            {/* Plyr's current-time slot: the duration until playback starts, then the time left. */}
            <Time.Value className="ps-time ps-time-duration" type="duration" />
            <Time.Value className="ps-time ps-time-remaining" type="remaining" />

            <div className="ps-volume">
              <MuteButton className="ps-button ps-mute-button">
                <svg className="ps-icon ps-icon-muted" aria-hidden="true" viewBox="0 0 18 18">
                  <path d="m12.4 12.5 2.1-2.1 2.1 2.1 1.4-1.4L15.9 9 18 6.9l-1.4-1.4-2.1 2.1-2.1-2.1L11 6.9 13.1 9 11 11.1zM3.786 6.008H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601z" />
                </svg>
                <svg className="ps-icon ps-icon-volume" aria-hidden="true" viewBox="0 0 18 18">
                  <path d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7" />
                  <path d="M11.282 5.282a.91.91 0 0 0 0 1.316c.735.735.995 1.458.995 2.402 0 .936-.425 1.917-.995 2.487a.91.91 0 0 0 0 1.316c.145.145.636.262 1.018.156a.7.7 0 0 0 .298-.156C13.773 11.733 14.13 10.16 14.13 9q.001-.255-.011-.51c-.053-.992-.319-2.005-1.522-3.208a.91.91 0 0 0-1.316 0m-7.495.726H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601z" />
                </svg>
              </MuteButton>
              <VolumeSlider.Root className="ps-volume-slider">
                <VolumeSlider.Track className="ps-volume-track">
                  <VolumeSlider.Fill className="ps-volume-fill" />
                </VolumeSlider.Track>
                <VolumeSlider.Thumb className="ps-thumb ps-volume-thumb" />
              </VolumeSlider.Root>
            </div>

            <CaptionsButton className="ps-button ps-captions-button">
              <svg className="ps-icon ps-icon-captions-off" aria-hidden="true" viewBox="0 0 18 18">
                <path fillOpacity=".5" fillRule="evenodd" d={CAPTIONS} />
              </svg>
              <svg className="ps-icon ps-icon-captions-on" aria-hidden="true" viewBox="0 0 18 18">
                <path fillRule="evenodd" d={CAPTIONS} />
              </svg>
            </CaptionsButton>

            {/* Settings: Captions, Quality and Speed pages, each shown only when the media offers the choice. */}
            <Menu.Root side="top" align="end">
              <Menu.Trigger className="ps-button ps-settings-button" aria-label="Settings">
                <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 18">
                  <path d="M16.135 7.784a2 2 0 0 1-1.23-2.969c.322-.536.225-.998-.094-1.316l-.31-.31c-.318-.318-.78-.415-1.316-.094a2 2 0 0 1-2.969-1.23C10.065 1.258 9.669 1 9.219 1h-.438c-.45 0-.845.258-.997.865a2 2 0 0 1-2.969 1.23c-.536-.322-.999-.225-1.317.093l-.31.31c-.318.318-.415.781-.093 1.317a2 2 0 0 1-1.23 2.969C1.26 7.935 1 8.33 1 8.781v.438c0 .45.258.845.865.997a2 2 0 0 1 1.23 2.969c-.322.536-.225.998.094 1.316l.31.31c.319.319.782.415 1.316.094a2 2 0 0 1 2.969 1.23c.151.607.547.865.997.865h.438c.45 0 .845-.258.997-.865a2 2 0 0 1 2.969-1.23c.535.321.997.225 1.316-.094l.31-.31c.318-.318.415-.781.094-1.316a2 2 0 0 1 1.23-2.969c.607-.151.865-.547.865-.997v-.438c0-.451-.26-.846-.865-.997M9 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                </svg>
              </Menu.Trigger>
              <Menu.Popup className="ps-menu">
                <Menu.Content className="ps-menu-content">
                  <Menu.Root>
                    <CaptionsRadioGroup.Root>
                      <ForwardItem value={<CaptionsRadioGroup.Value className="ps-menu-value" />}>Captions</ForwardItem>
                      <Menu.Content className="ps-menu-content">
                        <Menu.Item className="ps-menu-item ps-menu-back">Captions</Menu.Item>
                        <CaptionsRadioGroup.Options
                          className="ps-menu-group"
                          renderItem={(props, item) => (
                            <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio">
                              <span className="ps-menu-label">{item.label}</span>
                            </Menu.RadioItem>
                          )}
                        />
                      </Menu.Content>
                    </CaptionsRadioGroup.Root>
                  </Menu.Root>

                  <Menu.Root>
                    <QualityRadioGroup.Root>
                      <ForwardItem value={<QualityRadioGroup.Value className="ps-menu-value" />}>Quality</ForwardItem>
                      <Menu.Content className="ps-menu-content">
                        <Menu.Item className="ps-menu-item ps-menu-back">Quality</Menu.Item>
                        <QualityRadioGroup.Options
                          className="ps-menu-group"
                          renderItem={(props, item) => (
                            <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio">
                              <span className="ps-menu-label">{item.label}</span>
                              <span className="ps-menu-badge">{item.badge}</span>
                            </Menu.RadioItem>
                          )}
                        />
                      </Menu.Content>
                    </QualityRadioGroup.Root>
                  </Menu.Root>

                  <Menu.Root>
                    <PlaybackRateRadioGroup.Root formatRate={formatRate}>
                      <ForwardItem value={<PlaybackRateRadioGroup.Value className="ps-menu-value" />}>
                        Speed
                      </ForwardItem>
                      <Menu.Content className="ps-menu-content">
                        <Menu.Item className="ps-menu-item ps-menu-back">Speed</Menu.Item>
                        <PlaybackRateRadioGroup.Options
                          className="ps-menu-group"
                          renderItem={(props, item) => (
                            <Menu.RadioItem {...props} className="ps-menu-item ps-menu-radio">
                              <span className="ps-menu-label">{item.label}</span>
                            </Menu.RadioItem>
                          )}
                        />
                      </Menu.Content>
                    </PlaybackRateRadioGroup.Root>
                  </Menu.Root>
                </Menu.Content>
              </Menu.Popup>
            </Menu.Root>

            <PiPButton className="ps-button ps-pip-button">
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 18">
                <path d="M13.293 3.293 7.022 9.564l1.414 1.414 6.271-6.271L17 7V1h-6z" />
                <path d="M13 15H3V5h5V3H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6h-2z" />
              </svg>
            </PiPButton>

            <AirPlayButton className="ps-button ps-airplay-button">
              <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 18">
                <path d="M16 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v-2H3V3h12v8h-2v2h3a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1" />
                <path d="M4 17h10l-5-6z" />
              </svg>
            </AirPlayButton>

            <FullscreenButton className="ps-button ps-fullscreen-button">
              <svg className="ps-icon ps-icon-fullscreen-enter" aria-hidden="true" viewBox="0 0 18 18">
                <path d="M10 3h3.6l-4 4L11 8.4l4-4V8h2V1h-7zM7 9.6l-4 4V10H1v7h7v-2H4.4l4-4z" />
              </svg>
              <svg className="ps-icon ps-icon-fullscreen-exit" aria-hidden="true" viewBox="0 0 18 18">
                <path d="M1 12h3.6l-4 4L2 17.4l4-4V17h2v-7H1zM16 .6l-4 4V1h-2v7h7V6h-3.6l4-4z" />
              </svg>
            </FullscreenButton>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
