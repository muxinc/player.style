'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { filterSkins, SOURCES } from '@/lib/filter-skins';
import {
  ACCENT_PARAM,
  parseAccent,
  parseSources,
  parseUseCases,
  SOURCE_PARAM,
  USE_CASE_PARAM,
} from '@/lib/search-params';
import { skins, USE_CASES } from '@/lib/skins';

import AccentPicker from './AccentPicker';
import CheckboxFilter from './CheckboxFilter';
import { FEEDBACK_URL } from './nav-links';
import SectionHeading from './SectionHeading';
import SkinCard from './SkinCard';

const pillClassName =
  'rounded-full border border-gray bg-putty-light px-0.75 py-0.25 font-mono text-xs leading-mono uppercase hover:bg-putty';

function EmptyState({ accent, thirdPartyOnly }: { accent: string | undefined; thirdPartyOnly: boolean }) {
  return (
    <div className="flex min-h-12 flex-col items-center justify-center gap-0.5 bg-white p-2 text-center">
      {thirdPartyOnly ? (
        <>
          <h2 className="leading-heading text-xl font-bold">No third-party skins yet</h2>
          <p className="text-md text-gray-dark leading-normal">Want to list yours?</p>
          <a className={pillClassName} href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            Submit a skin ↗
          </a>
        </>
      ) : (
        <>
          <h2 className="leading-heading text-xl font-bold">No skins match those filters</h2>
          <p className="text-md text-gray-dark leading-normal">Try another combination, or clear the filters.</p>
        </>
      )}
      <Link href={{ pathname: '/', query: accent ? { [ACCENT_PARAM]: accent } : undefined }} className={pillClassName}>
        Clear filters
      </Link>
    </div>
  );
}

export default function SkinGallery() {
  const searchParams = useSearchParams();
  const accent = parseAccent(searchParams.get(ACCENT_PARAM));
  const useCases = parseUseCases(searchParams.getAll(USE_CASE_PARAM));
  const sources = parseSources(searchParams.getAll(SOURCE_PARAM));
  const visible = filterSkins(skins, { useCases, sources });
  const thirdPartyOnly = sources.length === 1 && sources[0] === 'third-party';

  return (
    <div className="grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <aside className="border-gray flex flex-col border-b lg:sticky lg:top-0 lg:max-h-screen lg:self-start lg:overflow-y-auto lg:border-r lg:border-b-0">
        <SectionHeading>Filter skins</SectionHeading>
        <div className="border-gray flex flex-col gap-0.75 border-b px-1 py-0.75">
          <div className="flex flex-col gap-0.25">
            <h3 className="text-gray-dark text-xs leading-normal font-bold tracking-wide uppercase">Use case</h3>
            <CheckboxFilter legend="Use case" param={USE_CASE_PARAM} options={USE_CASES} selected={useCases} />
          </div>
          <div className="flex flex-col gap-0.25">
            <h3 className="text-gray-dark text-xs leading-normal font-bold tracking-wide uppercase">Source</h3>
            <CheckboxFilter legend="Source" param={SOURCE_PARAM} options={SOURCES} selected={sources} />
          </div>
        </div>
        <SectionHeading>Accent color</SectionHeading>
        <div className="border-gray border-b px-1 py-0.75 lg:border-b-0">
          <AccentPicker id="accent-color" />
          <p className="text-gray-dark mt-0.5 text-sm leading-normal">
            Applied to every preview through the skins’ <code className="font-mono">--media-accent-color</code> token.
          </p>
        </div>
      </aside>
      <section aria-label="Skins" aria-live="polite" className="bg-gray">
        <p className="sr-only">
          {visible.length} of {skins.length} skins shown
        </p>
        {visible.length ? (
          <div className="grid gap-px md:grid-cols-2">
            {visible.map((skin) => (
              <SkinCard key={skin.slug} skin={skin} accent={accent} />
            ))}
          </div>
        ) : (
          <EmptyState accent={accent} thirdPartyOnly={thirdPartyOnly} />
        )}
      </section>
    </div>
  );
}
