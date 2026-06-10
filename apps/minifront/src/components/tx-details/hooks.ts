import { asReceiverTransactionView } from '@mizufinance/perspective/translators/transaction-view';
import { ViewService } from '@mizufinance/protobuf';
import { TransactionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { TransactionInfo } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { shieldd } from '../../shieldd';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      shieldd
        .service(ViewService)
        .indexByAddress({ address })
        .then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
