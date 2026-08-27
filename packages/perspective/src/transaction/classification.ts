import type { ActionView } from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';

export type ActionClassification = Exclude<ActionView['actionView']['case'], undefined>;

export type TransactionClassification =
  | 'unknown'
  | 'unknownInternal'
  | 'internalTransfer'
  | 'send'
  | 'receive'
  | ActionClassification;
