import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { OSMO_VALUE_VIEW, SHIELDD_VALUE_VIEW } from './value-view.ts';
import { ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view.ts';

export const SHIELDD_BALANCE = new BalancesResponse({
  balanceView: SHIELDD_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});

export const SHIELDD2_BALANCE = new BalancesResponse({
  balanceView: SHIELDD_VALUE_VIEW,
  accountAddress: ADDRESS1_VIEW_DECODED,
});

export const OSMO_BALANCE = new BalancesResponse({
  balanceView: OSMO_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});
