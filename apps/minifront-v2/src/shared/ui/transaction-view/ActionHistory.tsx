import React from 'react';
import { ActionView as PbActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { AssetId, Denom, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { ActionView } from '@mizufinance/ui/ActionView';
import { Text } from '@mizufinance/ui/Text';
import { Connector } from './Connector';

interface ActionHistoryProps {
  actionViews?: PbActionView[];
  getTxMetadata: (assetIdOrDenom: AssetId | Denom | undefined) => Metadata | undefined;
}

export const ActionHistory: React.FC<ActionHistoryProps> = ({ actionViews, getTxMetadata }) => {
  if (!actionViews || actionViews.length === 0) {
    return <Text color='text.secondary'>No actions in this view.</Text>;
  }

  return (
    <div className='flex flex-col'>
      {actionViews.map((actionView, index) => (
        <React.Fragment key={index}>
          <ActionView action={actionView} getMetadata={getTxMetadata} />
          {index < actionViews.length - 1 && <Connector />}
        </React.Fragment>
      ))}
    </div>
  );
};
