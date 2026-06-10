import { fromBech32, toBech32 } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.tshieldd;
const prefix = Prefixes.tshieldd;

export const bech32TransparentAddress = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32(bytes, prefix);

export const transparentAddressFromBech32 = (shieldd1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32(shieldd1 as `${typeof prefix}1${string}`, prefix),
});

export const isAddress = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    transparentAddressFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export { SHIELDD_BECH32M_TRANSPARENT_LENGTH, SHIELDD_BECH32M_TRANSPARENT_PREFIX } from './index.js';
