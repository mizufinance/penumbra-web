import { Value } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { AddressIndex } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { TransactionPlannerRequest } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';

export const BANKD_ACCOUNT_PREFIX = 'wallet';

interface HostWithdrawalRequest {
  value: Value;
  recipient: string;
  source: AddressIndex;
}

export const createHostWithdrawalRequest = ({
  value,
  recipient,
  source,
}: HostWithdrawalRequest): TransactionPlannerRequest => {
  const normalizedRecipient = recipient.trim();
  if (!normalizedRecipient) {
    throw new Error('Bankd recipient is required');
  }

  return new TransactionPlannerRequest({
    hostWithdrawals: [
      {
        value,
        destination: {
          case: 'transfer',
          value: {
            recipient: normalizedRecipient,
          },
        },
      },
    ],
    source,
  });
};
