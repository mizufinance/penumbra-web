/**
 * BalancesStore - Manages account balances and related operations
 *
 * This store handles fetching, caching, and updating account balances.
 * It provides computed values for easy access to balance data in components.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { AddressView, AddressIndex } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { Metadata, AssetId } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import {
  getMetadataFromBalancesResponse,
  getAddressIndex,
} from '@mizufinance/getters/balances-response';
import { RootStore } from './root-store';
import { shieldd } from '../lib/shieldd';
import { ShielddState } from '@mizufinance/client';

export interface BalancesByAccount {
  account: number;
  address: AddressView | undefined;
  balances: BalancesResponse[];
}

export class BalancesStore {
  // Observable state
  balancesResponses: BalancesResponse[] = [];
  loading = false;
  error: Error | null = null;

  // Filters
  accountFilter?: number;
  assetIdFilter?: string;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    // Listen for connection state changes to retry loading
    shieldd.onConnectionStateChange(event => {
      if (event.state === ShielddState.Connected) {
        void this.loadBalances();
      }
    });
  }

  /**
   * Initialize the store and load initial data
   */
  async initialize() {
    if (!shieldd.connected) {
      // Connection not ready yet, will retry when connection is established
      return;
    }

    // Clear any account filter to ensure we load all accounts
    this.accountFilter = undefined;
    await this.loadBalances();
  }

  /**
   * Load balances for all accounts (clears any account filter)
   */
  async loadAllAccountBalances() {
    this.accountFilter = undefined;
    await this.loadBalances();
  }

  /**
   * Clean up the store
   */
  dispose() {
    this.balancesResponses = [];
    this.loading = false;
    this.error = null;
  }

  /**
   * Load balances from the service
   */
  async loadBalances() {
    if (!shieldd.connected) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const responses: BalancesResponse[] = [];
      const stream = this.rootStore.shielddService.getBalancesStream({
        accountFilter:
          this.accountFilter !== undefined
            ? new AddressIndex({ account: this.accountFilter })
            : undefined,
        assetIdFilter: this.assetIdFilter
          ? new AssetId({ inner: new TextEncoder().encode(this.assetIdFilter) })
          : undefined,
      });

      for await (const response of stream) {
        responses.push(response);
      }

      runInAction(() => {
        this.balancesResponses = responses;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error as Error;
        this.loading = false;
      });
    }
  }

  /**
   * Set account filter and reload balances
   */
  async setAccountFilter(account?: number) {
    this.accountFilter = account;
    await this.loadBalances();
  }

  /**
   * Set asset filter and reload balances
   */
  async setAssetIdFilter(assetId?: string) {
    this.assetIdFilter = assetId;
    await this.loadBalances();
  }

  /**
   * Get balances grouped by account
   */
  get balancesByAccount(): BalancesByAccount[] {
    const accountMap = new Map<number, BalancesByAccount>();

    for (const response of this.balancesResponses) {
      const addressIndex = getAddressIndex.optional(response);
      if (addressIndex === undefined) {
        continue;
      }

      const account = addressIndex.account;
      if (!accountMap.has(account)) {
        accountMap.set(account, {
          account,
          address: response.accountAddress,
          balances: [],
        });
      }

      const accountData = accountMap.get(account);
      if (accountData) {
        accountData.balances.push(response);
      }
    }

    return Array.from(accountMap.values()).sort((a, b) => a.account - b.account);
  }

  /**
   * Get all unique assets from balances
   */
  get uniqueAssets(): Metadata[] {
    const assetMap = new Map<string, Metadata>();

    for (const response of this.balancesResponses) {
      const metadata = getMetadataFromBalancesResponse(response);
      if (metadata.shielddAssetId) {
        const assetId = metadata.shielddAssetId.inner.toString();
        if (!assetMap.has(assetId)) {
          assetMap.set(assetId, metadata);
        }
      }
    }

    return Array.from(assetMap.values());
  }

  /**
   * Get total value across all accounts (placeholder for future implementation)
   */
  readonly totalValue = 0;

  /**
   * Check if a specific account has any balances
   */
  hasBalances(account: number): boolean {
    return this.balancesResponses.some(response => {
      const addressIndex = getAddressIndex.optional(response);
      return addressIndex !== undefined && addressIndex.account === account;
    });
  }

  /**
   * Get balances for a specific asset across all accounts
   */
  getBalancesByAsset(assetId: string): BalancesResponse[] {
    return this.balancesResponses.filter(response => {
      const metadata = getMetadataFromBalancesResponse(response);
      return metadata.shielddAssetId?.inner.toString() === assetId;
    });
  }
}
