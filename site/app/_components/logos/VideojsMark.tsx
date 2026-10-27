import type { SVGProps } from 'react';

/** The Video.js 10 square mark (90×90): the brand bars behind a play glyph, the same drawing as the favicon. */
export default function VideojsMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path fill="#fcb116" d="M0 0h90v90H0z" />
      <path fill="#f26222" d="M0 22.5h90V90H0z" />
      <path fill="#ea3837" d="M0 45h90v45H0z" />
      <path fill="#a83b71" d="M0 67.5h90V90H0z" />
      <path fill="#ebe4c1" d="M71.954 45L28.046 73.125v-56.25L71.954 45z" />
    </svg>
  );
}
