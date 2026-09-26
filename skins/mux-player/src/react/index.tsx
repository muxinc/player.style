'use client';

/*
 * Mux Player for Video.js 10, React component.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same icon paths. The shared
 * stylesheet is not imported here so the component stays CSS-agnostic; consumers import
 * `@player.style/mux-player/skin.css`.
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
  SeekButton,
  Slider,
  Time,
  TimeSlider,
  Title,
  Tooltip,
  VolumeSlider,
} from '@videojs/react';
import { AudioTrackRadioGroup } from '@videojs/react/ui/audio-track-radio-group';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

export type MuxPlayerSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/** Mux Player labels rates `1x`, `1.5x`; v10's default is the multiplication sign. */
function formatRate(rate: number): string {
  return `${rate}x`;
}

/* The play triangle and pause bars appear in the centre button and the bar; the tick in two menus. */
const PLAY =
  'M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z';
const PAUSEONE =
  'M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z';
const PAUSETWO =
  'M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z';
const CHECK =
  'M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027';

/** A bar button with its tooltip, shown on hover without delay as media-chrome's were. */
function WithTooltip({ children, label }: { children: ReactElement; label?: ReactNode }) {
  return (
    <Tooltip.Root side="top" delay={0}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Popup className="ps-tooltip">{label ?? <Tooltip.Label className="ps-tooltip-label" />}</Tooltip.Popup>
    </Tooltip.Root>
  );
}

function PlayPauseGlyphs() {
  return (
    <>
      <g className="ps-play-icon">
        <path d={PLAY} />
      </g>
      <g className="ps-pause-icon">
        <path className="ps-pause-pt1" d={PAUSEONE} />
        <path className="ps-pause-pt2" d={PAUSETWO} />
      </g>
    </>
  );
}

function Check() {
  return (
    <svg className="ps-menu-check-icon" aria-hidden="true" viewBox="0 0 14 18">
      <path fillRule="evenodd" d={CHECK} />
    </svg>
  );
}

type RadioItemProps = Omit<ComponentProps<typeof Menu.RadioItem>, 'ref'>;

/** A row with the accent tick: quality and audio tracks. */
function CheckedItem(props: RadioItemProps, item: { label: string; checked: boolean }) {
  return (
    <Menu.RadioItem {...props} className="ps-menu-item">
      <Menu.ItemIndicator className="ps-menu-check" checked={item.checked} forceMount>
        <Check />
      </Menu.ItemIndicator>
      <span className="ps-menu-label">{item.label}</span>
    </Menu.RadioItem>
  );
}

function RateItem(props: RadioItemProps, item: { label: string }) {
  return (
    <Menu.RadioItem {...props} className="ps-menu-item">
      <span className="ps-menu-label">{item.label}</span>
    </Menu.RadioItem>
  );
}

function CaptionsItem(props: RadioItemProps, item: { label: string; checked: boolean }) {
  return (
    <Menu.RadioItem {...props} className="ps-menu-item">
      <Menu.ItemIndicator className="ps-menu-check" checked={item.checked} forceMount>
        <Check />
      </Menu.ItemIndicator>
      <span className="ps-menu-label">{item.label}</span>
      <svg className="ps-menu-badge" aria-hidden="true" viewBox="0 0 26 24">
        <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z" />
      </svg>
    </Menu.RadioItem>
  );
}

