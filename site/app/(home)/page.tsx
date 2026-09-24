import type { Metadata } from 'next';

import { filterSkins } from '@/lib/filter-skins';
import { parseGalleryParams, type SearchParamsRecord } from '@/lib/search-params';
import { skins } from '@/lib/skins';

import MuxSmallLogo from '../_components/logos/MuxSmallLogo';
import { MUX_URL } from '../_components/nav-links';
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
      <PageFrame as="section" className="pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
          <p className="font-display text-h5 text-accent font-bold uppercase">Skins for Video.js</p>
          <h1 className="font-display text-h15 md:text-h1 uppercase">Find your player skin</h1>
          <p className="text-p15 max-w-2xl text-balance">
            Official and community skins for Video.js 10, for video, audio, and live streams. Preview them here, then
            install them from the Video.js docs.
          </p>
          <a
            href={MUX_URL}
            target="_blank"
            rel="noreferrer"
            className="text-p3 text-muted intent:text-faded-black md:font-display dark:intent:text-manila-light inline-flex items-center gap-1.5 md:text-[0.6875rem] md:uppercase"
          >
            Video hosting sponsored by
            <MuxSmallLogo className="text-faded-black dark:text-manila-light h-4 w-auto" />
            <span className="sr-only">Mux</span>
          </a>
        </div>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3 md:mt-14">
          {steps.map((step) => (
            <li
              key={step.number}
              className="corner-squircle border-line bg-surface flex items-center gap-3 rounded-xl border p-4"
            >
              <span
                aria-hidden="true"
                className="border-accent font-display text-h4 text-accent grid size-9 shrink-0 place-items-center rounded-full border"
              >
                {step.number}
              </span>
              <span className="text-p3 font-semibold text-balance">{step.text}</span>
            </li>
          ))}
        </ol>
      </PageFrame>
      <PageFrame as="section" className="flex-1 pt-6 md:pt-10">
        <SkinGallery useCases={useCases} sources={sources} visible={visible} />
      </PageFrame>
    </>
  );
}
