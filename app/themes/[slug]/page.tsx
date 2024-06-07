import PlayerHero from '@/app/_components/PlayerHero';
import Grid from '@/app/_components/Grid';
import ButtonPicker from '@/app/_components/ButtonPicker';
import ButtonPickerOption from '@/app/_components/ButtonPickerOption';
import { getEntry } from '@/app/_utils/content';
import type { Theme } from '@/app/_types/theme';
import DocsInstall from '@/app/_components/DocsInstall';
import DocsEmbed from '@/app/_components/DocsEmbed';

export default async function Theme(props: any) {
  const theme = (await getEntry('themes', props.params.slug)) as unknown as Theme;

  return (
    <>
      <div className="flex-1">
        <PlayerHero theme={theme} {...props} />
        <Grid>
          <h1 className="text-3xl font-bold mb-0.5">{theme.title}</h1>
          <p className="text-lg mb-0.5 md:mr-8">{theme.description}</p>
          <p className="mb-1">By {theme.author.name}</p>

          <hr className="border-putty mb-2" />

          <h3 className="text-2xl font-semibold mb-1">Use this theme</h3>

          <h4 className="text-lg font-medium mb-1">Pick your media type or platform</h4>

          <ButtonPicker type="media">
            <ButtonPickerOption
              selected
              title="Video file"
              value="video"
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
          </ButtonPicker>

          <h4 className="text-lg font-medium mb-1">Pick your app framework</h4>

          <ButtonPicker type="framework">
            <ButtonPickerOption
              selected
              title="HTML/JS"
              value="html"
              className="hover:bg-yellow [&.active]:bg-yellow"
            />
            <ButtonPickerOption
              title="React"
              value="react"
              className="hover:bg-blue [&.active]:bg-blue"
            />
          </ButtonPicker>

          <h4 className="text-lg font-medium mb-1">Install dependencies</h4>
          <DocsInstall searchParams={props.searchParams} />

          <h4 className="text-lg font-medium mb-1">Embed your player</h4>
          <DocsEmbed searchParams={props.searchParams} theme={props.params.slug} />
        </Grid>
      </div>
    </>
  );
}
