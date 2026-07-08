import { bech32mIdentityKey } from '@mizufinance/bech32m/shielddvalid';
import { AssetId, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };
const unbondString = 'unbonding_start_at_123_' + validatorIkString;
const uunbondString = 'uunbonding_start_at_123_' + validatorIkString;
const unbondAsset = { inner: u8(32) };

export const DELEGATION_TOKEN_METADATA = new Metadata({
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  shielddAssetId: delAsset,
  symbol: `delUM(${validatorIkString})`,
});

export const UNBONDING_TOKEN_METADATA = new Metadata({
  display: unbondString,
  base: uunbondString,
  denomUnits: [{ denom: uunbondString }, { denom: unbondString, exponent: 6 }],
  name: 'Unbonding token',
  shielddAssetId: unbondAsset,
  symbol: `unbondUMat123(${validatorIkString})`,
});

export const SHIELDD_METADATA = new Metadata({
  denomUnits: [
    {
      denom: 'shieldd',
      exponent: 6,
    },
    {
      denom: 'mshieldd',
      exponent: 3,
    },
    {
      denom: 'ushieldd',
    },
  ],
  base: 'ushieldd',
  name: 'Shieldd',
  display: 'shieldd',
  symbol: 'UM',
  shielddAssetId: new AssetId({ inner: u8(32) }),
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const OSMO_METADATA = new Metadata({
  symbol: 'OSMO',
  name: 'Osmosis',
  shielddAssetId: new AssetId({ inner: u8(32) }),
  base: 'uosmo',
  display: 'osmo',
  denomUnits: [{ denom: 'uosmo' }, { denom: 'osmo', exponent: 6 }],
});

export const PIZZA_METADATA = new Metadata({
  symbol: 'PIZZA',
  name: 'Pizza',
  shielddAssetId: new AssetId({ inner: u8(32) }),
  base: 'upizza',
  display: 'pizza',
  denomUnits: [{ denom: 'upizza' }, { denom: 'pizza', exponent: 6 }],
});

export const UNKNOWN_TOKEN_METADATA = new Metadata({
  shielddAssetId: { inner: new Uint8Array([]) },
});