/**
 * The Mux Player theme around a `Video`, inside a Video.js `VideoPlayer`.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { MuxPlayerSkin } from '@player.style/mux-player/react';
 *   import '@player.style/mux-player/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg" title="Title">
 *     <MuxPlayerSkin>
 *       <Video src="video.mp4" />
 *     </MuxPlayerSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function MuxPlayerSkin({ children, className, ...rest }: MuxPlayerSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-mux-player', className)}
      data-theme="mux-player"
      data-preset="video"
      {...rest}
    >
      {children}

      <Poster.Root className="ps-poster">
        <Poster.Image className="ps-poster-image" alt="" decoding="async" />
      </Poster.Root>

      <Gesture type="tap" action="togglePaused" pointer="mouse" />
      <Gesture type="tap" action="toggleControls" pointer="touch" />
      <Hotkey keys="Space" action="togglePaused" />
      <Hotkey keys="k" action="togglePaused" />
      <Hotkey keys="m" action="toggleMuted" />
      <Hotkey keys="f" action="toggleFullscreen" />
      <Hotkey keys="c" action="toggleSubtitles" />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-10} />
      <Hotkey keys="j" action="seekStep" value={-10} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} />
      <Hotkey keys="l" action="seekStep" value={10} />
      <Hotkey keys="ArrowUp" action="volumeStep" value={0.025} />
      <Hotkey keys="ArrowDown" action="volumeStep" value={-0.025} />

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
          <ErrorDialog.Close className="ps-dialog-close">Dismiss</ErrorDialog.Close>
        </ErrorDialog.Popup>
      </ErrorDialog.Root>

      <Controls.Root>
        <Controls.Content className="ps-layer">
          {/* The title bar, from the player's `title`, over its own gradient. */}
          <div className="ps-top">
            <Title className="ps-title" />
          </div>

          {/* The big black circle before the first play, or the plain play/pause toggle below 470px. */}
          <div className="ps-center">
            <PlayButton className="ps-center-play">
              <svg className="ps-icon ps-pre-play-icon" aria-hidden="true" viewBox="0 0 18 14">
                <path d={PLAY} />
              </svg>
              <svg className="ps-icon ps-play-icons" aria-hidden="true" viewBox="0 0 18 14">
                <PlayPauseGlyphs />
              </svg>
            </PlayButton>
          </div>

          {/* The seek bar rides on the control bar's top edge; the preview arrow follows the pointer. */}
          <TimeSlider.Root className="ps-time-range">
            <TimeSlider.Track className="ps-time-track">
              <TimeSlider.Buffer className="ps-time-buffer" />
              <TimeSlider.Fill className="ps-time-fill" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="ps-time-thumb" />
            <TimeSlider.Preview className="ps-preview" overflow="clamp">
              <Slider.Thumbnail.Root className="ps-preview-thumbnail">
                <Slider.Thumbnail.Image />
              </Slider.Thumbnail.Root>
              <TimeSlider.Value className="ps-preview-time" type="pointer" />
            </TimeSlider.Preview>
            <div className="ps-preview-arrow" />
          </TimeSlider.Root>

          {/* The control bar, in the original's order. Buttons the media cannot use drop out. */}
          <Tooltip.Provider>
            <div className="ps-bar">
              <WithTooltip>
                <PlayButton className="ps-button ps-play-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 14">
                    <PlayPauseGlyphs />
                  </svg>
                </PlayButton>
              </WithTooltip>

              <WithTooltip>
                <SeekButton className="ps-button ps-seek-button ps-seek-backward" seconds={-10}>
                  <svg className="ps-icon ps-seek-icon" aria-hidden="true" viewBox="0 0 22 14">
                    <path d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z" />
                    <text className="ps-seek-text" transform="translate(6 12)">
                      10
                    </text>
                  </svg>
                </SeekButton>
              </WithTooltip>

              <WithTooltip>
                <SeekButton className="ps-button ps-seek-button ps-seek-forward" seconds={10}>
                  <svg className="ps-icon ps-seek-icon" aria-hidden="true" viewBox="0 0 22 14">
                    <text className="ps-seek-text" transform="translate(-1 12)">
                      10
                    </text>
                    <path d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z" />
                  </svg>
                </SeekButton>
              </WithTooltip>

              <Time.Group className="ps-time-display">
                <Time.Value className="ps-time-value" type="current" toggle />
                <Time.Separator className="ps-time-separator"> / </Time.Separator>
                <Time.Value className="ps-time-value" type="duration" />
              </Time.Group>

              <WithTooltip>
                <MuteButton className="ps-button ps-mute-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 14">
                    <g className="ps-unmuted">
                      <path d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z" />
                      <path
                        className="ps-volume-low"
                        d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
                      />
                      <path
                        className="ps-volume-medium"
                        d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
                      />
                      <path
                        className="ps-volume-high"
                        d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
                      />
                    </g>
                    <g className="ps-muted">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
                      />
                    </g>
                  </svg>
                </MuteButton>
              </WithTooltip>

              <div className="ps-volume">
                <VolumeSlider.Root className="ps-volume-range">
                  <VolumeSlider.Track className="ps-volume-track">
                    <VolumeSlider.Fill className="ps-volume-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="ps-volume-thumb" />
                </VolumeSlider.Root>
              </div>

              <span className="ps-spacer" />

              {/* The quality menu hides its trigger itself while the media has no renditions to choose from. */}
              <Menu.Root side="top" align="start">
                <QualityRadioGroup.Root>
                  <WithTooltip label="Quality">
                    <Menu.Trigger className="ps-button ps-rendition-button" aria-label="Quality">
                      <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 14">
                        <path d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                      </svg>
                    </Menu.Trigger>
                  </WithTooltip>
                  <Menu.Popup className="ps-menu ps-menu-quality">
                    <Menu.Content className="ps-menu-content">
                      <QualityRadioGroup.Options className="ps-menu-group" renderItem={CheckedItem} />
                    </Menu.Content>
                  </Menu.Popup>
                </QualityRadioGroup.Root>
              </Menu.Root>

              {/* Shows the current rate as text (`attr(data-rate)`) and opens the rate menu. */}
              <Menu.Root side="top" align="start">
                <PlaybackRateRadioGroup.Root formatRate={formatRate}>
                  <WithTooltip label="Playback rate">
                    <Menu.Trigger render={<PlaybackRateButton className="ps-button ps-rate-button" />} />
                  </WithTooltip>
                  <Menu.Popup className="ps-menu ps-menu-rate">
                    <Menu.Content className="ps-menu-content">
                      <PlaybackRateRadioGroup.Options className="ps-menu-group" renderItem={RateItem} />
                    </Menu.Content>
                  </Menu.Popup>
                </PlaybackRateRadioGroup.Root>
              </Menu.Root>

              {/* The audio track menu hides its trigger while the media has a single audio track. */}
              <Menu.Root side="top" align="start">
                <AudioTrackRadioGroup.Root>
                  <WithTooltip label="Audio">
                    <Menu.Trigger className="ps-button ps-audio-track-button" aria-label="Audio">
                      <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 16">
                        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
                        <path d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z" />
                      </svg>
                    </Menu.Trigger>
                  </WithTooltip>
                  <Menu.Popup className="ps-menu ps-menu-audio-track">
                    <Menu.Content className="ps-menu-content">
                      <AudioTrackRadioGroup.Options className="ps-menu-group" renderItem={CheckedItem} />
                    </Menu.Content>
                  </Menu.Popup>
                </AudioTrackRadioGroup.Root>
              </Menu.Root>

              <Menu.Root side="top" align="start">
                <CaptionsRadioGroup.Root>
                  {/* The state carrier for the trigger's glyph, as in the HTML element. */}
                  <CaptionsButton className="ps-captions-state" aria-hidden="true" tabIndex={-1} />
                  <WithTooltip label="Captions">
                    <Menu.Trigger className="ps-button ps-captions-button" aria-label="Captions">
                      <svg className="ps-icon ps-captions-on" aria-hidden="true" viewBox="0 0 18 14">
                        <path d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z" />
                      </svg>
                      <svg className="ps-icon ps-captions-off" aria-hidden="true" viewBox="0 0 18 14">
                        <path d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z" />
                        <path d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z" />
                        <path d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z" />
                      </svg>
                    </Menu.Trigger>
                  </WithTooltip>
                  <Menu.Popup className="ps-menu ps-menu-captions">
                    <Menu.Content className="ps-menu-content">
                      <CaptionsRadioGroup.Options
                        className="ps-menu-group ps-captions-group"
                        renderItem={CaptionsItem}
                      />
                    </Menu.Content>
                  </Menu.Popup>
                </CaptionsRadioGroup.Root>
              </Menu.Root>

              <WithTooltip>
                <AirPlayButton className="ps-button ps-airplay-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z" />
                    <path d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z" />
                  </svg>
                </AirPlayButton>
              </WithTooltip>

              <WithTooltip>
                <CastButton className="ps-button ps-cast-button">
                  <svg className="ps-icon ps-cast-enter" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z" />
                  </svg>
                  <svg className="ps-icon ps-cast-exit" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z" />
                    <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
                  </svg>
                </CastButton>
              </WithTooltip>

              <WithTooltip>
                <PiPButton className="ps-button ps-pip-button">
                  <svg className="ps-icon" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z" />
                    <path d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z" />
                  </svg>
                </PiPButton>
              </WithTooltip>

              <WithTooltip>
                <FullscreenButton className="ps-button ps-fullscreen-button">
                  <svg className="ps-icon ps-fullscreen-enter" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z" />
                    <path d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z" />
                    <path d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z" />
                    <path d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z" />
                  </svg>
                  <svg className="ps-icon ps-fullscreen-exit" aria-hidden="true" viewBox="0 0 18 14">
                    <path d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z" />
                    <path d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z" />
                    <path d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z" />
                    <path d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z" />
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
