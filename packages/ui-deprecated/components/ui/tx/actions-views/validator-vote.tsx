import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import {
  ValidatorVote,
  Vote,
  Vote_Vote,
} from '@mizufinance/protobuf/shieldd/core/component/governance/v1/governance_pb';
import { bech32mIdentityKey } from '@mizufinance/bech32m/shielddvalid';
import { bech32mGovernanceId } from '@mizufinance/bech32m/shielddgovern';

const VoteToString = (vote: Vote): string => {
  switch (vote.vote) {
    case Vote_Vote.YES:
      return 'Yes';
    case Vote_Vote.NO:
      return 'No';
    case Vote_Vote.ABSTAIN:
      return 'Abstain';
    default:
      return 'Unspecified';
  }
};

export const ValidatorVoteComponent = ({ value }: { value: ValidatorVote }) => {
  return (
    <ViewBox
      label='Validator Vote'
      visibleContent={
        <ActionDetails>
          {!!value.body?.proposal && (
            <ActionDetails.Row label='Proposal'>{Number(value.body.proposal)}</ActionDetails.Row>
          )}

          {!!value.body?.vote && (
            <ActionDetails.Row label='Vote'>{VoteToString(value.body.vote)}</ActionDetails.Row>
          )}

          {!!value.body?.reason?.reason && (
            <ActionDetails.Row label='Reason'>{value.body.reason.reason}</ActionDetails.Row>
          )}

          {!!value.body?.identityKey && (
            <ActionDetails.Row label='Identity key'>
              {bech32mIdentityKey(value.body.identityKey)}
            </ActionDetails.Row>
          )}

          {!!value.body?.governanceKey && (
            <ActionDetails.Row label='Governance key'>
              {bech32mGovernanceId(value.body.governanceKey)}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
