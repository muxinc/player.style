import type { Metadata } from 'next';
import Grid from '@/app/_components/Grid';
import { getEntry } from '@/app/_utils/content';

export async function generateMetadata(props: any): Promise<Metadata> {
  const entry = await getEntry('features', props.params.slug);

  return {
    title: `player.style - ${entry.title}`,
    description: entry.description,
  };
}

export default async function Page(props: any) {
  const entry = await getEntry('features', props.params.slug);

  return (
    <>
      <div className="flex-1">
        <Grid>
          <h1 className="text-3xl font-bold mb-0.5">{entry.title}</h1>
          <p className="text-lg mb-0.5 md:mr-8">{entry.description}</p>
        </Grid>
      </div>
    </>
  );
}
