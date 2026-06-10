import { ViewService } from '@mizufinance/protobuf';
import { GasPrices } from '@mizufinance/protobuf/shieldd/core/component/fee/v1/fee_pb';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { getAssetIdFromValueView } from '@mizufinance/getters/value-view';
import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { getAddressIndex } from '@mizufinance/getters/balances-response';
import { getAssetId } from '@mizufinance/getters/metadata';
import { shieldd } from '../shieldd';

// Fetches gas prices
export const getGasPrices = async (): Promise<GasPrices[]> => {
  const res = await shieldd.service(ViewService).gasPrices({});
  return res.altGasPrices;
};

// Determines if the user has UM token in their account balances
export const hasStakingToken = (
  balancesResponses: BalancesResponse[] | undefined,
  stakingAssetMetadata: Metadata | undefined,
  source: BalancesResponse | undefined,
): boolean => {
  if (!balancesResponses || !stakingAssetMetadata || !source) {
    return false;
  }

  const account = getAddressIndex.optional(source)?.account;
  if (typeof account === 'undefined') {
    return false;
  }

  return balancesResponses.some(
    asset =>
      getAssetIdFromValueView
        .optional(asset.balanceView)
        ?.equals(getAssetId.optional(stakingAssetMetadata)) &&
      getAddressIndex.optional(asset)?.account === account,
  );
};
