import { ViewService } from '@mizufinance/protobuf';
import { TransactionId } from '@mizufinance/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { TransactionInfo } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { hexToUint8Array } from '@mizufinance/types/hex';
import { penumbra } from '../penumbra';

export const getTxInfoByHash = async (hash: string): Promise<TransactionInfo> => {
  const res = await penumbra.service(ViewService).transactionInfoByHash({
    id: new TransactionId({ inner: hexToUint8Array(hash) }),
  });

  const txInfo = res.txInfo;
  if (!txInfo) {
    throw new Error('Transaction info not found');
  }

  return txInfo;
};
