import { fromBech32m, toBech32m } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.shieldd;
const prefix = Prefixes.shieldd;

export const bech32mAddress = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const addressFromBech32m = (shieldd1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(shieldd1 as `${typeof prefix}1${string}`, prefix),
});

export const isAddress = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    addressFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { SHIELDD_BECH32M_ADDRESS_LENGTH, SHIELDD_BECH32M_ADDRESS_PREFIX } from './index.js';
