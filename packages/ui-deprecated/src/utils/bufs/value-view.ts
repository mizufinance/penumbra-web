import { ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import {
  DELEGATION_TOKEN_METADATA,
  OSMO_METADATA,
  SHIELDD_METADATA,
  UNBONDING_TOKEN_METADATA,
} from './metadata.ts';

export const SHIELDD_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_456_789_000n },
      metadata: SHIELDD_METADATA,
    },
  },
});

export const OSMO_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 987_000_000n },
      metadata: OSMO_METADATA,
    },
  },
});

export const DELEGATION_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: DELEGATION_TOKEN_METADATA,
    },
  },
});

export const UNBONDING_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: UNBONDING_TOKEN_METADATA,
    },
  },
});

export const UNKNOWN_ASSET_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: {
        shielddAssetId: { inner: new Uint8Array([]) },
      },
    },
  },
});

export const UNKNOWN_ASSET_ID_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'unknownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
    },
  },
});
