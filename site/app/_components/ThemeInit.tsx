import { THEME_COLORS, THEME_KEY } from './theme';

/*
 * Runs before first paint so the `.dark` class is on <html> before any styles resolve, which avoids a flash of the
 * wrong theme. Mirrors `applyThemePreference` in `theme.ts`; keep the two in step.
 */
const script = `(function(){
  var KEY=${JSON.stringify(THEME_KEY)};var COLORS=${JSON.stringify(THEME_COLORS)};
  function apply(){
    var root=document.documentElement;var value;
    try{value=localStorage.getItem(KEY)}catch(e){}
    if(value!=='light'&&value!=='dark'&&value!=='system'){value='system';try{localStorage.setItem(KEY,value)}catch(e){}}
    var dark=value==='dark'||(value==='system'&&!!(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches));
    root.classList.toggle('dark',dark);
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',dark?COLORS.dark:COLORS.light);
  }
  apply();
  if(window.matchMedia){window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',apply)}
})();`;

/** Inline theme bootstrap for the document head. */
export default function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
