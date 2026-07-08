import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { AddressView } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { zeroValueView } from './zero-value-view';

/**
 * Transforms an asset metadata to a `BalanceResponse` with a zero balance on account 0.
 */
export const emptyBalanceResponse = (metadata: Metadata, accountIndex = 0) => {
  return new BalancesResponse({
    balanceView: zeroValueView(metadata),
    accountAddress: new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          index: { account: accountIndex },
        },
      },
    }),
  });
};
