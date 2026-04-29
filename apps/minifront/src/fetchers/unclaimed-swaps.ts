import { ViewService } from '@mizufinance/protobuf';
import { SwapRecord } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { getUnclaimedSwaps } from '@mizufinance/getters/unclaimed-swaps-response';
import { UnclaimedSwapsWithMetadata } from '../state/unclaimed-swaps';
import { getSwapAsset1, getSwapAsset2 } from '@mizufinance/getters/swap-record';
import { Metadata } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { uint8ArrayToBase64 } from '@mizufinance/types/base64';
import { penumbra } from '../penumbra';

const fetchMetadataForSwap = async (swap: SwapRecord): Promise<UnclaimedSwapsWithMetadata> => {
  const assetId1 = getSwapAsset1(swap);
  const assetId2 = getSwapAsset2(swap);

  const [{ denomMetadata: asset1Metadata }, { denomMetadata: asset2Metadata }] = await Promise.all([
    penumbra.service(ViewService).assetMetadataById({ assetId: assetId1 }),
    penumbra.service(ViewService).assetMetadataById({ assetId: assetId2 }),
  ]);

  return {
    swap,
    // If no metadata, uses assetId for asset icon display
    asset1: asset1Metadata ?? new Metadata({ display: uint8ArrayToBase64(assetId1.inner) }),
    asset2: asset2Metadata ?? new Metadata({ display: uint8ArrayToBase64(assetId2.inner) }),
  };
};

const byHeightDescending = (a: UnclaimedSwapsWithMetadata, b: UnclaimedSwapsWithMetadata): number =>
  Number(b.swap.outputData?.height) - Number(a.swap.outputData?.height);

export const fetchUnclaimedSwaps = async (): Promise<UnclaimedSwapsWithMetadata[]> => {
  const responses = await Array.fromAsync(penumbra.service(ViewService).unclaimedSwaps({}));
  const unclaimedSwaps = responses.map(getUnclaimedSwaps);
  const unclaimedSwapsWithMetadata = await Promise.all(unclaimedSwaps.map(fetchMetadataForSwap));

  return unclaimedSwapsWithMetadata.sort(byHeightDescending);
};
