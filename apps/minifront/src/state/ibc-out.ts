import { AllSlices, SliceCreator } from '.';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { Value } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import BigNumber from 'bignumber.js';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@mizufinance/getters/value-view';
import { getAddressIndex } from '@mizufinance/getters/address-view';
import { toBaseUnit } from '@mizufinance/types/lo-hi';
import { amountMoreThanBalance, isIncorrectDecimal, planBuildBroadcast } from './helpers';
import { bech32, bech32m } from 'bech32';
import { errorToast } from '@mizufinance/ui-deprecated/lib/toast/presets';
import {
  BANKD_ACCOUNT_PREFIX,
  createHostWithdrawalRequest,
} from '@mizufinance/perspective/plan/host-withdrawal';

export interface IbcOutSlice {
  selection: BalancesResponse | undefined;
  setSelection: (selection: BalancesResponse) => void;
  amount: string;
  setAmount: (amount: string) => void;
  destinationChainAddress: string;
  setDestinationChainAddress: (addr: string) => void;
  sendHostWithdrawal: () => Promise<void>;
  txInProgress: boolean;
}

export const createIbcOutSlice = (): SliceCreator<IbcOutSlice> => (set, get) => {
  return {
    amount: '',
    selection: undefined,
    destinationChainAddress: '',
    txInProgress: false,
    setSelection: selection => {
      set(state => {
        state.ibcOut.selection = selection;
      });
    },
    setAmount: amount => {
      set(state => {
        state.ibcOut.amount = amount;
      });
    },
    setDestinationChainAddress: addr => {
      set(state => {
        state.ibcOut.destinationChainAddress = addr;
      });
    },
    sendHostWithdrawal: async () => {
      set(state => {
        state.ibcOut.txInProgress = true;
      });

      try {
        const req = getPlanRequest(get().ibcOut);
        await planBuildBroadcast('shieldedHostWithdrawal', req);

        // Reset form
        set(state => {
          state.ibcOut.amount = '';
        });
      } catch (e) {
        errorToast(e, 'Host withdrawal error').render();
      } finally {
        set(state => {
          state.ibcOut.txInProgress = false;
        });
      }
    },
  };
};

const tenMinsMs = 1000 * 60 * 10;
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

export const currentTimePlusTwoDaysRounded = (currentTimeMs: number): bigint => {
  const twoDaysFromNowMs = currentTimeMs + twoDaysMs;
  const roundedTimeoutMs = twoDaysFromNowMs + tenMinsMs - (twoDaysFromNowMs % tenMinsMs);
  return BigInt(roundedTimeoutMs) * 1_000_000n;
};

const getPlanRequest = ({ amount, selection, destinationChainAddress }: IbcOutSlice) => {
  if (!destinationChainAddress.trim()) {
    throw new Error('Bankd recipient is required');
  }
  if (!selection) {
    throw new Error('No asset selected');
  }

  const assetId = getAssetIdFromValueView(selection.balanceView);

  return createHostWithdrawalRequest({
    value: new Value({
      amount: toBaseUnit(
        BigNumber(amount),
        getDisplayDenomExponentFromValueView(selection.balanceView),
      ),
      assetId,
    }),
    recipient: destinationChainAddress,
    source: getAddressIndex(selection.accountAddress),
  });
};

export const ibcOutSelector = (state: AllSlices) => state.ibcOut;

export const ibcValidationErrors = (state: AllSlices) => {
  return {
    recipientErr: !state.ibcOut.destinationChainAddress
      ? false
      : !bankdAddressIsValid(state.ibcOut.destinationChainAddress),
    amountErr: !state.ibcOut.selection
      ? false
      : amountMoreThanBalance(state.ibcOut.selection, state.ibcOut.amount),
    exponentErr: !state.ibcOut.selection
      ? false
      : isIncorrectDecimal(state.ibcOut.selection, state.ibcOut.amount),
  };
};

export const bankdAddressIsValid = (address: string): boolean => {
  const { prefix, words } =
    bech32.decodeUnsafe(address, Infinity) ?? bech32m.decodeUnsafe(address, Infinity) ?? {};
  return !!words && prefix === BANKD_ACCOUNT_PREFIX;
};

export const hostWithdrawalBalancesSelector = (state: AllSlices): BalancesResponse[] =>
  state.shared.balancesResponses.data ?? [];

export const hostWithdrawalPlaceholderSelector = (state: AllSlices): string =>
  hostWithdrawalBalancesSelector(state).length === 0
    ? 'No balances to withdraw'
    : 'Enter an amount';
