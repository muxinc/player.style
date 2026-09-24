import { SOURCES, type SkinSource } from '@/lib/filter-skins';
import { SOURCE_PARAM, USE_CASE_PARAM } from '@/lib/search-params';
import { skins, USE_CASES, type Skin, type UseCase } from '@/lib/skins';

import AccentLink from './AccentLink';
import AccentPicker from './AccentPicker';
import CheckboxFilter from './CheckboxFilter';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import InlineCode from './InlineCode';
import { FEEDBACK_URL } from './nav-links';
import SectionHeading from './SectionHeading';
import SkinCard from './SkinCard';
import { buttonSecondary } from './ui';

function EmptyState({ thirdPartyOnly }: { thirdPartyOnly: boolean }) {
  return (
    <div className="corner-squircle border-line-strong flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
      {thirdPartyOnly ? (
        <>
          <h2 className="font-display text-h3 uppercase">No third-party skins yet</h2>
          <p className="text-p3 text-muted">Want to list yours?</p>
        </>
      ) : (
        <>
          <h2 className="font-display text-h3 uppercase">No skins match those filters</h2>
          <p className="text-p3 text-muted">Try another combination, or clear the filters.</p>
        </>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {thirdPartyOnly && (
          <a className={buttonSecondary} href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            Submit a skin
            <ArrowUpRightIcon className="size-4" />
          </a>
        )}
        <AccentLink href="/" className={buttonSecondary}>
          Clear filters
        </AccentLink>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-display text-p4 text-muted uppercase">{title}</h3>
      {children}
    </div>
  );
}

type SkinGalleryProps = {
  useCases: readonly UseCase[];
  sources: readonly SkinSource[];
  /** The skins left after filtering, resolved on the server so the grid is in the HTML. */
  visible: readonly Skin[];
};

export default function SkinGallery({ useCases, sources, visible }: SkinGalleryProps) {
  const thirdPartyOnly = sources.length === 1 && sources[0] === 'third-party';

  return (
    <div className="grid gap-10 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:border-line flex flex-col gap-8 lg:sticky lg:top-(--nav-h) lg:max-h-[calc(100dvh-var(--nav-h))] lg:self-start lg:overflow-y-auto lg:border-r lg:py-2 lg:pr-8">
        <div className="flex flex-col gap-5">
          <SectionHeading as="h2" size="sm">
            Filter skins
          </SectionHeading>
          <FilterGroup title="Use case">
            <CheckboxFilter legend="Use case" param={USE_CASE_PARAM} options={USE_CASES} selected={useCases} />
          </FilterGroup>
          <FilterGroup title="Source">
            <CheckboxFilter legend="Source" param={SOURCE_PARAM} options={SOURCES} selected={sources} />
          </FilterGroup>
        </div>
        <div className="border-line flex flex-col gap-4 border-t pt-8">
          <SectionHeading as="h2" size="sm">
            Accent color
          </SectionHeading>
          <AccentPicker id="accent-color" />
          <p className="text-p4 text-muted">
            Applied to every preview through the skins’ <InlineCode>--media-accent-color</InlineCode> token.
          </p>
        </div>
      </aside>
      <section aria-label="Skins" className="min-w-0">
        <p aria-live="polite" className="sr-only">
          {visible.length} of {skins.length} skins shown
        </p>
        {visible.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visible.map((skin) => (
              <SkinCard key={skin.slug} skin={skin} />
            ))}
          </div>
        ) : (
          <EmptyState thirdPartyOnly={thirdPartyOnly} />
        )}
      </section>
    </div>
  );
}
