'use client';

/*
 * Halloween for Video.js 10, React edition.
 *
 * Keep the tree in step with ../html/template.html: same primitives, same class names, same artwork. The cobweb and
 * the spider are drawn by the shared stylesheet (inlined SVG data URIs), which is not imported here so the component
 * stays CSS-agnostic; consumers import `@player.style/halloween/skin.css`.
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
  Slider,
  TimeSlider,
  VolumeSlider,
} from '@videojs/react';

export type HalloweenSkinProps = ContainerProps;

function classNames(...names: (string | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The Halloween theme around a `Video`, inside a Video.js `VideoPlayer`: a jack-o'-lantern play button, a cobweb
 * timeline with a spider for a thumb, and a candle for a volume range.
 *
 * @example
 *   ```tsx
 *   import { Video, VideoPlayer } from '@videojs/react/video';
 *   import { HalloweenSkin } from '@player.style/halloween/react';
 *   import '@player.style/halloween/skin.css';
 *
 *   <VideoPlayer poster="poster.jpg">
 *     <HalloweenSkin>
 *       <Video src="video.mp4" />
 *     </HalloweenSkin>
 *   </VideoPlayer>;
 *   ```;
 */
export function HalloweenSkin({ children, className, ...rest }: HalloweenSkinProps) {
  return (
    <Container
      className={classNames('media-skin ps-halloween', className)}
      data-theme="halloween"
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
          {/* The pumpkin: a centred play button whose carved face lights up while the video plays. */}
          <div className="ps-center">
            <PlayButton className="ps-button ps-play-button">
              <svg
                className="ps-icon ps-pumpkin"
                aria-hidden="true"
                width="48"
                height="48"
                fill="none"
                viewBox="0 0 48 48"
              >
                <g>
                  <path
                    fill="#FF8000"
                    fillRule="evenodd"
                    d="M21.252 11.127c-2.784.412-6.001 1.646-7.288 2.816-1.761 1.603-3.986 4.736-5.337 7.51-.653 1.36-.717 1.35-.41-.053.505-2.278 1.412-4.04 3.322-6.476.442-.57.833-1.15.864-1.297.275-1.076-2.658-.844-5.178.411-2.932 1.466-5.369 4.42-6.54 7.921C.18 23.478 0 24.669 0 26.463c0 5.811 1.888 11.517 4.862 14.702.95 1.013 1.74 1.635 2.869 2.226 1.086.57 1.898.843 3.154 1.065.759.126 1.096.242 1.518.517 2.331 1.518 5.274 2.183 8.3 1.856 1.056-.116 1.214-.105 2.058.105 1.023.254 1.909.232 2.794-.073.422-.148.644-.148 1.55-.053 1.446.158 2.353.148 3.682-.053 1.74-.253 3.407-.875 4.799-1.782.422-.275.76-.39 1.519-.517 3.765-.644 6.58-2.995 8.553-7.14 1.54-3.249 2.331-6.93 2.342-10.853.01-1.846-.2-3.112-.76-4.715-1.17-3.301-3.596-6.254-6.244-7.583-.896-.454-2.32-.802-3.111-.76l-.601.032.58.306c1.234.643 2.363 2.204 2.995 4.124.623 1.845 1.023 4.651 1.002 6.898l-.01 1.223-.148-1.181c-.169-1.382-.58-3.301-.96-4.451-.358-1.076-1.17-2.785-1.73-3.607-1.054-1.582-2.89-3.112-4.535-3.797-.843-.348-1.867-.623-2.352-.623h-.295l.327.37c.76.864 1.371 2.731 1.635 5.01l.074.58-.338-.58c-1.519-2.637-2.848-4.082-4.767-5.2-1.783-1.034-3.017-1.35-5.4-1.392-.981-.022-1.93-.01-2.11.01ZM19 27.6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm14.5 3.1a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
                    clipRule="evenodd"
                  />
                  <g>
                    <path
                      fill="#0BB037"
                      d="M30.375.158c-.727.074-1.444.137-1.592.137-.222.01-.56.359-1.846 1.92l-1.571 1.909-1.224.728-1.234.717-1.698 2.51c-.928 1.371-1.677 2.52-1.656 2.542.021.021.253-.032.507-.116 1.096-.38 2.14-.527 3.617-.527 1.72 0 2.658.2 3.987.854.443.221.812.38.812.348.01-.032-.095-1.129-.232-2.436l-.232-2.374.991-2.14c.538-1.182 1.023-2.163 1.055-2.184.042-.02 1.181.274 2.542.675l2.468.717.063 1.097c.042.601.074 1.646.085 2.31l.01 1.213-1.107.559c-.612.295-1.15.548-1.213.548-.18 0-1.044-.58-1.055-.706 0-.064.169-.56.37-1.097.21-.538.358-1.013.347-1.065-.042-.116-2.489 1.93-2.5 2.077-.01.064.623.739 1.403 1.52l1.414 1.402 1.592-1.013c.876-.57 1.614-1.065 1.635-1.107.106-.158 1.234-6.254 1.192-6.381C37.21 2.563 32.316-.011 31.989 0c-.158.01-.886.074-1.614.158Z"
                    />
                  </g>
                  <g className="ps-face">
                    <path d="M29.48 37v1.411l-2.44 1.619v-2.795h-6.08v2.795l-2.44-1.619v-1.41S11.286 36.058 8 34c0 0 .091 3.088 4.491 6.148l.966-1.942 2.23 1.723-.271 1.483S18.85 42.648 22.348 43v-2.677h3.304V43c3.497-.352 6.932-1.588 6.932-1.588l-.27-1.483 2.23-1.723.965 1.942C39.909 37.088 40 34 40 34c-3.285 2.058-10.52 3-10.52 3Z" />
                    <path d="M15 21c-2.761 0-5 2.35-5 5.25 0 2.1 1.173 3.91 2.869 4.75a3.813 3.813 0 0 1-1.446-3.017c0-2.074 1.601-3.756 3.577-3.756s3.578 1.682 3.578 3.756A3.817 3.817 0 0 1 17.133 31C18.826 30.16 20 28.35 20 26.25c0-2.9-2.239-5.25-5-5.25Z" />
                    <path d="M33.5 20c-3.037 0-5.5 2.35-5.5 5.25 0 2.1 1.29 3.91 3.155 4.75-.965-.685-1.59-1.78-1.59-3.017 0-2.074 1.761-3.756 3.935-3.756 2.173 0 3.936 1.682 3.936 3.756 0 1.237-.626 2.332-1.59 3.017C37.71 29.16 39 27.35 39 25.25c0-2.9-2.463-5.25-5.5-5.25Z" />
                    <path className="ps-icon-play" d="M28 30.999 22 28v6l6-3.001Z" />
                    <g className="ps-icon-pause">
                      <path fillRule="evenodd" d="M25 28h1l2 5.226-3 .756V28Z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M24 28h-1l-2 5.226 3 .756V28Z" clipRule="evenodd" />
                    </g>
                  </g>
                </g>
              </svg>
            </PlayButton>
          </div>

          <div className="ps-bar">
            {/* A cobweb for a track and a spider for a thumb. */}
            <div className="ps-range">
              <TimeSlider.Root className="ps-time-slider">
                <TimeSlider.Track className="ps-track">
                  <TimeSlider.Buffer className="ps-buffer" />
                  <TimeSlider.Fill className="ps-fill" />
                </TimeSlider.Track>
                {/* The box rotates about the web's right end while playing, so the spider walks. */}
                <div className="ps-spider-box">
                  <TimeSlider.Thumb className="ps-spider" />
                </div>
                {/* media-chrome placed the preview across the padded range, so a rail 30px wider each side carries it. */}
                <div className="ps-rail">
                  <TimeSlider.Preview className="ps-preview" overflow="clamp">
                    <Slider.Thumbnail.Root className="ps-thumbnail">
                      <Slider.Thumbnail.Image />
                    </Slider.Thumbnail.Root>
                    <TimeSlider.Value className="ps-preview-time" type="pointer" />
                  </TimeSlider.Preview>
                </div>
              </TimeSlider.Root>
            </div>

            {/* A candle for a volume range: the wax is the fill, the flame the thumb, and the glow follows the level. */}
            <div className="ps-volume">
              {/* Not a control: v10 reflects the volume level on the mute button only, and the glow needs it. */}
              <MuteButton className="ps-volume-state" tabIndex={-1} aria-hidden="true" />
              <div className="ps-volume-box">
                <VolumeSlider.Root className="ps-volume-range" orientation="vertical">
                  <VolumeSlider.Track className="ps-candle">
                    <VolumeSlider.Fill className="ps-wax" />
                  </VolumeSlider.Track>
                  <div className="ps-flame-box">
                    <VolumeSlider.Thumb className="ps-flame" />
                  </div>
                </VolumeSlider.Root>
              </div>
            </div>
          </div>
        </Controls.Content>
      </Controls.Root>
    </Container>
  );
}
