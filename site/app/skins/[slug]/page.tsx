import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AccentLink from '@/app/_components/AccentLink';
import AuthorLink from '@/app/_components/AuthorLink';
import Badge from '@/app/_components/Badge';
import CustomizeSection from '@/app/_components/CustomizeSection';
import ChevronRightIcon from '@/app/_components/icons/ChevronRightIcon';
import InstallSection from '@/app/_components/InstallSection';
import PageFrame from '@/app/_components/PageFrame';
import SectionHeading from '@/app/_components/SectionHeading';
import SkinHero from '@/app/_components/SkinHero';
import ThirdPartyInstallSection from '@/app/_components/ThirdPartyInstallSection';
import { DEFAULT_FRAMEWORK, isFramework, resolveMedia, type Framework, type Renderer } from '@/lib/installation-url';
import { FRAMEWORK_PARAM, getParamValue, MEDIA_PARAM, type SearchParamsRecord } from '@/lib/search-params';
import { baseOpenGraph, baseTwitter } from '@/lib/site-metadata';
import {
  getSkin,
  getUseCaseLabel,
  skins,
  type FirstPartySkin,
  type SkinFramework,
  type ThirdPartySkin,
} from '@/lib/skins';
import { getDefaultFramework, isSkinFramework } from '@/lib/third-party-usage';

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
    <header className="flex flex-col gap-4 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="font-display text-h4 text-accent flex items-center gap-1.5 uppercase">
        <AccentLink href="/" className="intent:decoration-gold underline decoration-transparent">
          Skins
        </AccentLink>
        <ChevronRightIcon className="text-muted size-4" />
        <span className="text-muted">{skin.title}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-h15 md:text-h1 uppercase">{skin.title}</h1>
        <span className="flex items-center gap-2">
          <Badge>{getUseCaseLabel(skin.useCase)}</Badge>
          {skin.kind === 'first-party' ? <Badge>{skin.tier}</Badge> : <Badge tone="accent">Community</Badge>}
        </span>
      </div>
      <p className="text-p15 max-w-2xl text-pretty">{skin.description}</p>
      <AuthorLink author={skin.author} size="md" />
    </header>
  );
}

function StepSection({
  id,
  eyebrow,
  title,
  className,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PageFrame as="section" className={className}>
      <SectionHeading id={id} eyebrow={eyebrow} className="border-line mb-8 border-b pb-6">
        {title}
      </SectionHeading>
      {children}
    </PageFrame>
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
        <SkinSummary skin={skin} />
      </PageFrame>
      <PageFrame as="section" className="mt-8 md:mt-10">
        <SkinHero skin={skin} />
      </PageFrame>
      <StepSection id="customize" eyebrow="Step 2" title="Customize" className="mt-16 md:mt-20">
        <CustomizeSection skin={skin} />
      </StepSection>
      <StepSection id="install" eyebrow="Step 3" title="Install" className="mt-16 flex-1 md:mt-20">
        <InstallSection skin={skin} framework={framework} media={media} searchParams={searchParams} />
      </StepSection>
    </>
  );
}

type ThirdPartySkinPageProps = {
  skin: ThirdPartySkin;
  framework: SkinFramework;
  searchParams: SearchParamsRecord;
};

function ThirdPartySkinPage({ skin, framework, searchParams }: ThirdPartySkinPageProps) {
  return (
    <>
      <PageFrame as="section">
        <SkinSummary skin={skin} />
      </PageFrame>
      <PageFrame as="section" className="mt-8 md:mt-10">
        <SkinHero skin={skin} />
      </PageFrame>
      <StepSection id="customize" eyebrow="Step 2" title="Customize" className="mt-16 md:mt-20">
        <CustomizeSection skin={skin} />
      </StepSection>
      <StepSection id="install" eyebrow="Step 3" title="Install" className="mt-16 flex-1 md:mt-20">
        <ThirdPartyInstallSection skin={skin} framework={framework} searchParams={searchParams} />
      </StepSection>
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
    case 'third-party': {
      const query = await searchParams;
      const frameworkParam = getParamValue(query, FRAMEWORK_PARAM);
      const framework = isSkinFramework(skin, frameworkParam) ? frameworkParam : getDefaultFramework(skin);

      return <ThirdPartySkinPage skin={skin} framework={framework} searchParams={query} />;
    }
  }
}
