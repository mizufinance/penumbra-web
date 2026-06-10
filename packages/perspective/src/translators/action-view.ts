import { ActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { Address } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { Translator } from './types.js';

export const asPublicActionView: Translator<ActionView> = actionView => {
  // TODO: per-action opaque projections for the shieldd action surface
  // (transfer/consolidate/split/etc). For now pass through; downstream UI
  // displays whatever is on the view.
  return actionView ?? new ActionView();
};

export const asReceiverActionView: Translator<
  ActionView,
  Promise<ActionView>,
  { isControlledAddress: (address: Address) => Promise<boolean> }
> = async actionView => {
  return asPublicActionView(actionView);
};
