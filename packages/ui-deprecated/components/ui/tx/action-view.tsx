import { ActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { UnimplementedView } from './actions-views/unimplemented-view';
import { IbcRelayComponent } from './actions-views/ibc-relay.tsx';

type Case = Exclude<ActionView['actionView']['case'], undefined>;

const CASE_TO_LABEL: Partial<Record<Case, string>> = {
  ibcRelayAction: 'IBC Relay Action',
  shieldedIcs20Withdrawal: 'Shielded ICS20 Withdrawal',
  shieldedHostWithdrawal: 'Host Withdrawal',
  transfer: 'Transfer',
  noteReshape: 'Note Maintenance',
  complianceRegisterAsset: 'Compliance: Register Asset',
  complianceRegisterUser: 'Compliance: Register User',
  aggregateBundle: 'Aggregate Bundle',
};

const getLabelForActionCase = (actionCase: ActionView['actionView']['case']): string => {
  if (!actionCase) {
    return '';
  }
  return CASE_TO_LABEL[actionCase] ?? actionCase;
};

export const ActionViewComponent = ({
  av: { actionView },
  feeValueView: _feeValueView,
}: {
  av: ActionView;
  feeValueView: ValueView;
}) => {
  switch (actionView.case) {
    case 'ibcRelayAction':
      return <IbcRelayComponent value={actionView.value} />;

    default:
      return <UnimplementedView label={getLabelForActionCase(actionView.case)} />;
  }
};
