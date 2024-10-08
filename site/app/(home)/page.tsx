import { getCollection, getCollectionTagGroups } from '../_utils/content';
import Search from '../_components/Search';
import ThemePreview from '../_components/ThemePreview';
import TagCheckbox from '../_components/TagCheckbox';
import ColorPicker from '../_components/ColorPicker';
import ThemeColorPopover from '../_components/ThemeColorPopover';
import Grid from '../_components/Grid';
import LinkWithUnderline from '../_components/LinkWithUnderline';

const title = 'player.style - Video & audio player themes for every web player & framework';
export const metadata = {
  title,
  description: 'Video and audio player themes that work for any web player (Video.js, Youtube embeds, and more), and with every web app framework (HTML, React, and more). Open source and built with Media Chrome so they’re fully customizable using just HTML and CSS.',
  openGraph: {
    title,
    url: '/',
    locale: 'en-US',
    type: 'website',
    images: {
      url: `/player.style@2x.png`,
      alt: 'player.style logo',
    },
  },
  twitter: {
    title,
    site: '@muxhq',
    images: {
      url: `/player.style@2x.png`,
      alt: 'player.style logo',
    }
  },
};

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
        <div className="px-1 py-1.5 sm:p-2 md:p-3">
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl tracking-wide leading-heading font-normal uppercase whitespace-pre-line mx-auto max-w-32 mb-0.5 sm:mb-1">
            Find your Player
          </h1>
          <h2 className="font-body text-balance text-md tracking-wide leading-normal font-normal normal-case max-w-24 mx-auto">
            Video and audio player themes built with{' '}
            <LinkWithUnderline href="https://media-chrome.org" target="_blank">
              Media Chrome
            </LinkWithUnderline>
            , for <strong>every web player</strong> and <strong>every web app framework</strong>.
          </h2>
        </div>
        <div className="p-1 md:py-1.5 lg:px-3 xl:px-4 bg-white border-ctx-gray border-t">
          <div className="grid md:grid-cols-4 items-start md:items-center gap-0.5 lg:gap-1">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-0.5 lg:space-x-1">
                <div className="relative">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 border border-blue rounded-1"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-display text-md md:text-lg lg:text-2xl text-blue">
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
                    <details key={`details-${index}`} className="border-ctx open:border-b -m-0.5px" open={true}>
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
              <div className="border-ctx bg-charcoal text-putty-light border -m-0.5px font-mono text-sm leading-mono font-normal uppercase -mx-1px -mt-1px h-2 px-1 flex gap-0.25 items-center justify-center text-center">
                Set theme colors <ThemeColorPopover />
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
            </div>
            <div className="lg:col-span-2 grid h-min">
              {themes.length ? (
                themes.map((theme, index) => (
                  <ThemePreview priority={index === 0} key={`theme-${theme._meta.path}`} theme={theme} />
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
