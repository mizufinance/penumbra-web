import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './root-store';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { Value } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { bech32, bech32m } from 'bech32';
import { BigNumber } from 'bignumber.js';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@mizufinance/getters/value-view';
import { getAddressIndex } from '@mizufinance/getters/address-view';
import { toBaseUnit } from '@mizufinance/types/lo-hi';
import {
  BANKD_ACCOUNT_PREFIX,
  createHostWithdrawalRequest,
} from '@mizufinance/perspective/plan/host-withdrawal';

export interface WithdrawState {
  selectedAsset?: BalancesResponse;
  amount: string;
  destinationAddress: string;
  isLoading: boolean;
  error?: string;
}

export class WithdrawStore {
  private rootStore: RootStore;

  withdrawState: WithdrawState;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;

    this.withdrawState = {
      amount: '',
      destinationAddress: '',
      isLoading: false,
    };

    makeAutoObservable(this);
  }

  setSelectedAsset(asset?: BalancesResponse) {
    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        selectedAsset: asset,
        amount: '',
      };
    });
  }

  setAmount(amount: string) {
    if (Number(amount) < 0) {
      return;
    }

    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        amount,
      };
    });
  }

  setMaxAmount() {
    const { selectedAsset } = this.withdrawState;
    if (selectedAsset?.balanceView.valueView.case === 'knownAssetId') {
      const displayAmount = selectedAsset.balanceView.valueView.value.amount.lo.toString();
      const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
      const maxAmount = new BigNumber(displayAmount)
        .dividedBy(new BigNumber(10).pow(exponent))
        .toString();
      this.setAmount(maxAmount);
    }
  }

  setDestinationAddress(address: string) {
    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        destinationAddress: address,
      };
    });
  }

  get validation() {
    const { selectedAsset } = this.withdrawState;

    return {
      assetError: !selectedAsset,
      amountError: this.isAmountInvalid(),
      addressError: this.isAddressInvalid(),
      balanceError: this.isAmountMoreThanBalance(),
      decimalError: this.hasIncorrectDecimal(),
    };
  }

  get canWithdraw() {
    const { selectedAsset, amount, destinationAddress } = this.withdrawState;
    const validation = this.validation;

    return (
      Boolean(selectedAsset) &&
      Boolean(Number(amount)) &&
      Boolean(destinationAddress.trim()) &&
      !validation.amountError &&
      !validation.addressError &&
      !validation.balanceError &&
      !validation.decimalError &&
      !this.withdrawState.isLoading
    );
  }

  private isAmountInvalid(): boolean {
    const { amount } = this.withdrawState;
    if (!amount.trim()) {
      return false;
    }

    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) || numericAmount <= 0;
  }

  private isAmountMoreThanBalance(): boolean {
    const { selectedAsset, amount } = this.withdrawState;
    if (!selectedAsset || !amount || selectedAsset.balanceView.valueView.case !== 'knownAssetId') {
      return false;
    }

    const numericAmount = parseFloat(amount);
    const displayAmount = selectedAsset.balanceView.valueView.value.amount.lo.toString();
    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const availableAmount = new BigNumber(displayAmount)
      .dividedBy(new BigNumber(10).pow(exponent))
      .toNumber();

    return numericAmount > availableAmount;
  }

  private hasIncorrectDecimal(): boolean {
    const { selectedAsset, amount } = this.withdrawState;
    if (!selectedAsset || !amount) {
      return false;
    }

    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const decimals = amount.includes('.') ? (amount.split('.')[1]?.length ?? 0) : 0;

    return decimals > exponent;
  }

  private isAddressInvalid(): boolean {
    const { destinationAddress } = this.withdrawState;
    if (!destinationAddress.trim()) {
      return false;
    }

    try {
      const { prefix, words } =
        bech32.decodeUnsafe(destinationAddress, Infinity) ??
        bech32m.decodeUnsafe(destinationAddress, Infinity) ??
        {};

      return !words || prefix !== BANKD_ACCOUNT_PREFIX;
    } catch {
      return true;
    }
  }

  private buildTransactionRequest() {
    const { selectedAsset, amount, destinationAddress } = this.withdrawState;

    if (!selectedAsset || !destinationAddress.trim()) {
      throw new Error('Missing required withdrawal information');
    }

    if (selectedAsset.balanceView.valueView.case !== 'knownAssetId') {
      throw new Error('Invalid asset selected');
    }

    const addressIndex = getAddressIndex(selectedAsset.accountAddress);

    // Normalise the randomizer: if it is all-zero but shorter than 12 bytes (e.g. Uint8Array(3)),
    // treat it as "not present" by setting an empty Uint8Array. The planner service
    // rejects non-empty randomizers with length ≠ 12.
    if (addressIndex.randomizer.length > 0 && addressIndex.randomizer.every(b => b === 0)) {
      addressIndex.randomizer = new Uint8Array();
    }

    const assetId = getAssetIdFromValueView(selectedAsset.balanceView);
    const exponent = getDisplayDenomExponentFromValueView(selectedAsset.balanceView);
    const baseAmount = toBaseUnit(BigNumber(amount), exponent);

    return createHostWithdrawalRequest({
      value: new Value({
        amount: baseAmount,
        assetId,
      }),
      recipient: destinationAddress,
      source: addressIndex,
    });
  }

  async executeWithdrawal() {
    if (!this.canWithdraw) {
      return;
    }

    runInAction(() => {
      this.withdrawState = {
        ...this.withdrawState,
        isLoading: true,
        error: undefined,
      };
    });

    try {
      const request = this.buildTransactionRequest();

      const { planBuildBroadcast } = await import('../services/transaction');
      await planBuildBroadcast('shieldedHostWithdrawal', request);

      runInAction(() => {
        this.withdrawState = {
          ...this.withdrawState,
          amount: '',
          destinationAddress: '',
          isLoading: false,
        };
      });

      await this.rootStore.balancesStore.loadBalances();

      // Reload transactions so UI (Recent Shielding Activity) reflects the new withdrawal
      void this.rootStore.transactionsStore.loadTransactions();
    } catch (error) {
      console.error('🔍 Full withdrawal error details:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        withdrawalParams: {
          destinationAddress: this.withdrawState.destinationAddress,
          amount: this.withdrawState.amount,
        },
      });

      // Only set error state if it's not a user denial (toast handles those)
      const { userDeniedTransaction } = await import('../services/transaction');
      if (!userDeniedTransaction(error)) {
        runInAction(() => {
          this.withdrawState = {
            ...this.withdrawState,
            error: error instanceof Error ? error.message : 'Withdrawal failed',
          };
        });
      }
      runInAction(() => {
        this.withdrawState = {
          ...this.withdrawState,
          isLoading: false,
        };
      });
    }
  }

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  dispose() {
    // Cleanup subscriptions if any
  }
}
