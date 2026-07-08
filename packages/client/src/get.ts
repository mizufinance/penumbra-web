import { assertShieldd, assertProviderManifest, assertProviderRecord } from './assert.js';
import { ShielddManifest, ShielddManifestJson, isShielddManifestJson } from './manifest.js';
import type { ShielddProvider } from './provider.js';
import { ShielddSymbol } from './symbol.js';

import './global.js';

/** Return the Shieldd global, without verifying anything. */
export const getShielddGlobalUnsafe = () => window[ShielddSymbol];

/** Return the shieldd global, throwing `ShielddNotInstalledError` if it's not available. */
export const getShielddGlobal = () => assertShieldd();

/** Return the specified provider, without verifying anything. */
export const getShielddUnsafe = (shielddOrigin: string) =>
  getShielddGlobalUnsafe()?.[shielddOrigin];

/** Return the specified provider after confirming presence of its manifest. */
export const getShieldd = async (shielddOrigin: string): Promise<ShielddProvider> => {
  const provider = assertProviderRecord(shielddOrigin);
  await assertProviderManifest(shielddOrigin);
  return provider;
};

/** Fetch the specified provider's manifest. */
export const getShielddManifest = async (
  shielddOrigin: string,
  signal?: AbortSignal,
): Promise<ShielddManifest> => {
  const manifestJson = await assertProviderManifest(shielddOrigin, signal);
  if (!isShielddManifestJson(manifestJson)) {
    throw new TypeError('Invalid manifest');
  }
  const icons = await getManifestIcons(shielddOrigin, manifestJson, signal);
  return {
    ...manifestJson,
    icons,
  };
};

/** Fetch all manifests for all providers available on the page. */
export const getShielddManifests = (
  signal?: AbortSignal,
): Record<string, Promise<ShielddManifest>> =>
  Object.fromEntries(
    Object.keys(getShielddGlobal()).map(providerOrigin => [
      providerOrigin,
      getShielddManifest(providerOrigin, signal),
    ]),
  );

// For use by `getShielddManifest`
const getManifestIcons = async (
  base: string,
  mf: ShielddManifestJson,
  signal?: AbortSignal,
): Promise<ShielddManifest['icons']> => {
  const getIcons = await Promise.all(
    Object.entries(mf.icons).map(async ([iconSize, iconPath]) => {
      if (typeof iconPath !== 'string') {
        throw new TypeError('Icon path is not a string');
      }
      if (Number.isNaN(Number(iconSize))) {
        throw new TypeError('Icon size is not a numeric string');
      }

      const res = await fetch(new URL(iconPath, base), { signal });
      return [`${Number(iconSize)}`, await res.blob()] as const;
    }),
  );

  return Object.fromEntries(getIcons) as ShielddManifest['icons'];
};
