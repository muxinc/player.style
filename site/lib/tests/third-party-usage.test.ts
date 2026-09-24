import { describe, expect, it } from 'vite-plus/test';

import type { ThirdPartySkin } from '../skins';
import {
  getDefaultFramework,
  getThirdPartyInstallCommand,
  getThirdPartyNames,
  getThirdPartyUsageSnippet,
} from '../third-party-usage';

const skin: ThirdPartySkin = {
  kind: 'third-party',
  slug: 'x-mas',
  title: 'X-mas',
  description: 'Festive.',
  useCase: 'video',
  author: { name: 'Someone' },
  frameworks: ['html', 'react'],
  package: '@player.style/x-mas',
};

describe('getThirdPartyNames', () => {
  it('derives the tag, component, and root class from the slug', () => {
    expect(getThirdPartyNames(skin)).toEqual({
      htmlTag: 'x-mas-skin',
      reactComponent: 'XMasSkin',
      rootClass: 'ps-x-mas',
    });
  });
});

describe('getDefaultFramework', () => {
  it('prefers React and falls back to the first listed framework', () => {
    expect(getDefaultFramework(skin)).toBe('react');
    expect(getDefaultFramework({ ...skin, frameworks: ['html'] })).toBe('html');
  });
});

describe('getThirdPartyInstallCommand', () => {
  it('installs the skin beside the matching Video.js package', () => {
    expect(getThirdPartyInstallCommand(skin, 'html')).toBe('npm install @player.style/x-mas @videojs/html');
    expect(getThirdPartyInstallCommand(skin, 'react')).toBe('npm install @player.style/x-mas @videojs/react');
  });
});

describe('getThirdPartyUsageSnippet', () => {
  it('wraps the media in the skin for each framework', () => {
    expect(getThirdPartyUsageSnippet(skin, 'html')).toContain('<x-mas-skin>');
    expect(getThirdPartyUsageSnippet(skin, 'html')).toContain(`import '@player.style/x-mas';`);
    expect(getThirdPartyUsageSnippet(skin, 'react')).toContain('<XMasSkin>');
    expect(getThirdPartyUsageSnippet(skin, 'react')).toContain(`import '@player.style/x-mas/skin.css';`);
  });
});
