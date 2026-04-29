import { AssetSelectorValue, isBalancesResponse } from '@mizufinance/ui/AssetSelector';
import { getMetadataFromBalancesResponse } from '@mizufinance/getters/balances-response';
import { uint8ArrayToHex } from '@mizufinance/types/hex';
import { Metadata } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { formatDistanceToNowStrict } from 'date-fns';

export const getAssetId = (value: AssetSelectorValue | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const metadata: Metadata = isBalancesResponse(value)
    ? getMetadataFromBalancesResponse(value)
    : value;

  return metadata.penumbraAssetId?.inner
    ? uint8ArrayToHex(metadata.penumbraAssetId.inner)
    : undefined;
};

export const formatAge = (openingTime: number) => {
  return formatDistanceToNowStrict(openingTime, {
    addSuffix: false,
    roundingMethod: 'floor',
  })
    .replace(/ minutes?$/, 'm')
    .replace(/ hours?$/, 'h')
    .replace(/ days?$/, 'd')
    .replace(/ weeks?$/, 'w')
    .replace(/ months?$/, 'mo');
};
