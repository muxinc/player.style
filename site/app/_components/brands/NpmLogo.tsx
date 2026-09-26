import type { SVGProps } from 'react';

/** Brand mark from the Video.js 10 site's `assets/logos/brands/npm.svg`. */
export default function NpmLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" aria-hidden="true" {...props}>
      <path fill="#c12127" d="M0 256V0h256v256z" />
      <path fill="#fff" d="M48 48h160v160h-32V80h-48v128H48z" />
    </svg>
  );
}
