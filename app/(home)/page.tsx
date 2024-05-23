import { getCollection, getCollectionTagGroups } from '../_utils/content';
import Hero from '../_components/Hero';
import Search from '../_components/Search';
import ThemePreview from '../_components/ThemePreview';
import TagCheckbox from '../_components/TagCheckbox';

import type { Theme } from '../_types/theme';

type HomeProps = {
  searchParams: Record<string, string | string[]>;
};

export default async function Home({ searchParams }: HomeProps) {
  const themes = (await getCollection('themes', {
    searchParams,
  })) as unknown as Theme[];

  const tagGroups = await getCollectionTagGroups('themes');

  return (
    <>
      <Hero title="Create your Player">
        Look on our player theme treasures; compatible with most web video and audio players.{' '}
        <a href="/about" className="underline">
          Learn more about the project
        </a>
        .
      </Hero>
      <div className="relative border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="-m-0.5px grid grid-cols-1 lg:grid-cols-3">
            <div className="border-ctx border -m-0.5px flex flex-col">
              <div className="border-ctx border -m-0.5px font-mono text-sm leading-mono font-normal uppercase -mx-1px -mt-1px h-3 p-1 flex items-center justify-center text-center">
                Filter themes
              </div>
              <div className="border-ctx lg:border-b">
                <Search />
              </div>
              <div className="border-ctx">
                {Object.entries(tagGroups)
                  .filter(([, tags]) => tags.length)
                  .map(([tagGroup, tags], index) => (
                    <details
                      key={`details-${index}`}
                      className="border-ctx border-b -m-0.5px p-1"
                      open={true}
                    >
                      <summary className="select-none font-mono uppercase list-outside ml-0.5 pl-0.25 cursor-pointer">
                        {tagGroup}
                      </summary>

                      <div className="pt-0.5">
                        {tags.map((name: string, index: number) => (
                          <TagCheckbox key={`tagcheckbox-${index}`} name={name} group={tagGroup} />
                        ))}
                      </div>
                    </details>
                  ))}
              </div>
            </div>
            <div className="lg:col-span-2 grid">
              {themes.map((theme, index) => (
                <ThemePreview
                  priority={index === 0}
                  key={`theme-${theme.slug}`}
                  slug={theme.slug}
                  title={theme.title}
                  author={theme.author}
                  description={theme.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
