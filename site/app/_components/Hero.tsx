import Grid from './Grid';
import clsx from 'clsx';

type HeroProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Hero(props: HeroProps) {
  return (
    <>
      <Grid className={clsx('text-center', props.className)}>
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide leading-heading font-normal uppercase whitespace-pre-line mx-auto max-w-32 mb-1">
          {props.title}
        </h1>
        <div>
          <p className="font-body text-md tracking-wide leading-normal font-normal normal-case max-w-30 mx-auto">
            {props.children}
          </p>
        </div>
      </Grid>
    </>
  );
}
