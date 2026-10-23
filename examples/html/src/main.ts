// The players for the video and audio presets, and Mux media for the HLS stream.
import '@videojs/html/video/player';
import '@videojs/html/audio/player';
import '@videojs/html/media/mux-audio';
// Each skin's HTML entry defines its `<name>-skin` element on import.
import '@player.style/yt/html';
import '@player.style/sutro-audio/html';
// The elements adopt their stylesheet into their shadow roots, so these are optional on a page; they are here so the
// build also resolves each package's `./skin.css` export.
import '@player.style/yt/skin.css';
import '@player.style/sutro-audio/skin.css';
import './style.css';
