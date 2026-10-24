import type { Metadata } from 'next';

import { filterSkins, orderGallerySkins } from '@/lib/filter-skins';
import { parseGalleryParams, type SearchParamsRecord } from '@/lib/search-params';
import { SITE_NAME } from '@/lib/site';
import { skins } from '@/lib/skins';

import { VIDEOJS_URL } from '../_components/nav-links';
import PageFrame from '../_components/PageFrame';
import SkinGallery from '../_components/SkinGallery';
import { textLink } from '../_components/ui';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
};

/**
 * Three steps and a bonus, in the order the site walks them: the gallery below, a skin page's pickers, then its
 * Install section. The bonus is editing the installed source, for anyone who wants more than an accent color.
 */
const steps = [
  { mark: '1', text: 'Find a player skin you love' },
  { mark: '2', text: 'Pick your media component and app framework' },
  { mark: '3', text: 'Add its source to your project with shadcn' },
  { mark: '+', text: 'Edit the components and CSS to make it yours' },
];

type HomeProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { useCases, sources } = parseGalleryParams(await searchParams);
  const visible = orderGallerySkins(filterSkins(skins, { useCases, sources }));

  return (
    <>
      <PageFrame as="section" className="pt-12 pb-8 md:pt-20 md:pb-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <h1 className="font-display text-h15 md:text-h1 uppercase">Find your player</h1>
          <p className="text-p15 max-w-2xl text-balance">
            Community and recreated skins for{' '}
            <a className={textLink} href={VIDEOJS_URL} target="_blank" rel="noreferrer">
              Video.js 10
            </a>
            , maintained by the Video.js team
          </p>
        </div>
        <ol className="border-line mx-auto mt-10 grid max-w-6xl gap-x-8 gap-y-5 border-y py-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.mark} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="border-accent font-display text-h3 text-accent-text grid size-10 shrink-0 place-items-center rounded-full border"
              >
                {step.mark}
              </span>
              <span className="text-p3 font-medium text-balance">{step.text}</span>
            </li>
          ))}
        </ol>
      </PageFrame>
      <PageFrame as="section" className="flex-1 pt-4 md:pt-6">
        <SkinGallery useCases={useCases} sources={sources} visible={visible} />
      </PageFrame>
    </>
  );
}
