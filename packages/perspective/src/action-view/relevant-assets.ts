import { ActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { AssetId, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';

export type RelevantAsset = AssetId | Metadata;

export const findRelevantAssets = (_action?: ActionView): RelevantAsset[] => {
  return [];
};
