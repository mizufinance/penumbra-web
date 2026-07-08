import { FC } from 'react';
import { ActionView as ActionViewMessage } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { ActionViewBaseProps, ActionViewType, ActionViewValueType, GetMetadata } from './types';
import { UnknownAction } from './actions/unknown';

import { IbcRelayAction } from './actions/ibc-relay';
import { ProposalSubmitAction } from './actions/proposal-submit';
import { ValidatorDefinitionAction } from './actions/validator-definition';
import { ValidatorVoteAction } from './actions/validator-vote';

export interface ActionViewProps extends ActionViewBaseProps {
  action: ActionViewMessage;
}

const componentMap = {
  ibcRelayAction: IbcRelayAction,
  proposalSubmit: ProposalSubmitAction,
  validatorDefinition: ValidatorDefinitionAction,
  validatorVote: ValidatorVoteAction,
  unknown: UnknownAction,
} as const satisfies Partial<Record<ActionViewType | 'unknown', unknown>>;

export const ActionView = ({ action, getMetadata }: ActionViewProps) => {
  const type = action.actionView.case ?? 'unknown';
  const Component = (componentMap[type as keyof typeof componentMap] ?? UnknownAction) as FC<{
    value?: ActionViewValueType;
    getMetadata?: GetMetadata;
  }>;

  return <Component value={action.actionView.value} getMetadata={getMetadata} />;
};
