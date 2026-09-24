import { getUsageNames } from '@/lib/installation-url';
import { getDefaultUseCase, type Skin, type UseCase } from '@/lib/skins';
import { getThirdPartyNames } from '@/lib/third-party-usage';

import AccentCodeLines from './AccentCodeLines';
import AccentPicker from './AccentPicker';
import InlineCode from './InlineCode';
import { textLink } from './ui';

/** The tag and component a customization line targets, for either kind of skin and the picked use case. */
function getSkinNames(skin: Skin, useCase: UseCase): { htmlSkin: string; reactSkin: string } {
  if (skin.kind === 'first-party') {
    const names = getUsageNames(skin);

    return { htmlSkin: names.html.skin, reactSkin: names.react.skin };
  }

  const names = getThirdPartyNames(skin, useCase);

  return { htmlSkin: names.htmlTag, reactSkin: names.reactComponent };
}

export default function CustomizeSection({
  skin,
  useCase = getDefaultUseCase(skin),
}: {
  skin: Skin;
  useCase?: UseCase;
}) {
  const names = getSkinNames(skin, useCase);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="font-display text-h4 uppercase">Accent color</p>
          <AccentPicker id="detail-accent-color" />
        </div>
        <p className="text-p2 text-pretty">
          <InlineCode>--media-accent-color</InlineCode> is the public theming token in Video.js 10 skins; set it on the
          skin or any ancestor and every control follows.{' '}
          <a
            className={textLink}
            href="https://videojs.org/docs/guides/customize-skins"
            target="_blank"
            rel="noreferrer"
          >
            More ways to customize skins
          </a>
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <AccentCodeLines htmlSkin={names.htmlSkin} reactSkin={names.reactSkin} />
      </div>
    </div>
  );
}
