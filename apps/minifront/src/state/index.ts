import { create, StateCreator } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { createIbcOutSlice, IbcOutSlice } from './ibc-out';
import { createSendSlice, sendSelectionMiddleware, SendSlice } from './send';
import { createStatusSlice, StatusSlice } from './status';
import { createTransactionsSlice, TransactionsSlice } from './transactions';
import { createIbcInSlice, IbcInSlice } from './ibc-in';
import { createSharedSlice, SharedSlice } from './shared';

enableMapSet();

export interface AllSlices {
  ibcIn: IbcInSlice;
  ibcOut: IbcOutSlice;
  send: SendSlice;
  shared: SharedSlice;
  status: StatusSlice;
  transactions: TransactionsSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export type Middleware = (
  f: StateCreator<AllSlices, [['zustand/immer', never]]>,
) => StateCreator<AllSlices, [['zustand/immer', never]]>;

export const initializeStore = () => {
  return immer(
    sendSelectionMiddleware((setState, getState: () => AllSlices, store) => ({
      ibcIn: createIbcInSlice()(setState, getState, store),
      ibcOut: createIbcOutSlice()(setState, getState, store),
      send: createSendSlice()(setState, getState, store),
      shared: createSharedSlice()(setState, getState, store),
      status: createStatusSlice()(setState, getState, store),
      transactions: createTransactionsSlice()(setState, getState, store),
    })),
  );
};

export const useStore = create<AllSlices>()(initializeStore());
