import { UnbondingTokensByAddressIndexResponse } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (unbondingTokensByAddressIndexResponse?: UnbondingTokensByAddressIndexResponse) =>
    unbondingTokensByAddressIndexResponse?.valueView,
);
