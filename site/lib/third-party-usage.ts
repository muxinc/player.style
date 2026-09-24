import { DEMO_VIDEO } from './demo-media';
import type { SkinFramework, ThirdPartySkin } from './skins';

export const THIRD_PARTY_FRAMEWORKS: { id: SkinFramework; label: string }[] = [
  { id: 'react', label: 'React' },
  { id: 'html', label: 'HTML' },
];

const VIDEOJS_PACKAGE: Record<SkinFramework, string> = {
  html: '@videojs/html',
  react: '@videojs/react',
};

/** Third-party skins are published as `@player.style/<slug>`; the slug names the tag, component, and root class. */
export function getThirdPartyNames(skin: ThirdPartySkin) {
  const pascal = skin.slug.replace(/(^|-)([a-z0-9])/g, (_, __, letter: string) => letter.toUpperCase());

  return {
    htmlTag: `${skin.slug}-skin`,
    reactComponent: `${pascal}Skin`,
    rootClass: `ps-${skin.slug}`,
  };
}

export function isSkinFramework(skin: ThirdPartySkin, value: string | null | undefined): value is SkinFramework {
  return skin.frameworks.some((framework) => framework === value);
}

/** The framework shown before the visitor picks one: React when the skin ships it, else the first it lists. */
export function getDefaultFramework(skin: ThirdPartySkin): SkinFramework {
  return skin.frameworks.includes('react') ? 'react' : skin.frameworks[0]!;
}

export function getThirdPartyInstallCommand(skin: ThirdPartySkin, framework: SkinFramework): string {
  return `npm install ${skin.package} ${VIDEOJS_PACKAGE[framework]}`;
}

/** A complete, pasteable player for the framework, on the same demo media the previews play. */
export function getThirdPartyUsageSnippet(skin: ThirdPartySkin, framework: SkinFramework): string {
  const names = getThirdPartyNames(skin);

  if (framework === 'react') {
    return [
      `import { Video, VideoPlayer } from '@videojs/react/video';`,
      `import { ${names.reactComponent} } from '${skin.package}/react';`,
      `import '${skin.package}/skin.css';`,
      ``,
      `export function Player() {`,
      `  return (`,
      `    <VideoPlayer poster="${DEMO_VIDEO.poster}">`,
      `      <${names.reactComponent}>`,
      `        <Video src="${DEMO_VIDEO.mp4}" />`,
      `      </${names.reactComponent}>`,
      `    </VideoPlayer>`,
      `  );`,
      `}`,
    ].join('\n');
  }

  return [
    `<script type="module">`,
    `  import '@videojs/html/video/player';`,
    `  import '${skin.package}';`,
    `</script>`,
    ``,
    `<video-player>`,
    `  <${names.htmlTag}>`,
    `    <video src="${DEMO_VIDEO.mp4}"></video>`,
    `    <img slot="poster" src="${DEMO_VIDEO.poster}" alt="" />`,
    `  </${names.htmlTag}>`,
    `</video-player>`,
  ].join('\n');
}
