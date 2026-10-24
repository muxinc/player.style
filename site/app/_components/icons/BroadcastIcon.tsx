import type { SVGProps } from 'react';

export default function BroadcastIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="1.75" />
      <path d="M4.464 4.464a.75.75 0 0 1 0 1.061 3.5 3.5 0 0 0 0 4.95.75.75 0 1 1-1.06 1.06 5 5 0 0 1 0-7.07.75.75 0 0 1 1.06 0Zm7.072 0a.75.75 0 0 1 1.06 0 5 5 0 0 1 0 7.07.75.75 0 1 1-1.06-1.06 3.5 3.5 0 0 0 0-4.95.75.75 0 0 1 0-1.06ZM2.343 2.343a.75.75 0 0 1 0 1.06 6.5 6.5 0 0 0 0 9.193.75.75 0 1 1-1.06 1.061 8 8 0 0 1 0-11.314.75.75 0 0 1 1.06 0Zm11.314 0a.75.75 0 0 1 1.06 0 8 8 0 0 1 0 11.314.75.75 0 1 1-1.06-1.06 6.5 6.5 0 0 0 0-9.193.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}
