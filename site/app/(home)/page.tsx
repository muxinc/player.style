import type { Metadata } from 'next';

import { filterSkins } from '@/lib/filter-skins';
import { parseGalleryParams, type SearchParamsRecord } from '@/lib/search-params';
import { skins } from '@/lib/skins';

import PageFrame from '../_components/PageFrame';
import SkinGallery from '../_components/SkinGallery';

export const metadata: Metadata = {
  title: { absolute: 'player.style – Skins for Video.js' },
};

const steps = [
  { number: '1', text: 'Pick a skin' },
  { number: '2', text: 'Set your accent color' },
  { number: '3', text: 'Install with Video.js' },
];

type HomeProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { useCases, sources } = parseGalleryParams(await searchParams);
  const visible = filterSkins(skins, { useCases, sources });

  return (
    <>
      <PageFrame as="section" className="text-center">
        <div className="px-1 py-1.5 sm:p-2 md:p-3">
          <h1 className="font-display leading-heading mx-auto mb-0.5 max-w-32 text-3xl font-normal tracking-wide uppercase sm:mb-1 sm:text-5xl md:text-6xl">
            Find your Video.js skin
          </h1>
          <p className="text-md mx-auto max-w-24 leading-normal tracking-wide text-balance">
            Official and community skins for Video.js 10, for video, audio, and live streams. Preview them here, then
            install them from the Video.js docs.
          </p>
        </div>
        <ol className="border-gray grid gap-0.5 border-t bg-white p-1 md:grid-cols-3 md:py-1.5 lg:gap-1 lg:px-3 xl:px-4">
          {steps.map((step) => (
            <li key={step.number} className="flex items-center gap-0.5 lg:gap-1">
              <span
                aria-hidden="true"
                className="border-blue font-display text-md text-blue grid size-1.5 shrink-0 place-items-center rounded-full border lg:size-2 lg:text-2xl"
              >
                {step.number}
              </span>
              <span className="text-left text-sm font-medium text-balance">{step.text}</span>
            </li>
          ))}
        </ol>
      </PageFrame>
      <PageFrame as="section" className="flex-1">
        <SkinGallery useCases={useCases} sources={sources} visible={visible} />
      </PageFrame>
    </>
  );
}
