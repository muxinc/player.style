import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AccentLink from '@/app/_components/AccentLink';
import AuthorLink from '@/app/_components/AuthorLink';
import Badge from '@/app/_components/Badge';
import CustomizeSection from '@/app/_components/CustomizeSection';
import InstallSection from '@/app/_components/InstallSection';
import { FEEDBACK_URL } from '@/app/_components/nav-links';
import PageFrame from '@/app/_components/PageFrame';
import SectionHeading from '@/app/_components/SectionHeading';
import SkinHero from '@/app/_components/SkinHero';
import { DEFAULT_FRAMEWORK, isFramework, resolveMedia, type Framework, type Renderer } from '@/lib/installation-url';
import { FRAMEWORK_PARAM, getParamValue, MEDIA_PARAM, type SearchParamsRecord } from '@/lib/search-params';
import { baseOpenGraph, baseTwitter } from '@/lib/site-metadata';
import { getSkin, getUseCaseLabel, skins, type FirstPartySkin, type ThirdPartySkin } from '@/lib/skins';

type SkinPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return skins.map((skin) => ({ slug: skin.slug }));
}

export async function generateMetadata({ params }: SkinPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skin = getSkin(slug);
  if (!skin) return {};

  const title = `${skin.title} skin for Video.js – player.style`;

  return {
    title: { absolute: title },
    description: skin.description,
    openGraph: { ...baseOpenGraph, title, description: skin.description, url: `/skins/${skin.slug}` },
    twitter: { ...baseTwitter, title, description: skin.description },
  };
}

function SkinSummary({ skin }: { skin: FirstPartySkin | ThirdPartySkin }) {
  return (
    <div className="flex flex-col gap-0.5 px-1 py-1 md:px-2 md:py-1.5">
      <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase">
        <AccentLink href="/" className="underline decoration-1 underline-offset-[0.3em] hover:no-underline">
          Skins
        </AccentLink>{' '}
        / {skin.title}
      </nav>
      <div className="flex flex-wrap items-center gap-0.5">
        <h1 className="leading-heading text-3xl font-bold md:text-4xl">{skin.title}</h1>
        <Badge>{getUseCaseLabel(skin.useCase)}</Badge>
        {skin.kind === 'first-party' ? <Badge>{skin.tier}</Badge> : <Badge tone="accent">Community</Badge>}
      </div>
      <p className="text-md max-w-26 leading-normal tracking-wide text-pretty">{skin.description}</p>
      <AuthorLink author={skin.author} size="md" />
    </div>
  );
}

type FirstPartySkinPageProps = {
  skin: FirstPartySkin;
  framework: Framework;
  media: Renderer;
  searchParams: SearchParamsRecord;
};

function FirstPartySkinPage({ skin, framework, media, searchParams }: FirstPartySkinPageProps) {
  return (
    <>
      <PageFrame as="section">
        <SkinHero skin={skin} />
      </PageFrame>
      <PageFrame as="section">
        <SkinSummary skin={skin} />
      </PageFrame>
      <PageFrame as="section">
        <SectionHeading id="customize">Customize</SectionHeading>
        <CustomizeSection skin={skin} />
      </PageFrame>
      <PageFrame as="section" className="flex-1">
        <SectionHeading id="install">Install</SectionHeading>
        <InstallSection skin={skin} framework={framework} media={media} searchParams={searchParams} />
      </PageFrame>
    </>
  );
}

function ThirdPartySkinPage({ skin }: { skin: ThirdPartySkin }) {
  return (
    <>
      <PageFrame as="section">
        <SkinSummary skin={skin} />
      </PageFrame>
      <PageFrame as="section" className="flex-1">
        <SectionHeading>Coming soon</SectionHeading>
        <div className="flex flex-col gap-0.5 px-1 py-1 md:px-2">
          <p className="text-md max-w-26 leading-normal tracking-wide text-pretty">
            Community skin listings are on their way. This skin ships as{' '}
            <code className="font-mono">{skin.package}</code> for {skin.frameworks.join(' and ')}; previews and
            installation steps will land here.
          </p>
          <a className="underline decoration-1 underline-offset-[0.3em] hover:no-underline" href={FEEDBACK_URL}>
            Tell us about a skin ↗
          </a>
        </div>
      </PageFrame>
    </>
  );
}

export default async function SkinPage({ params, searchParams }: SkinPageProps) {
  const { slug } = await params;
  const skin = getSkin(slug);
  if (!skin) notFound();

  switch (skin.kind) {
    case 'first-party': {
      const query = await searchParams;
      const frameworkParam = getParamValue(query, FRAMEWORK_PARAM);
      const framework = isFramework(frameworkParam) ? frameworkParam : DEFAULT_FRAMEWORK;
      const media = resolveMedia(skin, getParamValue(query, MEDIA_PARAM));

      return <FirstPartySkinPage skin={skin} framework={framework} media={media} searchParams={query} />;
    }
    case 'third-party':
      return <ThirdPartySkinPage skin={skin} />;
  }
}
