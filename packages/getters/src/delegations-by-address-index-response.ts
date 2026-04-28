import { DelegationsByAddressIndexResponse } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (delegationsByAddressIndexResponse?: DelegationsByAddressIndexResponse) =>
    delegationsByAddressIndexResponse?.valueView,
);
