import type { Prefix } from './prefix.js';

export const ByteLength = {
  passet: 32,
  pauctid: 32,
  shieldd: 80,
  shielddcompat1: 80,
  shielddfullviewingkey: 64,
  shielddgovern: 32,
  shielddspendkey: 32,
  shielddvalid: 32,
  shielddwalletid: 32,
  plpid: 32,
  tshieldd: 32,
} as const satisfies Required<Record<Prefix, number>>;
