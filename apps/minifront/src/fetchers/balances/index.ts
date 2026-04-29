import {
  BalancesRequest,
  BalancesResponse,
} from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { AssetId } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@mizufinance/protobuf/penumbra/core/keys/v1/keys_pb';
import { ViewService } from '@mizufinance/protobuf';
import { penumbra } from '../../penumbra';

export interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const getBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}): Promise<
  BalancesResponse[]
> => {
  const req = new BalancesRequest({});
  if (accountFilter) {
    req.accountFilter = accountFilter;
  }
  if (assetIdFilter) {
    req.assetIdFilter = assetIdFilter;
  }

  const iterable = penumbra.service(ViewService).balances(req);
  return Array.fromAsync(iterable);
};

export const getBalancesStream = ({
  accountFilter,
  assetIdFilter,
}: BalancesProps = {}): AsyncIterable<BalancesResponse> => {
  const req = new BalancesRequest();
  if (accountFilter) {
    req.accountFilter = accountFilter;
  }
  if (assetIdFilter) {
    req.assetIdFilter = assetIdFilter;
  }

  return penumbra.service(ViewService).balances(req);
};
