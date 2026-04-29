import React from 'react';
import { JsonViewer } from '@mizufinance/ui/JsonViewer';
import { typeRegistry } from '@mizufinance/protobuf';
import type { Jsonified } from '@mizufinance/types/jsonified';
import { TransactionView as PbTransactionView } from '@mizufinance/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { SectionComponentProps } from './TransactionView';

// Use SectionComponentProps
export const RawTransaction: React.FC<SectionComponentProps> = ({ transactionToDisplay }) => {
  if (!transactionToDisplay) {
    return <div className='py-1 text-sm text-gray-500 italic'>Raw JSON data unavailable.</div>;
  }

  const jsonToDisplay = transactionToDisplay.toJson({
    typeRegistry,
  }) as Jsonified<PbTransactionView>;

  return <JsonViewer data={jsonToDisplay} collapsed={true} />;
};
