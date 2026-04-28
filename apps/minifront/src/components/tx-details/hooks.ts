import { asReceiverTransactionView } from '@mizufinance/perspective/translators/transaction-view';
import { ViewService } from '@mizufinance/protobuf';
import { TransactionView } from '@mizufinance/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionInfo } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '../../penumbra';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      penumbra
        .service(ViewService)
        .indexByAddress({ address })
        .then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
