import { bech32mIdentityKey } from '@mizufinance/bech32m/shielddvalid';
import { AssetId, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@mizufinance/types/base64';

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
  badges: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/refs/heads/main/images/full-moon-face.svg',
    },
  ],
});

export const USDC_METADATA = new Metadata({
  description: 'USD Coin',
  denomUnits: [
    {
      denom: 'transfer/channel-2/uusdc',
    },
    {
      denom: 'transfer/channel-2/usdc',
      exponent: 6,
    },
  ],
  base: 'transfer/channel-2/uusdc',
  display: 'transfer/channel-2/usdc',
  name: 'USDC',
  symbol: 'USDC',
  shielddAssetId: {
    inner: base64ToUint8Array('drPksQaBNYwSOzgfkGOEdrd4kEDkeALeh58Ps+7cjQs='),
  },
  images: [
    {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg',
      theme: {
        primaryColorHex: '#2775CA',
        circle: true,
      },
    },
  ],
  badges: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/refs/heads/main/images/pizza.svg',
    },
  ],
  priorityScore: 800000000100n,
  coingeckoId: 'usd-coin',
});

export const OSMO_METADATA = new Metadata({
  description: 'The native token of Osmosis',
  denomUnits: [
    {
      denom: 'transfer/channel-4/uosmo',
    },
    {
      denom: 'transfer/channel-4/osmo',
      exponent: 6,
    },
  ],
  base: 'transfer/channel-4/uosmo',
  display: 'transfer/channel-4/osmo',
  name: 'Osmosis',
  symbol: 'OSMO',
  shielddAssetId: {
    inner: base64ToUint8Array('KSOgqHs6JCHxZcyFPb9zqb2vtdoNlIVktgWcsCF8RAc='),
  },
  images: [
    {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
      theme: {
        primaryColorHex: '#760dbb',
      },
    },
  ],
  priorityScore: 800000000099n,
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

export const LPNFT_METADATA = Metadata.fromJson({
  name: '',
  description: '',
  base: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
  display: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
  symbol: 'lpNft:opened(m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp)',
  images: [],
  priorityScore: '30',
  denomUnits: [
    {
      denom: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
      exponent: 0,
      aliases: [],
    },
  ],
  shielddAssetId: {
    inner: 'rtchIR1VaNZpAxSMh7+Wf2VU8Kfs9b5qDE+kMTGsRww=',
  },
});

// Delegate action specific metadata for testing/storybook
export const DELEGATE_ACTION_VALIDATOR_ID =
  'shielddvalid19caff39080amxlupcjutnhcm7vh8rjfevza0hpx33pn7lnwe6vyqpekzlw';
export const DELEGATE_ACTION_DELEGATION_DENOM = `udelegation_${DELEGATE_ACTION_VALIDATOR_ID}`;

export const DELEGATE_ACTION_DELEGATION_METADATA = new Metadata({
  display: `delegation_${DELEGATE_ACTION_VALIDATOR_ID}`,
  base: DELEGATE_ACTION_DELEGATION_DENOM,
  denomUnits: [
    { denom: DELEGATE_ACTION_DELEGATION_DENOM },
    { denom: `delegation_${DELEGATE_ACTION_VALIDATOR_ID}`, exponent: 6 },
  ],
  name: 'Delegated Shieldd',
  symbol: 'delUM',
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});
