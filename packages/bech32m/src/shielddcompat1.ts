import { fromBech32, toBech32 } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.shielddcompat1;
const prefix = Prefixes.shielddcompat1;

export const bech32CompatAddress = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32(bytes, prefix);

export const compatAddressFromBech32 = (shielddcompat1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32(shielddcompat1 as `${typeof prefix}1${string}`, prefix),
});

export const isCompatAddress = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    compatAddressFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export { SHIELDD_BECH32M_ADDRESS_LENGTH, SHIELDD_BECH32M_ADDRESS_PREFIX } from './index.js';
