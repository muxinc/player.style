import Code from './Code';
import mediaElements from '@/media-elements';
import { findParam } from '@/app/_utils/utils';

type DocsInstallProps = {
  searchParams: Record<string, string | string[]>;
};

export default async function DocsInstall({ searchParams }: DocsInstallProps) {
  const media = findParam(searchParams, 'media') || 'video';
  const mediaElement = mediaElements[media as keyof typeof mediaElements];

  const framework = findParam(searchParams, 'framework') || 'html';

  if (framework === 'html') return null;

  const embed = findParam(searchParams, 'embed') ?? 'packaged';

  let mediaPackage =
    mediaElement.package?.[framework as keyof typeof mediaElement.package] ??
    (mediaElement.package?.default as string);

  if (mediaPackage && !mediaPackage.startsWith('@')) {
    mediaPackage = mediaPackage.split('/')[0];
  }

  const installs = [embed === 'template' ? 'media-chrome' : 'player.style'];

  if (mediaPackage) {
    installs.unshift(mediaPackage);
  }

  return (
    <>
      <h4 className="text-lg font-medium mb-1">Install dependencies</h4>

      <div className="mb-1">
        <Code lang="bash" code={installs.map((item) => `npm install ${item}`).join('\n')} />
      </div>
    </>
  );
}
