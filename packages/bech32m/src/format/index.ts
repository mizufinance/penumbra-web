import { Inner } from './inner.js';
import { StringLength } from './strings.js';
import { ByteLength } from './bytes.js';
import { Prefix, Prefixes } from './prefix.js';

type ShielddBech32mSpec = Required<{
  readonly [p in Prefix]: {
    readonly prefix: (typeof Prefixes)[p];
    readonly stringLength: (typeof StringLength)[p];
    readonly byteLength: (typeof ByteLength)[p];
    readonly innerName: (typeof Inner)[p];
  };
}>;

export default {
  passet: {
    prefix: Prefixes.passet,
    stringLength: StringLength.passet,
    byteLength: ByteLength.passet,
    innerName: Inner.passet,
  },
  pauctid: {
    prefix: Prefixes.pauctid,
    stringLength: StringLength.pauctid,
    byteLength: ByteLength.pauctid,
    innerName: Inner.pauctid,
  },
  shieldd: {
    prefix: Prefixes.shieldd,
    stringLength: StringLength.shieldd,
    byteLength: ByteLength.shieldd,
    innerName: Inner.shieldd,
  },
  shielddfullviewingkey: {
    prefix: Prefixes.shielddfullviewingkey,
    stringLength: StringLength.shielddfullviewingkey,
    byteLength: ByteLength.shielddfullviewingkey,
    innerName: Inner.shielddfullviewingkey,
  },
  shielddgovern: {
    prefix: Prefixes.shielddgovern,
    stringLength: StringLength.shielddgovern,
    byteLength: ByteLength.shielddgovern,
    innerName: Inner.shielddgovern,
  },
  shielddspendkey: {
    prefix: Prefixes.shielddspendkey,
    stringLength: StringLength.shielddspendkey,
    byteLength: ByteLength.shielddspendkey,
    innerName: Inner.shielddspendkey,
  },
  shielddvalid: {
    prefix: Prefixes.shielddvalid,
    stringLength: StringLength.shielddvalid,
    byteLength: ByteLength.shielddvalid,
    innerName: Inner.shielddvalid,
  },
  shielddwalletid: {
    prefix: Prefixes.shielddwalletid,
    stringLength: StringLength.shielddwalletid,
    byteLength: ByteLength.shielddwalletid,
    innerName: Inner.shielddwalletid,
  },
  plpid: {
    prefix: Prefixes.plpid,
    stringLength: StringLength.plpid,
    byteLength: ByteLength.plpid,
    innerName: Inner.plpid,
  },
  shielddcompat1: {
    prefix: Prefixes.shielddcompat1,
    stringLength: StringLength.shielddcompat1,
    byteLength: ByteLength.shielddcompat1,
    innerName: Inner.shielddcompat1,
  },
  tshieldd: {
    prefix: Prefixes.tshieldd,
    stringLength: StringLength.tshieldd,
    byteLength: ByteLength.tshieldd,
    innerName: Inner.tshieldd,
  },
} as const satisfies ShielddBech32mSpec;
