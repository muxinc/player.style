import { getCollection, getCollectionTagGroups } from '../_utils/content';
import Search from '../_components/Search';
import ThemePreview from '../_components/ThemePreview';
import TagCheckbox from '../_components/TagCheckbox';
import ColorPicker from '../_components/ColorPicker';
import ThemeColorPopover from '../_components/ThemeColorPopover';
import Grid from '../_components/Grid';

type HomeProps = {
  searchParams: Record<string, string | string[]>;
};

const steps = [
  { number: '1', text: 'Find a player theme you love' },
  { number: '2', text: 'Pick your player and app framework' },
  { number: '3', text: "Copy, paste, and you're done" },
  { number: '+', text: 'Customize any detail of the player UI using just HTML and CSS' },
];

export default async function Home({ searchParams }: HomeProps) {
  const themes = await getCollection('themes', {
    searchParams,
  });

  const tagGroups = await getCollectionTagGroups('themes');

  return (
    <>
      <Grid withPadding={false} className="text-center">
        <div className="px-1 py-1.5 md:p-2">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide leading-heading font-normal uppercase whitespace-pre-line mx-auto max-w-32 mb-0.5">
            Find your Player
          </h1>
          <h2 className="font-body text-balance text-md tracking-wide leading-normal font-normal normal-case max-w-28 mx-auto">
            Player.style is the home of video and audio player themes built with{' '}
            <a className="underline" href="https://media-chrome.org">
              Media Chrome
            </a>{' '}
            by{' '}
            <a className="underline" href="https://mux.com">
              Mux
            </a>
            . They work for any web player, and with every web app framework.
          </h2>
        </div>
        <div className="p-1 md:py-1.5 lg:px-2 bg-white border-ctx-gray border-t">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-0.5 md:space-y-0 md:space-x-0.5 lg:space-x-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-0.5 lg:space-x-1">
                <div className="relative">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 border border-blue rounded-1"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-display text-md md:text-2xl text-blue">
                    {step.number}
                  </div>
                </div>
                <p className="text-balance text-left text-sm font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Grid>

      <div className="relative border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="gap-2 lg:gap-3 items-center py-0.75">
            <div className="block border-ctx-gray bg-putty-light [&amp;>*]:set-border-ctx-gray [&amp;>*]:set-bg-ctx-putty-light text-black"></div>
          </div>
        </div>
      </div>
      <div className="relative flex-1 border-y -my-1px grid grid-cols-xs sm:grid-cols-sm lg:grid-cols-lg xl:grid-cols-xl bg-putty-light border-ctx-gray text-black set-bg-ctx-putty-light set-border-ctx-gray">
        <div className="col-start-2 col-end-3 border-x border-ctx-gray">
          <div className="-m-0.5px grid grid-cols-1 lg:grid-cols-3 h-full">
            <div className="border-ctx border border-b-0 -m-0.5px flex flex-col">
              <div className="border-ctx bg-charcoal text-putty-light border -m-0.5px font-mono text-sm leading-mono font-normal uppercase -mx-1px -mt-1px h-2 px-1 flex gap-0.25 items-center justify-center text-center">
                Pick theme colors <ThemeColorPopover />
              </div>
              <div className="border-ctx lg:border-b p-1 flex flex-col sm:flex-row justify-center gap-0.5">
                <div className="flex items-center gap-0.25">
                  <ColorPicker id="primary-color" defaultValue="#ffffff" />
                  <label htmlFor="primary-color" className="uppercase text-sm font-mono">
                    Primary
                  </label>
                </div>
                <div className="flex items-center gap-0.25">
                  <ColorPicker id="secondary-color" defaultValue="#ffffff" />
                  <label htmlFor="secondary-color" className="uppercase text-sm font-mono">
                    Secondary
                  </label>
                </div>
                <div className="flex items-center gap-0.25">
                  <ColorPicker id="accent-color" defaultValue="#ffffff" />
                  <label htmlFor="accent-color" className="uppercase text-sm font-mono">
                    Accent
                  </label>
                </div>
              </div>
              <div className="border-ctx bg-charcoal text-putty-light border -m-0.5px font-mono text-sm leading-mono font-normal uppercase -mx-1px -mt-1px h-2 px-1 flex items-center justify-center text-center">
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
                      className="border-ctx open:border-b -m-0.5px"
                      open={true}
                    >
                      <summary className="select-none text-sm font-mono uppercase h-2 cursor-pointer border-ctx border-b px-[2.4rem] py-[1.1rem]">
                        <span className="px-0.75">{tagGroup}</span>
                      </summary>

                      <div className="p-1">
                        {tags.map((name: string, index: number) => (
                          <TagCheckbox key={`tagcheckbox-${index}`} name={name} group={tagGroup} />
                        ))}
                      </div>
                    </details>
                  ))}
              </div>
            </div>
            <div className="lg:col-span-2 grid h-min">
              {themes.length ? (
                themes.map((theme, index) => (
                  <ThemePreview
                    priority={index === 0}
                    key={`theme-${theme._meta.path}`}
                    theme={theme}
                  />
                ))
              ) : (
                <div className="-m-0.5px grid flex flex-col items-center">
                  <div className="p-1 md:p-2 lg:p-4 text-balance">
                    <h3 className="font-body text-xl md:text-3xl leading-heading font-bold normal-case pb-1 text-center lg:text-left">
                      <p>Aw snap! No search results were found.</p>
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
