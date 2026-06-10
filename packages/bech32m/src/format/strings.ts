import type { Prefix } from './prefix.js';

export const StringLength = {
  passet: 65,
  pauctid: 66,
  shieldd: 142,
  shielddfullviewingkey: 131,
  shielddgovern: 72,
  shielddspendkey: 74,
  shielddvalid: 71,
  shielddwalletid: 74,
  plpid: 64,
  shielddcompat1: 149,
  tshieldd: 67,
} as const satisfies Required<Record<Prefix, number>>;
