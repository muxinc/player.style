import { createHash, X509Certificate } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import { chromium } from 'playwright-core';

/** Where the Playwright browsers live; the shared container keeps them outside the default cache. */
export const BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';

/** The CA that re-signs TLS behind the sandbox's egress proxy; Chromium does not read the system trust store. */
const PROXY_CA_CERT = process.env.PROXY_CA_CERT ?? '/root/.ccr/agent-proxy-ca.crt';

/**
 * Chromium's `--ignore-certificate-errors-spki-list` trusts exactly one public key, so the proxy CA is accepted while
 * every other certificate is still verified.
 */
function proxyCaSpkiHash() {
  if (!existsSync(PROXY_CA_CERT)) return null;

  const spki = new X509Certificate(readFileSync(PROXY_CA_CERT)).publicKey.export({ type: 'spki', format: 'der' });

  return createHash('sha256').update(spki).digest('base64');
}

/**
 * Launch Chromium for the e2e screenshots: autoplay allowed, and outbound requests sent through the sandbox's HTTPS
 * proxy when one is configured, so remote media resolves while the local servers on 127.0.0.1 stay direct.
 */
export async function launchBrowser() {
  if (existsSync(BROWSERS_PATH)) process.env.PLAYWRIGHT_BROWSERS_PATH = BROWSERS_PATH;

  const proxyServer = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  const args = ['--autoplay-policy=no-user-gesture-required', '--mute-audio'];

  if (proxyServer) {
    // Playwright otherwise forces loopback traffic through the proxy too, which the local servers on 127.0.0.1 must not do.
    process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK ??= '1';

    const spki = proxyCaSpkiHash();

    if (spki) args.push(`--ignore-certificate-errors-spki-list=${spki}`);
  }

  return chromium.launch({
    args,
    proxy: proxyServer ? { server: proxyServer, bypass: 'localhost,127.0.0.1' } : undefined,
  });
}
