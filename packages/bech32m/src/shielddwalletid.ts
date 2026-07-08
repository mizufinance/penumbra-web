import { fromBech32m, toBech32m } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.shielddwalletid;
const prefix = Prefixes.shielddwalletid;

export const bech32mWalletId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const walletIdFromBech32m = (shielddwalletid1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(shielddwalletid1 as `${typeof prefix}1${string}`, prefix),
});

export const isWalletId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    walletIdFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { SHIELDD_BECH32M_WALLETID_LENGTH, SHIELDD_BECH32M_WALLETID_PREFIX } from './index.js';
