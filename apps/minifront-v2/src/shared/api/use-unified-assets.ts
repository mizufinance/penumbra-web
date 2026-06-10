import { useCosmosBalances, CosmosBalance } from './use-cosmos-balances';
import { Metadata, ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { useMemo, useEffect } from 'react';
import { useWallet } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';
import { pnum } from '@mizufinance/types/pnum';
import { assetPatterns } from '@mizufinance/types/assets';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { useBalancesStore } from '../stores/store-context';
import {
  getMetadataFromBalancesResponse,
  getBalanceView,
} from '@mizufinance/getters/balances-response';

export interface ShieldedBalance {
  valueView: ValueView;
  balance: BalancesResponse;
}

export interface PublicBalance {
  chainId: string;
  denom: string;
  valueView: ValueView;
}

export interface UnifiedAsset {
  symbol: string;
  metadata: Metadata;
  shieldedBalances: ShieldedBalance[];
  publicBalances: PublicBalance[];
}

const normalizeSymbol = (symbol: string): string => {
  return symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const getPublicBalanceKey = (chainId: string, denom: string): string => {
  return `${chainId}:${denom}`;
};

export const shouldFilterAsset = (symbol: string): boolean => {
  return [
    assetPatterns.lpNft,
    assetPatterns.auctionNft,
    assetPatterns.unbondingToken,
    assetPatterns.votingReceipt,
    assetPatterns.proposalNft,
    assetPatterns.delegationToken,
  ].some(pattern => pattern.matches(symbol));
};

/**
 * Hook that combines Shieldd (shielded) and Cosmos (public) balances into a unified asset structure.
 */
export const useUnifiedAssets = () => {
  const { status: cosmosWalletStatus } = useWallet();

  const balancesStore = useBalancesStore();
  const shielddBalances = balancesStore.balancesResponses;
  const shielddLoading = balancesStore.loading;

  const { balances: cosmosBalances = [], isLoading: cosmosLoading } = useCosmosBalances();

  useEffect(() => {
    if (shielddBalances.length === 0 && !shielddLoading) {
      void balancesStore.loadAllAccountBalances();
    }
  }, [balancesStore, shielddBalances.length, shielddLoading]);

  const isShielddConnected = shielddBalances.length > 0 || !shielddLoading;
  const isCosmosConnected = cosmosWalletStatus === WalletStatus.Connected;

  const shouldFilterAsset = (symbol: string): boolean => {
    return [
      assetPatterns.lpNft,
      assetPatterns.auctionNft,
      assetPatterns.unbondingToken,
      assetPatterns.votingReceipt,
      assetPatterns.proposalNft,
      assetPatterns.delegationToken,
    ].some(pattern => pattern.matches(symbol));
  };

  const shieldedAssets = useMemo(() => {
    if (!isShielddConnected || !shielddBalances.length) {
      return [];
    }

    const assetMap = new Map<string, UnifiedAsset>();

    shielddBalances
      .filter(balance => {
        return balance.balanceView?.valueView.case === 'knownAssetId';
      })
      .filter(balance => {
        const metadata = getMetadataFromBalancesResponse(balance);
        return !shouldFilterAsset(metadata.symbol);
      })
      .forEach(balance => {
        try {
          const metadata = getMetadataFromBalancesResponse(balance);
          const valueView = getBalanceView(balance);
          const symbol = metadata.symbol;

          const existingAsset = assetMap.get(symbol);
          if (existingAsset) {
            existingAsset.shieldedBalances.push({
              valueView,
              balance,
            });
          } else {
            const newAsset: UnifiedAsset = {
              symbol,
              metadata,
              shieldedBalances: [
                {
                  valueView,
                  balance,
                },
              ],
              publicBalances: [],
            };
            assetMap.set(symbol, newAsset);
          }
        } catch (error: unknown) {
          console.error('Error processing Shieldd balance', error);
        }
      });

    return Array.from(assetMap.values());
  }, [isShielddConnected, shielddBalances]);

  const publicAssets = useMemo(() => {
    if (!isCosmosConnected || !cosmosBalances.length) {
      return [];
    }

    return cosmosBalances
      .map(({ asset, amount, chainId }: CosmosBalance) => {
        try {
          const metadata = new Metadata({
            base: asset.base,
            display: asset.display,
            denomUnits: asset.denom_units,
            symbol: asset.symbol,
            shielddAssetId: { inner: new Uint8Array([1]) },
            coingeckoId: asset.coingecko_id,
            images: asset.images,
            name: asset.name,
            description: asset.description,
          });

          const valueView = new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                amount: pnum(amount).toAmount(),
                metadata,
                equivalentValues: [],
              },
            },
          });

          const unifiedAsset = {
            symbol: asset.symbol,
            metadata,
            shieldedBalances: [],
            publicBalances: [
              {
                chainId,
                denom: asset.base,
                valueView,
              },
            ],
          } as UnifiedAsset;
          return unifiedAsset;
        } catch (error: unknown) {
          console.error('Error processing Cosmos balance', error, { asset, amount, chainId });
          return null;
        }
      })
      .filter(Boolean) as UnifiedAsset[];
  }, [cosmosBalances, isCosmosConnected]);

  const unifiedAssets = useMemo(() => {
    const assetMap = new Map<string, UnifiedAsset>();

    shieldedAssets.forEach(asset => {
      const key = normalizeSymbol(asset.symbol);
      assetMap.set(key, asset);
    });

    if (isCosmosConnected) {
      publicAssets.forEach(asset => {
        const key = normalizeSymbol(asset.symbol);
        const existing = assetMap.get(key);

        if (existing) {
          const balanceKeys = new Set<string>();

          existing.publicBalances.forEach(balance => {
            balanceKeys.add(getPublicBalanceKey(balance.chainId, balance.denom));
          });

          asset.publicBalances.forEach(balance => {
            const balanceKey = getPublicBalanceKey(balance.chainId, balance.denom);
            if (!balanceKeys.has(balanceKey)) {
              existing.publicBalances.push(balance);
              balanceKeys.add(balanceKey);
            }
          });
        } else {
          assetMap.set(key, asset);
        }
      });
    } else {
      assetMap.forEach(asset => {
        asset.publicBalances = [];
      });
    }

    return Array.from(assetMap.values());
  }, [shieldedAssets, publicAssets, isCosmosConnected]);

  const totalShieldedValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalPublicValue = useMemo(() => {
    return 0; // TODO: Implement when prices are available
  }, []);

  const totalValue = useMemo(() => {
    return totalShieldedValue + totalPublicValue;
  }, [totalShieldedValue, totalPublicValue]);

  const isLoading = unifiedAssets.length === 0 && (shielddLoading || cosmosLoading);

  return {
    unifiedAssets,
    totalShieldedValue,
    totalPublicValue,
    totalValue,
    isLoading,
    isShielddConnected,
    isCosmosConnected,
  };
};
