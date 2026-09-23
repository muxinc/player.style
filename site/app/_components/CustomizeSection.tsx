import { getUsageNames } from '@/lib/installation-url';
import type { FirstPartySkin } from '@/lib/skins';

import AccentCodeLines from './AccentCodeLines';
import AccentPicker from './AccentPicker';

export default function CustomizeSection({ skin }: { skin: FirstPartySkin }) {
  const names = getUsageNames(skin);

  return (
    <div className="grid gap-1 px-1 py-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-2 md:px-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <AccentPicker id="detail-accent-color" />
        <p className="text-md leading-normal tracking-wide text-pretty">
          <code className="font-mono text-sm">--media-accent-color</code> is the public theming token in Video.js 10
          skins; set it on the skin or any ancestor and every control follows.{' '}
          <a
            className="underline decoration-1 underline-offset-[0.3em] hover:no-underline"
            href="https://videojs.org/docs/guides/customize-skins"
            target="_blank"
            rel="noreferrer"
          >
            More ways to customize skins ↗
          </a>
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-0.75">
        <AccentCodeLines htmlSkin={names.html.skin} reactSkin={names.react.skin} />
      </div>
    </div>
  );
}
