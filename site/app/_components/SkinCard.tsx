import clsx from 'clsx';

import { getSkinHref } from '@/lib/search-params';
import { getSkinUseCasesLabel, isAudioSkin, type Skin, type UseCase } from '@/lib/skins';

import AccentLink from './AccentLink';
import AuthorLink from './AuthorLink';
import Badge from './Badge';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SkinPreview from './SkinPreview';

type SkinCardProps = {
  skin: Skin;
  /** The use case the card previews and links to; a skin covering several opens on the one the filter asks for. */
  useCase: UseCase;
};

function CardBody({ skin, href }: { skin: Skin; href: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4 pt-3 md:p-5 md:pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-h3 mr-1 uppercase">
          <AccentLink href={href} className="intent:decoration-gold underline decoration-transparent">
            {skin.title}
          </AccentLink>
        </h2>
        <Badge>{getSkinUseCasesLabel(skin)}</Badge>
        {skin.kind === 'first-party' && skin.tier === 'minimal' && <Badge>Minimal</Badge>}
        {skin.kind === 'third-party' && <Badge tone="accent">Community</Badge>}
      </div>
      <p className="text-p3 text-pretty">{skin.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <AuthorLink author={skin.author} />
        <AccentLink
          href={href}
          className="text-p3 intent:decoration-gold inline-flex items-center gap-0.5 font-semibold underline decoration-transparent"
        >
          View skin
          <ChevronRightIcon className="text-muted size-4" />
        </AccentLink>
      </div>
    </div>
  );
}

/**
 * A gallery card: the live preview over the skin's title, badges, and author, lifting on hover like a v10 card. A skin
 * that also ships a live video package lists both use cases as badges and stays one card.
 */
export default function SkinCard({ skin, useCase }: SkinCardProps) {
  const audio = isAudioSkin(skin);
  // Audio bars and fixed-size skins sit centred on a 16:9 backdrop so every card's preview has the same shape.
  const centred = audio || (skin.kind === 'third-party' && skin.preview?.fixedSize);

  return (
    <article className="corner-squircle border-line bg-surface intent:-translate-y-0.5 intent:border-line-strong intent:shadow-md motion-reduce:intent:translate-y-0 flex flex-col overflow-hidden rounded-xl border transition duration-150 ease-out">
      <div className={clsx('p-3 md:p-4', centred && 'flex aspect-video items-center justify-center bg-surface-raised')}>
        <SkinPreview skin={skin} useCase={useCase} preload="none" className={clsx(audio && 'max-w-md')} />
      </div>
      <CardBody skin={skin} href={getSkinHref(skin, useCase)} />
    </article>
  );
}
