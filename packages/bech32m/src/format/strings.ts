import type { Prefix } from './prefix.js';

export const StringLength = {
  passet: 65,
  pauctid: 66,
  shieldd: 143,
  shielddfullviewingkey: 132,
  shielddgovern: 73,
  shielddspendkey: 75,
  shielddvalid: 72,
  shielddwalletid: 75,
  plpid: 64,
  shielddcompat1: 150,
  tshieldd: 68,
} as const satisfies Required<Record<Prefix, number>>;
