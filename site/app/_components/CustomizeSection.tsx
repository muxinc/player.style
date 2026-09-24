import { getUsageNames } from '@/lib/installation-url';
import type { Skin } from '@/lib/skins';
import { getThirdPartyNames } from '@/lib/third-party-usage';

import AccentCodeLines from './AccentCodeLines';
import AccentPicker from './AccentPicker';

/** The tag and component a customization line targets, for either kind of skin. */
function getSkinNames(skin: Skin): { htmlSkin: string; reactSkin: string } {
  if (skin.kind === 'first-party') {
    const names = getUsageNames(skin);

    return { htmlSkin: names.html.skin, reactSkin: names.react.skin };
  }

  const names = getThirdPartyNames(skin);

  return { htmlSkin: names.htmlTag, reactSkin: names.reactComponent };
}

export default function CustomizeSection({ skin }: { skin: Skin }) {
  const names = getSkinNames(skin);

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
        <AccentCodeLines htmlSkin={names.htmlSkin} reactSkin={names.reactSkin} />
      </div>
    </div>
  );
}
