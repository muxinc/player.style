/** An open edition's files by name (`skin.html`, `skin.css`, `register.ts`, `Skin.tsx`, `README.md`), as text. */
declare module '*/skin.html?open' {
  const files: Readonly<Record<string, string>>;
  export default files;
}
