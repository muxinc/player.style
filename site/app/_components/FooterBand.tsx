import clsx from 'clsx';

/** The five stacked brand bars that close the page, as on the Video.js 10 site. Dark mode shifts the run one step. */
export default function FooterBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('grid h-20 w-full', className)}
      style={{ gridTemplateRows: '80fr 60fr 45fr 20fr 10fr' }}
    >
      <div className="bg-bright-yellow dark:bg-gold" />
      <div className="bg-gold dark:bg-orange" />
      <div className="bg-orange dark:bg-red" />
      <div className="bg-red dark:bg-magenta" />
      <div className="bg-magenta dark:bg-magenta-dark" />
    </div>
  );
}
