/*
 * Two hand-made players for the rule tests (../tests/rules.test.ts): `broken` breaks every rule once, `clean` uses
 * every allowance and breaks none. `?skin=` names the one to render.
 */
import { install, MEDIA } from './runtime.ts';

const PLAYER = `position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: clip; background: #000; color: #fff;
  font: 14px/1.2 sans-serif;`;
const BUTTON = 'position: absolute; margin: 0; padding: 0; border: 0; background: #fff;';

const FIXTURES: Record<string, string> = {
  broken: `
    <div class="row" style="position: absolute; top: 0; left: 0; right: 0; display: flex;">
      <div class="block" style="flex: none; width: 200px; height: 20px; background: #c00;"></div>
      <div class="block" style="flex: none; width: 200px; height: 20px; background: #0c0;"></div>
    </div>
    <button class="off" aria-label="Off" style="${BUTTON} right: -30px; top: 40px; width: 60px; height: 60px;"></button>
    <button class="small" aria-label="Small" style="${BUTTON} left: 10px; top: 40px; width: 24px; height: 24px;"></button>
    <span class="alpha" style="position: absolute; left: 100px; top: 110px;">Alpha</span>
    <span class="beta" style="position: absolute; left: 110px; top: 112px;">Beta</span>
    <div class="narrow" style="position: absolute; left: 100px; top: 140px; width: 30px; white-space: nowrap;">Overflowing text</div>
    <button class="menu" aria-label="Menu" popovertarget="fixture-menu" style="${BUTTON} left: 150px; top: 40px; width: 48px; height: 48px;"></button>
    <div id="fixture-menu" class="popup" popover style="position: fixed; inset: auto; left: 0; top: 300px; width: 200px; height: 100px; margin: 0;"></div>
  `,
  clean: `
    <style>
      .reach { position: absolute; top: 40px; left: 10px; display: flex; gap: 20px; }
      .reach button { position: relative; flex: none; width: 24px; height: 24px; margin: 0; padding: 0; border: 0; background: #fff; }
      .reach button::before { content: ""; position: absolute; inset: -10px; }
    </style>
    <div class="reach"><button aria-label="Mute"></button><button aria-label="Captions"></button></div>
    <button class="round" aria-label="Round" style="${BUTTON} left: 120px; top: 30px; width: 44px; height: 44px; border-radius: 50%;"></button>
    <button class="play-small" aria-label="Play" style="${BUTTON} left: 190px; top: 40px; width: 20px; height: 20px;"></button>
    <button class="play-big" aria-label="Play" style="${BUTTON} left: 230px; top: 20px; width: 60px; height: 60px;"></button>
    <div class="title" style="position: absolute; left: 10px; top: 100px; width: 40px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">A long title</div>
    <div class="decoration" style="position: absolute; right: -20px; top: 100px; width: 60px; height: 20px; background: #0c0;"></div>
    <div class="slider" data-orientation="horizontal" style="position: absolute; left: 10px; right: 10px; bottom: 0; height: 44px;">
      <div class="thumb" role="slider" aria-label="Seek" tabindex="0" style="position: absolute; left: -18px; top: 14px; width: 16px; height: 16px; background: #fff;"></div>
    </div>
    <button class="menu" aria-label="Menu" popovertarget="fixture-menu" style="${BUTTON} left: 150px; top: 90px; width: 48px; height: 48px;"></button>
    <div id="fixture-menu" class="popup" popover style="position: fixed; inset: auto; left: 40px; top: 60px; width: 100px; height: 60px; margin: 0;"></div>
  `,
};

install(async ({ skin }) => {
  const markup = FIXTURES[skin];
  if (!markup) throw new Error(`No fixture named ${skin}.`);

  document.getElementById('root')!.innerHTML = `
    <div class="media-skin" data-controls-visible style="${PLAYER}">
      <video src="${MEDIA.src}" preload="auto" playsinline style="display: block; width: 100%; height: 100%;"></video>
      ${markup}
    </div>
  `;
});
