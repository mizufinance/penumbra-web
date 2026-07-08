import { ValidatorDefinition } from '@mizufinance/protobuf/shieldd/core/component/validator/v1/validator_pb';
import { UnknownAction } from './unknown';

export interface ValidatorDefinitionActionProps {
  value: ValidatorDefinition;
}

export const ValidatorDefinitionAction = (_: ValidatorDefinitionActionProps) => {
  return <UnknownAction label='Validator Definition' opaque={false} />;
};
