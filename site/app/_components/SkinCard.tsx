import clsx from 'clsx';

import { getUseCaseLabel, isAudioSkin, type FirstPartySkin, type Skin, type ThirdPartySkin } from '@/lib/skins';

import AccentLink from './AccentLink';
import AuthorLink from './AuthorLink';
import Badge from './Badge';
import SkinPreview from './SkinPreview';

type SkinCardProps = {
  skin: Skin;
};

function CardBody({ skin, children }: SkinCardProps & { children?: React.ReactNode }) {
  const href = `/skins/${skin.slug}`;

  return (
    <div className="flex flex-1 flex-col gap-0.5 px-1 pt-0.5 pb-1">
      <div className="flex flex-wrap items-center gap-0.25">
        <h2 className="leading-heading mr-0.25 text-xl font-bold">
          <AccentLink href={href} className="underline-offset-[0.2em] hover:underline focus-visible:underline">
            {skin.title}
          </AccentLink>
        </h2>
        <Badge>{getUseCaseLabel(skin.useCase)}</Badge>
        {skin.kind === 'first-party' && skin.tier === 'minimal' && <Badge>Minimal</Badge>}
        {skin.kind === 'third-party' && <Badge tone="accent">Community</Badge>}
      </div>
      <p className="text-md leading-normal tracking-wide text-pretty">{skin.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-0.5 pt-0.25">
        <AuthorLink author={skin.author} />
        {children ?? (
          <AccentLink
            href={href}
            className="border-blue-dark bg-blue leading-mono hover:bg-blue-core focus-visible:bg-blue-core rounded-full border px-0.75 py-0.25 font-mono text-xs tracking-wide text-white uppercase"
          >
            View skin →
          </AccentLink>
        )}
      </div>
    </div>
  );
}

function FirstPartySkinCard({ skin }: { skin: FirstPartySkin }) {
  const audio = isAudioSkin(skin);

  return (
    <article className="flex flex-col bg-white">
      <div className={clsx('p-0.5 md:p-0.75', audio && 'flex aspect-video items-center justify-center bg-putty-light')}>
        <SkinPreview skin={skin} preload="none" className={clsx(audio && 'max-w-16')} />
      </div>
      <CardBody skin={skin} />
    </article>
  );
}

function ThirdPartySkinCard({ skin }: { skin: ThirdPartySkin }) {
  return (
    <article className="flex flex-col bg-white">
      <div className="bg-putty-light flex aspect-video items-center justify-center p-1 font-mono text-sm uppercase">
        Preview coming soon
      </div>
      <CardBody skin={skin} />
    </article>
  );
}

export default function SkinCard({ skin }: SkinCardProps) {
  switch (skin.kind) {
    case 'first-party':
      return <FirstPartySkinCard skin={skin} />;
    case 'third-party':
      return <ThirdPartySkinCard skin={skin} />;
  }
}
