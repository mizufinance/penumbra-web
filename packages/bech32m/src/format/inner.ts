import type { Prefix } from './prefix.js';

export const Inner = {
  passet: 'inner',
  pauctid: 'inner',
  shieldd: 'inner',
  shielddfullviewingkey: 'inner',
  shielddgovern: 'gk',
  shielddspendkey: 'inner',
  shielddvalid: 'ik',
  shielddwalletid: 'inner',
  plpid: 'inner',
  shielddcompat1: 'inner',
  tshieldd: 'inner',
} as const satisfies Required<Record<Prefix, string>>;
