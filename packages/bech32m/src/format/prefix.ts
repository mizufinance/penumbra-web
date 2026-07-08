export const Prefixes = {
  passet: 'passet',
  pauctid: 'pauctid',
  shieldd: 'shieldd',
  shielddfullviewingkey: 'shielddfullviewingkey',
  shielddgovern: 'shielddgovern',
  shielddspendkey: 'shielddspendkey',
  shielddvalid: 'shielddvalid',
  shielddwalletid: 'shielddwalletid',
  plpid: 'plpid',
  shielddcompat1: 'shielddcompat1',
  tshieldd: 'tshieldd',
} as const;

export type Prefix = keyof typeof Prefixes;
