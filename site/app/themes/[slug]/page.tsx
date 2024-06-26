import type { Metadata } from 'next';
import PlayerHero from '@/app/_components/PlayerHero';
import Grid from '@/app/_components/Grid';
import ButtonPicker from '@/app/_components/ButtonPicker';
import ButtonPickerOption from '@/app/_components/ButtonPickerOption';
import { getEntry } from '@/app/_utils/content';
import { findParam } from '@/app/_utils/utils';
import DocsInstall from '@/app/_components/DocsInstall';
import DocsEmbed from '@/app/_components/DocsEmbed';
import AuthorLink from '@/app/_components/AuthorLink';

type ThemePageProps = {
  params: {
    slug: string;
  };
  searchParams: Record<string, string | string[]>;
};

export async function generateMetadata(props: ThemePageProps): Promise<Metadata> {
  const entry = await getEntry('themes', props.params.slug);

  let title = `${entry.title} theme`;
  let description = entry.description;

  const frameworkId = findParam(props.searchParams, 'framework');

  if (frameworkId) {
    const framework = await getEntry('frameworks', frameworkId);
    if (framework) title = `${framework.title} ${title}`;
  }

  const playerId = findParam(props.searchParams, 'media');

  if (playerId) {
    const player = await getEntry('players', playerId);
    if (player) title = `${title} for ${player.title}`;
  }

  return {
    title: `player.style - ${title}`,
    description,
  };
}

export default async function Page(props: ThemePageProps) {
  const entry = await getEntry('themes', props.params.slug);

  return (
    <>
      <div className="flex-1">
        <PlayerHero theme={entry} {...props} />
        <Grid>
          <h1 className="text-3xl font-bold mb-0.5">{entry.title}</h1>
          <p className="text-lg mb-0.5 md:mr-8">{entry.description}</p>
          <p className="mb-1 font-mono text-sm leading-mono font-normal uppercase text-gray-dark">
            By <AuthorLink handle={entry.author}></AuthorLink>
          </p>

          <hr className="border-putty mb-2" />

          <h3 className="text-2xl font-semibold mb-1">Use this theme</h3>

          <h4 className="text-lg font-medium mb-1">Pick your media type or platform</h4>

          <ButtonPicker type="media">
            <ButtonPickerOption
              selected
              title="Video file"
              value=""
              className="hover:bg-yellow [&.active]:bg-yellow"
            />
            <ButtonPickerOption
              title="Audio file"
              value="audio"
              className="hover:bg-yellow [&.active]:bg-yellow"
            />
            <ButtonPickerOption
              title="HLS"
              value="hls"
              className="hover:bg-orange [&.active]:bg-orange"
            />
            <ButtonPickerOption
              title="DASH"
              value="dash"
              className="hover:bg-blue [&.active]:bg-blue"
            />
            <ButtonPickerOption
              title="Mux"
              value="mux"
              className="hover:bg-pink [&.active]:bg-pink"
            />
            <ButtonPickerOption
              title="YouTube"
              value="youtube"
              className="hover:bg-red [&.active]:bg-red"
            />
            <ButtonPickerOption
              title="Vimeo"
              value="vimeo"
              className="hover:bg-blue-neon [&.active]:bg-blue-neon"
            />
            <ButtonPickerOption
              title="Wistia"
              value="wistia"
              className="hover:bg-blue [&.active]:bg-blue"
            />
            <ButtonPickerOption
              title="Cloudflare"
              value="cloudflare"
              className="hover:bg-orange-neon [&.active]:bg-orange-neon"
            />
            <ButtonPickerOption
              title="JW Player"
              value="jwplayer"
              className="hover:bg-red [&.active]:bg-red"
            />
          </ButtonPicker>

          <h4 className="text-lg font-medium mb-1">Pick your app framework</h4>

          <ButtonPicker type="framework">
            <ButtonPickerOption
              selected
              title="HTML"
              value=""
              className="hover:bg-yellow [&.active]:bg-yellow"
            />
            <ButtonPickerOption
              title="JS"
              value="js"
              className="hover:bg-yellow [&.active]:bg-yellow"
            />
            <ButtonPickerOption
              title="React"
              value="react"
              className="hover:bg-blue [&.active]:bg-blue"
            />
            <ButtonPickerOption
              title="Vue"
              value="vue"
              className="hover:bg-green [&.active]:bg-green"
            />
            <ButtonPickerOption
              title="Svelte"
              value="svelte"
              className="hover:bg-orange [&.active]:bg-orange"
            />
          </ButtonPicker>

          <DocsInstall searchParams={props.searchParams} />
          <DocsEmbed searchParams={props.searchParams} theme={props.params.slug} />
        </Grid>
      </div>
    </>
  );
}
