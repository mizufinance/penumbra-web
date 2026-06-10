import { fromBech32m, toBech32m } from './format/convert.js';
import { Inner } from './format/inner.js';
import { Prefixes } from './format/prefix.js';

const innerName = Inner.shielddgovern;
const prefix = Prefixes.shielddgovern;

export const bech32mGovernanceId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const governanceIdFromBech32 = (shielddgovern1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(shielddgovern1 as `${typeof prefix}1${string}`, prefix),
});

export const isGovernanceId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    governanceIdFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export {
  SHIELDD_BECH32M_GOVERNANCEID_LENGTH,
  SHIELDD_BECH32M_GOVERNANCEID_PREFIX,
} from './index.js';
