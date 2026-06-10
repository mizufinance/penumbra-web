import { AssetMetadataByIdRequest } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { ViewService } from '@mizufinance/protobuf';
import { AssetId, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { getDenomMetadata } from '@mizufinance/getters/assets-response';
import { shieldd } from '../shieldd';

export const getAllAssets = async (): Promise<Metadata[]> => {
  const responses = await Array.fromAsync(shieldd.service(ViewService).assets({}));
  return responses
    .map(getDenomMetadata)
    .toSorted((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
};

export const getAssetMetadataById = async (assetId: AssetId): Promise<Metadata | undefined> => {
  const req = new AssetMetadataByIdRequest({ assetId });
  const { denomMetadata } = await shieldd.service(ViewService).assetMetadataById(req);
  return denomMetadata;
};
