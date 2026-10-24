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
import { touchTarget } from '@/app/_components/ui';
import type { Renderer } from '@/lib/presets';
import {
  FRAMEWORK_PARAM,
  getParamValue,
  MEDIA_PARAM,
  parseSkinUseCase,
  USE_CASE_PARAM,
  type SearchParamsRecord,
} from '@/lib/search-params';
import { getRegistryFramework } from '@/lib/shadcn-install';
import { SITE_NAME } from '@/lib/site';
import { baseOpenGraph, baseTwitter } from '@/lib/site-metadata';
import {
  getSkin,
  getSkinUseCasesLabel,
  skins,
  type FirstPartySkin,
  type ThirdPartySkin,
  type UseCase,
} from '@/lib/skins';
import { resolveFramework, resolveThirdPartyRenderer, type Framework } from '@/lib/third-party-usage';

type SkinPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export const dynamicParams = false;

/** Every listed skin; a community skin is listed once one of its presets is built (`site/lib/skin-builds.ts`). */
export function generateStaticParams() {
  return skins.map((skin) => ({ slug: skin.slug }));
}

export async function generateMetadata({ params }: SkinPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skin = getSkin(slug);
  if (!skin) return {};

  const title = `${skin.title} skin – ${SITE_NAME}`;

  return {
    title: { absolute: title },
    description: skin.description,
    // Every pick on the page is a query param; the canonical page is the bare path.
    alternates: { canonical: `/skins/${skin.slug}` },
    openGraph: { ...baseOpenGraph, title, description: skin.description, url: `/skins/${skin.slug}` },
    twitter: { ...baseTwitter, title, description: skin.description },
  };
}

function SkinSummary({ skin }: { skin: FirstPartySkin | ThirdPartySkin }) {
  return (
    <header className="flex flex-col gap-4 pt-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="font-display text-h4 text-accent flex items-center gap-1.5 uppercase">
        <AccentLink href="/" className={`intent:decoration-gold underline decoration-transparent ${touchTarget}`}>
          Skins
        </AccentLink>
        <ChevronRightIcon className="text-muted size-4" />
        <span className="text-muted">{skin.title}</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        {/* A long title at h15 is wider than a phone, so phones get h2; a title that still does not fit breaks. */}
        <h1 className="font-display text-h2 xs:text-h15 md:text-h1 min-w-0 wrap-anywhere uppercase">{skin.title}</h1>
        <span className="flex items-center gap-2">
          <Badge>{getSkinUseCasesLabel(skin)}</Badge>
          <Badge tone="accent">{skin.kind === 'first-party' ? 'First-party' : 'Community'}</Badge>
        </span>
      </div>
      <p className="text-p15 max-w-2xl text-pretty">{skin.description}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pointer-coarse:gap-y-5">
        <AuthorLink author={skin.author} size="md" />
      </div>
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

function FirstPartySkinPage({ skin }: { skin: FirstPartySkin }) {
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
        <InstallSection skin={skin} />
      </StepSection>
    </>
  );
}

type ThirdPartySkinPageProps = {
  skin: ThirdPartySkin;
  useCase: UseCase;
  /** The framework the install section shows; the hero previews the build it installs from. */
  framework: Framework;
  renderer: Renderer;
  searchParams: SearchParamsRecord;
};

function ThirdPartySkinPage({ skin, useCase, framework, renderer, searchParams }: ThirdPartySkinPageProps) {
  return (
    <>
      <PageFrame as="section">
        <SkinSummary skin={skin} />
      </PageFrame>
      <PageFrame as="section" className="mt-8 md:mt-10">
        <SkinHero skin={skin} useCase={useCase} framework={getRegistryFramework(framework)} />
      </PageFrame>
      <StepSection id="customize" eyebrow="Step 2" title="Customize" className="mt-16 md:mt-20">
        <CustomizeSection skin={skin} useCase={useCase} />
      </StepSection>
      <StepSection id="install" eyebrow="Step 3" title="Install" className="mt-16 flex-1 md:mt-20">
        <ThirdPartyInstallSection
          skin={skin}
          useCase={useCase}
          framework={framework}
          renderer={renderer}
          searchParams={searchParams}
        />
      </StepSection>
    </>
  );
}

export default async function SkinPage({ params, searchParams }: SkinPageProps) {
  const { slug } = await params;
  const skin = getSkin(slug);
  if (!skin) notFound();

  // Reading the params keeps both kinds of page dynamic, so the server HTML already carries the `?accent=` the
  // previews and snippets render with; a prerendered page would only pick it up after hydration.
  const query = await searchParams;

  switch (skin.kind) {
    case 'first-party':
      return <FirstPartySkinPage skin={skin} />;
    case 'third-party': {
      const useCase = parseSkinUseCase(skin, getParamValue(query, USE_CASE_PARAM));

      return (
        <ThirdPartySkinPage
          skin={skin}
          useCase={useCase}
          framework={resolveFramework(skin, useCase, getParamValue(query, FRAMEWORK_PARAM))}
          renderer={resolveThirdPartyRenderer(skin, useCase, getParamValue(query, MEDIA_PARAM))}
          searchParams={query}
        />
      );
    }
  }
}
