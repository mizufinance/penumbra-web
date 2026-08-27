import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { Metadata, ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { Amount } from '@mizufinance/protobuf/shieldd/core/num/v1/num_pb';
import { sendValidationErrors } from './send';
import { AddressView } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { produce } from 'immer';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { ibcValidationErrors } from './ibc-out';

describe('IBC Slice', () => {
  const selectionExample = new BalancesResponse({
    balanceView: new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: new Amount({
            lo: 0n,
            hi: 0n,
          }),
          metadata: new Metadata({ display: 'test_usd', denomUnits: [{ exponent: 18 }] }),
        },
      },
    }),
    accountAddress: new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          address: { inner: new Uint8Array(80) },
          index: { account: 0 },
        },
      },
    }),
  });

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().ibcOut.amount).toBe('');
    expect(useStore.getState().ibcOut.selection).toBeUndefined();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().ibcOut.setAmount('2');
      expect(useStore.getState().ibcOut.amount).toBe('2');
    });

    // TODO [vanishmax, 2024-06-04]: Remove test skipping
    test.skip('validate high enough amount validates', () => {
      const assetBalance = new Amount({ hi: 1n });
      const state = produce(selectionExample, draft => {
        draft.balanceView!.valueView.value!.amount = assetBalance;
      });
      useStore.getState().send.setSelection(state);
      useStore.getState().send.setAmount('1');
      const { selection, amount } = useStore.getState().send;

      const { amountErr } = sendValidationErrors(selection, amount, 'xyz');
      expect(amountErr).toBeFalsy();
    });

    test.skip('validate error when too low the balance of the asset', () => {
      const assetBalance = new Amount({ lo: 2n });
      const state = produce(selectionExample, draft => {
        draft.balanceView!.valueView.value!.amount = assetBalance;
      });
      useStore.getState().send.setSelection(state);
      useStore.getState().send.setAmount('6');
      const { selection, amount } = useStore.getState().send;
      const { amountErr } = sendValidationErrors(selection, amount, 'xyz');
      expect(amountErr).toBeTruthy();
    });
  });

  describe('Bankd recipient validation', () => {
    test('accepts a Bankd account address', () => {
      const bankdAddress = 'wallet140fehngcrxvhdt84x729p3f0qmkmea8nxup0cy';

      useStore.getState().ibcOut.setDestinationChainAddress(bankdAddress);
      const validationErrors = ibcValidationErrors(useStore.getState());

      expect(validationErrors.recipientErr).toBeFalsy();
    });

    test('rejects a foreign-chain address', () => {
      const osmoAddress = 'osmo1xxxxxx';

      useStore.getState().ibcOut.setDestinationChainAddress(osmoAddress);

      const validationErrors = ibcValidationErrors(useStore.getState());

      expect(validationErrors.recipientErr).toBeTruthy();
    });
  });

  describe('setSelection', () => {
    test('asset and account can be set', () => {
      useStore.getState().send.setSelection(selectionExample);
      expect(useStore.getState().send.selection).toStrictEqual(selectionExample);
    });
  });
});
