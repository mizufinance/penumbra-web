import {
  BalancesRequest,
  BalancesResponse,
} from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { AssetId } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { AddressIndex } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { ViewService } from '@mizufinance/protobuf';
import { shieldd } from '../../shieldd';

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

  const iterable = shieldd.service(ViewService).balances(req);
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

  return shieldd.service(ViewService).balances(req);
};
