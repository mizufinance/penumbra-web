import { AssetMetadataByIdRequest } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { ViewService } from '@mizufinance/protobuf';
import { AssetId, Metadata } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { getDenomMetadata } from '@mizufinance/getters/assets-response';
import { penumbra } from '../penumbra';

export const getAllAssets = async (): Promise<Metadata[]> => {
  const responses = await Array.fromAsync(penumbra.service(ViewService).assets({}));
  return responses
    .map(getDenomMetadata)
    .toSorted((a, b) => Number(b.priorityScore) - Number(a.priorityScore));
};

export const getAssetMetadataById = async (assetId: AssetId): Promise<Metadata | undefined> => {
  const req = new AssetMetadataByIdRequest({ assetId });
  const { denomMetadata } = await penumbra.service(ViewService).assetMetadataById(req);
  return denomMetadata;
};
