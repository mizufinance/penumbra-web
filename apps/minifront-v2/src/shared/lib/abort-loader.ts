import { shieldd } from './shieldd';
import {
  ShielddClient,
  ShielddNotInstalledError,
  ShielddProviderNotConnectedError,
} from '@mizufinance/client';

/**
 * Retry test, resolving `true`, or resolving `false` if timeout reached.
 *
 * @param fn test method returning a boolean
 * @param ms millisecond maximum wait. default half a second
 * @param rate wait between attempts. default `ms/10`, stays above 50ms unless set.
 * @returns promise that resolves to true if `fn` returns true, or false at timeout
 */
const retry = async (fn: () => boolean, ms = 500, rate = Math.max(ms / 10, 50)) =>
  fn() ||
  new Promise<boolean>(resolve => {
    const interval = setInterval(() => {
      if (fn()) {
        clearInterval(interval);
        resolve(true);
      }
    }, rate);
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, ms);
  });

const throwIfProviderNotConnected = () => {
  if (!shieldd.connected) {
    throw new ShielddProviderNotConnectedError();
  }
};

const throwIfProviderNotInstalled = () => {
  if (!Object.keys(ShielddClient.getProviders()).length) {
    throw new ShielddNotInstalledError();
  }
};

/**
 * Resolves fast if Prax is connected, or rejects if Prax is not connected after
 * timeout. This is a temporary solution until loaders properly await Prax
 * connection.
 */
export const abortLoader = async (): Promise<null> => {
  throwIfProviderNotInstalled();
  await retry(() => Boolean(shieldd.connected), 500);
  throwIfProviderNotConnected();

  // Loaders are required to return a value, even if it's null. By returning
  // `null` here, we can use this loader directly in the router.
  return null;
};
