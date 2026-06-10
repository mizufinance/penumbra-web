import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { IdentityKey } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { get_delegation_asset } from '../wasm/index.js';

export const getDelegationTokenMetadata = (identityKey: IdentityKey): Metadata => {
  const result = get_delegation_asset(identityKey.toBinary());
  return Metadata.fromBinary(result);
};
