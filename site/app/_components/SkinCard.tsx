import clsx from 'clsx';
import Link from 'next/link';

import { ACCENT_PARAM } from '@/lib/search-params';
import { getUseCaseLabel, type FirstPartySkin, type Skin, type ThirdPartySkin } from '@/lib/skins';

import AuthorLink from './AuthorLink';
import Badge from './Badge';
import SkinPreview, { isAudioSkin } from './SkinPreview';

type SkinCardProps = {
  skin: Skin;
  accent?: string;
};

function skinHref(skin: Skin, accent: string | undefined) {
  return { pathname: `/skins/${skin.slug}`, query: accent ? { [ACCENT_PARAM]: accent } : undefined };
}

function CardBody({ skin, accent, children }: SkinCardProps & { children?: React.ReactNode }) {
  const href = skinHref(skin, accent);

  return (
    <div className="flex flex-1 flex-col gap-0.5 px-1 pt-0.5 pb-1">
      <div className="flex flex-wrap items-center gap-0.25">
        <h2 className="leading-heading mr-0.25 text-xl font-bold">
          <Link href={href} className="underline-offset-[0.2em] hover:underline focus-visible:underline">
            {skin.title}
          </Link>
        </h2>
        <Badge>{getUseCaseLabel(skin.useCase)}</Badge>
        {skin.kind === 'first-party' && skin.tier === 'minimal' && <Badge>Minimal</Badge>}
        {skin.kind === 'third-party' && <Badge tone="accent">Community</Badge>}
      </div>
      <p className="text-md leading-normal tracking-wide text-pretty">{skin.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-0.5 pt-0.25">
        <AuthorLink author={skin.author} />
        {children ?? (
          <Link
            href={href}
            className="border-blue-dark bg-blue leading-mono hover:bg-blue-core focus-visible:bg-blue-core rounded-full border px-0.75 py-0.25 font-mono text-xs tracking-wide text-white uppercase"
          >
            View skin →
          </Link>
        )}
      </div>
    </div>
  );
}

function FirstPartySkinCard({ skin, accent }: { skin: FirstPartySkin; accent?: string }) {
  const audio = isAudioSkin(skin);

  return (
    <article className="flex flex-col bg-white">
      <div className={clsx('p-0.5 md:p-0.75', audio && 'flex aspect-video items-center justify-center bg-putty-light')}>
        <SkinPreview skin={skin} accent={accent} preload="none" className={clsx(audio && 'max-w-16')} />
      </div>
      <CardBody skin={skin} accent={accent} />
    </article>
  );
}

function ThirdPartySkinCard({ skin, accent }: { skin: ThirdPartySkin; accent?: string }) {
  return (
    <article className="flex flex-col bg-white">
      <div className="bg-putty-light flex aspect-video items-center justify-center p-1 font-mono text-sm uppercase">
        Preview coming soon
      </div>
      <CardBody skin={skin} accent={accent} />
    </article>
  );
}

export default function SkinCard({ skin, accent }: SkinCardProps) {
  switch (skin.kind) {
    case 'first-party':
      return <FirstPartySkinCard skin={skin} accent={accent} />;
    case 'third-party':
      return <ThirdPartySkinCard skin={skin} accent={accent} />;
  }
}
