import { BalancesResponse } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@mizufinance/protobuf/penumbra/core/keys/v1/keys_pb';
import { getMetadataFromBalancesResponse } from '@mizufinance/getters/balances-response';
import { getAddressIndex } from '@mizufinance/getters/address-view';
import { getMetadata } from '@mizufinance/getters/value-view';

export const balancesResponseAndMetadataAreSameAsset = (
  balancesResponse?: BalancesResponse,
  metadata?: Metadata,
) => getMetadata.optional(balancesResponse?.balanceView)?.equals(metadata);

export const getFirstBalancesResponseNotMatchingMetadata = (
  balancesResponses: BalancesResponse[],
  metadata?: Metadata,
) =>
  balancesResponses.find(
    balancesResponse => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata),
  );

export const getFirstBalancesResponseMatchingMetadata = (
  balancesResponses: BalancesResponse[],
  metadata?: Metadata,
) =>
  balancesResponses.find(balancesResponse =>
    balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata),
  );

export const getFirstMetadataNotMatchingBalancesResponse = (
  metadatas: Metadata[],
  balancesResponse: BalancesResponse,
) =>
  metadatas.find(metadata => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata));

export const getBalanceByMatchingMetadataAndAddressIndex = (
  balances: BalancesResponse[],
  addressIndex: AddressIndex,
  metadata: Metadata,
) => {
  return balances.find(balance => {
    const balanceViewMetadata = getMetadataFromBalancesResponse.optional(balance);

    return (
      getAddressIndex(balance.accountAddress).account === addressIndex.account &&
      metadata.penumbraAssetId?.equals(balanceViewMetadata?.penumbraAssetId)
    );
  });
};
