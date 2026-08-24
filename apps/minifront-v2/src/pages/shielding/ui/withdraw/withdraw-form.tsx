import React, { useMemo, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@mizufinance/ui/Button';
import { Text } from '@mizufinance/ui/Text';
import { useWithdrawStore } from '@/shared/stores/store-context';
import { useUnifiedAssets, UnifiedAsset } from '@/shared/api/use-unified-assets';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { AddressView } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { pnum } from '@mizufinance/types/pnum';
import { getAddressIndex } from '@mizufinance/getters/address-view';
import { AssetValueInput } from '@mizufinance/ui/AssetValueInput';
import { Density } from '@mizufinance/ui/Density';
import { TextInput } from '@mizufinance/ui/TextInput';

const commonSectionClasses = 'flex flex-col bg-other-tonal-fill5 p-3 gap-1';
const firstSectionClasses = `${commonSectionClasses} rounded-t-sm rounded-b-none`;
const lastSectionClasses = `${commonSectionClasses} rounded-t-none rounded-b-sm`;

const WithdrawFormInternal: React.FC = observer(() => {
  const withdrawStore = useWithdrawStore();
  const { unifiedAssets } = useUnifiedAssets();
  const addressInputRef = useRef<HTMLInputElement>(null);

  const { withdrawState, validation, canWithdraw } = withdrawStore;

  const assetBalances: BalancesResponse[] = useMemo(() => {
    const convertedUnsorted = unifiedAssets
      .filter((asset: UnifiedAsset) => {
        if (!asset.shieldedBalances.length) {
          return false;
        }

        const positiveBalances = asset.shieldedBalances.filter(balance => {
          const amount = pnum(balance.valueView).toNumber();
          return amount > 0;
        });

        if (positiveBalances.length === 0) {
          return false;
        }
        return true;
      })
      .flatMap((asset: UnifiedAsset) => {
        return asset.shieldedBalances
          .map(shieldedBalance => {
            try {
              const accountIndex = getAddressIndex(shieldedBalance.balance.accountAddress);
              const balancesResponse = new BalancesResponse({
                balanceView: shieldedBalance.valueView,
                accountAddress: new AddressView({
                  addressView: {
                    case: 'decoded',
                    value: {
                      address: { inner: new Uint8Array(80) },
                      index: {
                        account: accountIndex.account,
                        randomizer: new Uint8Array([0, 0, 0]),
                      },
                    },
                  },
                }),
              });

              return balancesResponse;
            } catch (error) {
              console.error('Error creating BalancesResponse for:', asset.symbol, error);
              return null;
            }
          })
          .filter(Boolean);
      })
      .filter(Boolean) as BalancesResponse[];

    const sorted = convertedUnsorted.sort((a, b) => {
      const metaA =
        a.balanceView.valueView.case === 'knownAssetId'
          ? a.balanceView.valueView.value.metadata
          : undefined;
      const metaB =
        b.balanceView.valueView.case === 'knownAssetId'
          ? b.balanceView.valueView.value.metadata
          : undefined;
      const aIsIbc = metaA?.symbol.toLowerCase().startsWith('ibc/') ?? false;
      const bIsIbc = metaB?.symbol.toLowerCase().startsWith('ibc/') ?? false;
      if (aIsIbc === bIsIbc) {
        return 0;
      }
      return aIsIbc ? 1 : -1;
    });

    return sorted;
  }, [unifiedAssets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void withdrawStore.executeWithdrawal();
  };

  const sectionTitleColor = undefined;
  const isFormDisabled = withdrawState.isLoading;

  return (
    <div className='flex w-full flex-col rounded-sm'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <div className={firstSectionClasses}>
          <Text color={sectionTitleColor}>Amount</Text>
          <AssetValueInput
            amount={withdrawState.amount}
            onAmountChange={(amount: string) => withdrawStore.setAmount(amount)}
            selectedAsset={withdrawState.selectedAsset}
            onAssetChange={(asset: BalancesResponse) => {
              withdrawStore.setSelectedAsset(asset);
            }}
            balances={assetBalances}
            assets={[]}
            amountPlaceholder={
              assetBalances.length === 0
                ? 'No assets available for host withdrawal'
                : 'Amount to withdraw...'
            }
            assetDialogTitle={`Select Asset`}
            showBalance={true}
            disabled={isFormDisabled}
          />
        </div>

        <div className={lastSectionClasses}>
          <Text color={sectionTitleColor}>Bankd Recipient</Text>
          <TextInput
            ref={addressInputRef}
            placeholder='Enter a Bankd account address (wallet1...)'
            value={withdrawState.destinationAddress}
            onChange={value => withdrawStore.setDestinationAddress(value)}
            disabled={isFormDisabled}
          />
          {validation.addressError && (
            <Text detail color='destructive.light'>
              Enter a valid Bankd account address beginning with wallet.
            </Text>
          )}
        </div>

        {/* Error message - only show validation errors, transaction errors are handled by toasts */}
        {withdrawState.error && (
          <div className='rounded-lg p-3'>
            <Text color='destructive.light' small>
              Failed: {withdrawState.error}
            </Text>
          </div>
        )}

        <Density sparse>
          <Button
            type='submit'
            disabled={!canWithdraw || withdrawState.isLoading}
            actionType='unshield'
          >
            {withdrawState.isLoading ? 'Processing Unshielding...' : 'Unshield'}
          </Button>
        </Density>
      </form>
    </div>
  );
});

export const WithdrawForm = observer(() => <WithdrawFormInternal />);
