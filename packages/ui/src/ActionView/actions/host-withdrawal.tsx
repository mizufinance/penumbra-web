import { useMemo } from 'react';
import { ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { ShieldedHostWithdrawalView } from '@mizufinance/protobuf/shieldd/core/component/shielded_pool/v1/shielded_pool_pb';
import { ValueViewComponent } from '../../ValueView';
import { ActionRow } from '../shared/action-row';
import { ActionWrapper } from '../shared/wrapper';
import { ActionViewBaseProps } from '../types';

export interface HostWithdrawalActionProps extends ActionViewBaseProps {
  value: ShieldedHostWithdrawalView;
}

export const HostWithdrawalAction = ({ value, getMetadata }: HostWithdrawalActionProps) => {
  const view = value.shieldedHostWithdrawalView;
  const withdrawal = view.value?.withdrawal?.body?.withdrawal;
  const valueView = useMemo(() => {
    if (!withdrawal?.value) {
      return undefined;
    }

    const metadata = withdrawal.value.assetId && getMetadata?.(withdrawal.value.assetId);
    return new ValueView({
      valueView: metadata
        ? {
            case: 'knownAssetId',
            value: {
              amount: withdrawal.value.amount,
              metadata,
            },
          }
        : {
            case: 'unknownAssetId',
            value: withdrawal.value,
          },
    });
  }, [getMetadata, withdrawal]);

  let destination: string | undefined;
  if (withdrawal?.destination.case === 'transfer') {
    destination = withdrawal.destination.value.recipient;
  } else if (withdrawal?.destination.case === 'execution') {
    destination = `${withdrawal.destination.value.calls.length} host call(s)`;
  }

  return (
    <ActionWrapper
      title='Host Withdrawal'
      opaque={view.case === 'opaque'}
      infoRows={
        destination && <ActionRow label='Destination' info={destination} copyText={destination} />
      }
    >
      {valueView && <ValueViewComponent valueView={valueView} signed='negative' />}
    </ActionWrapper>
  );
};
