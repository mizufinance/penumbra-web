import { fromBech32m, toBech32m } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.shielddspendkey;
const prefix = Prefixes.shielddspendkey;

export const bech32mSpendKey = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const spendKeyFromBech32m = (shielddspendkey1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(shielddspendkey1 as `${typeof prefix}1${string}`, prefix),
});

export const isSpendKey = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    spendKeyFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { SHIELDD_BECH32M_SPENDKEY_LENGTH, SHIELDD_BECH32M_SPENDKEY_PREFIX } from './index.js';
