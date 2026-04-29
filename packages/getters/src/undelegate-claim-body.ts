import { UndelegateClaimBody } from '@mizufinance/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getValidatorIdentity = createGetter(
  (undelegateClaimBody?: UndelegateClaimBody) => undelegateClaimBody?.validatorIdentity,
);
