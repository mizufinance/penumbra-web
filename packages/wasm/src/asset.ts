import { AssetId } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { get_asset_id } from '../wasm/index.js';
import { ensureWasmInitialized } from './init.js';

/**
 * Converts a base denom name string to an `AssetId` with inner binary field
 * @param altBaseDenom an asset's base denomination name
 * @returns the appropriate `AssetId`
 */
export const assetIdFromBaseDenom = async (altBaseDenom: string) => {
  await ensureWasmInitialized();
  const inputBytes = new AssetId({ altBaseDenom }).toBinary();
  const outputBytes = get_asset_id(inputBytes);
  return AssetId.fromBinary(outputBytes);
};
