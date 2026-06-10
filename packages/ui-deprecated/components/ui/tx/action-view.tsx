import { ActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { UnimplementedView } from './actions-views/unimplemented-view';
import { ValidatorVoteComponent } from './actions-views/validator-vote.tsx';
import { IbcRelayComponent } from './actions-views/ibc-relay.tsx';

type Case = Exclude<ActionView['actionView']['case'], undefined>;

const CASE_TO_LABEL: Partial<Record<Case, string>> = {
  ibcRelayAction: 'IBC Relay Action',
  shieldedIcs20Withdrawal: 'Shielded ICS20 Withdrawal',
  proposalSubmit: 'Proposal Submit',
  validatorDefinition: 'Validator Definition',
  validatorVote: 'Validator Vote',
  transfer: 'Transfer',
  consolidate: 'Consolidate',
  split: 'Split',
  complianceRegisterAsset: 'Compliance: Register Asset',
  complianceRegisterUser: 'Compliance: Register User',
  aggregateBundle: 'Aggregate Bundle',
};

const getLabelForActionCase = (actionCase: ActionView['actionView']['case']): string => {
  if (!actionCase) {
    return '';
  }
  return CASE_TO_LABEL[actionCase] ?? String(actionCase);
};

export const ActionViewComponent = ({
  av: { actionView },
  feeValueView: _feeValueView,
}: {
  av: ActionView;
  feeValueView: ValueView;
}) => {
  switch (actionView.case) {
    case 'validatorVote':
      return <ValidatorVoteComponent value={actionView.value} />;

    case 'ibcRelayAction':
      return <IbcRelayComponent value={actionView.value} />;

    default:
      return <UnimplementedView label={getLabelForActionCase(actionView.case)} />;
  }
};
