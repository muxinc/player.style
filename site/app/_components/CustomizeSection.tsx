'use client';

import { useSearchParams } from 'next/navigation';

import { getUsageNames } from '@/lib/installation-url';
import { ACCENT_PARAM, parseAccent } from '@/lib/search-params';
import type { FirstPartySkin } from '@/lib/skins';

import AccentPicker from './AccentPicker';
import CodeLine from './CodeLine';

const EXAMPLE_ACCENT = 'f5c518';

export default function CustomizeSection({ skin }: { skin: FirstPartySkin }) {
  const searchParams = useSearchParams();
  const accent = parseAccent(searchParams.get(ACCENT_PARAM));
  const hex = `#${accent ?? EXAMPLE_ACCENT}`;
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
        <CodeLine
          label={accent ? 'HTML' : 'HTML (example)'}
          code={`<${names.html.skin} style="--media-accent-color: ${hex}">`}
        />
        <CodeLine
          label={accent ? 'React' : 'React (example)'}
          code={`<${names.react.skin} style={{ '--media-accent-color': '${hex}' }}>`}
        />
      </div>
    </div>
  );
}
