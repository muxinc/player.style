// The players for the three presets, and Mux media for the HLS streams.
import '@videojs/html/video/player';
import '@videojs/html/audio/player';
import '@videojs/html/live-video/player';
import '@videojs/html/media/mux-audio';
import '@videojs/html/media/mux-video';
// Each skin's HTML entry defines its `<name>-skin` element on import.
import '@player.style/yt/html';
import '@player.style/sutro-audio/html';
import '@player.style/microvideo-live/html';
// The elements adopt their stylesheet into their shadow roots, so these are optional on a page; they are here so the
// build also resolves each package's `./skin.css` export.
import '@player.style/yt/skin.css';
import '@player.style/sutro-audio/skin.css';
import '@player.style/microvideo-live/skin.css';
import './style.css';
