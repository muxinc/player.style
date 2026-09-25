import clsx from 'clsx';

import { getSkinHref } from '@/lib/search-params';
import { getSkinUseCasesLabel, isAudioSkin, isFixedSizeSkin, type Skin, type UseCase } from '@/lib/skins';

import AccentLink from './AccentLink';
import AuthorLink from './AuthorLink';
import Badge from './Badge';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SkinPreview from './SkinPreview';
import { focusRing } from './ui';

type SkinCardProps = {
  skin: Skin;
  /** The use case the card previews and links to; a skin covering several opens on the one the filter asks for. */
  useCase: UseCase;
};

const cardLink = `rounded-sm corner-squircle underline decoration-transparent intent:decoration-gold ${focusRing}`;

/**
 * A gallery card: the live preview over the skin's title, badges, description, and author. The card spans four rows
 * of the gallery grid and subgrids them, so side-by-side cards line up their titles, descriptions, and footers even
 * when one preview is taller. It is not a link, since the preview is a working player: the title and "View skin" link to
 * the skin page instead. A skin that also ships a live video package stays one card.
 */
export default function SkinCard({ skin, useCase }: SkinCardProps) {
  const href = getSkinHref(skin, useCase);
  const audio = isAudioSkin(skin);
  // Audio bars and fixed-size skins sit centred on a 16:9 backdrop, so every preview is at least the same shape and a
  // taller neighbour just grows the backdrop. A grid item with an aspect ratio aligns to `start` by default and would
  // derive its width from the stretched row height, so the preview cell stretches explicitly on both axes.
  const fixedSize = isFixedSizeSkin(skin);
  const centred = audio || fixedSize;

  return (
    <article className="corner-squircle border-line bg-surface row-span-4 grid grid-cols-1 grid-rows-subgrid gap-y-0 overflow-hidden rounded-xl border">
      <div
        className={clsx(
          'flex flex-col justify-center self-stretch justify-self-stretch p-3 md:p-4',
          centred && 'bg-surface-raised aspect-video items-center',
          // A fixed-size skin sits centred in the cell, so its side padding changes nothing until a 320px phone, where
          // it would clip Winamp's 275px windows.
          fixedSize && 'px-0 md:px-0'
        )}
      >
        <SkinPreview skin={skin} useCase={useCase} preload="none" className={clsx(audio && 'max-w-md')} />
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 md:px-5 md:pt-4">
        <h2 className="font-display text-h3 mr-1 uppercase">
          <AccentLink href={href} className={cardLink}>
            {skin.title}
          </AccentLink>
        </h2>
        <Badge>{getSkinUseCasesLabel(skin)}</Badge>
        <Badge tone="accent">{skin.kind === 'first-party' ? 'First-party' : 'Community'}</Badge>
      </div>
      <p className="text-p3 px-4 pt-3 text-pretty md:px-5">{skin.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-4 md:px-5 md:pb-5">
        <AuthorLink author={skin.author} />
        <AccentLink href={href} className={clsx(cardLink, 'text-p3 inline-flex items-center gap-0.5 font-semibold')}>
          View skin
          <ChevronRightIcon className="text-muted size-4" />
        </AccentLink>
      </div>
    </article>
  );
}
