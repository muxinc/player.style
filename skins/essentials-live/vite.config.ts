import { defineSkinConfig } from 'build-skin';

/* The stylesheet is @player.style/essentials's; this package ships a copy of it as `dist/skin.css`. */
export default defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../essentials/src/skin.css' });
