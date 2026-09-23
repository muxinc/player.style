import { MUX_URL } from './nav-links';
import PageFrame from './PageFrame';

const linkClassName = 'underline decoration-1 underline-offset-[0.3em] hover:text-black';

export default function Footer() {
  return (
    <PageFrame as="footer">
      <div className="text-md text-gray-dark flex flex-col gap-0.5 px-1 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} player.style · A{' '}
          <a className={linkClassName} href="https://videojs.org" target="_blank" rel="noreferrer">
            Video.js
          </a>{' '}
          and{' '}
          <a className={linkClassName} href={MUX_URL} target="_blank" rel="noreferrer">
            Mux
          </a>{' '}
          project
        </p>
        <a className={linkClassName} href="https://github.com/muxinc/player.style" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </PageFrame>
  );
}
