import { AssetListItem } from './AssetListItem';
import { AccountData } from './types';
import { AddressViewComponent } from '@mizufinance/ui/AddressView';
import { AddressView } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';

export interface AccountSectionProps {
  /**
   * Account with its assets to display
   */
  account: Omit<AccountData, 'addressView'> & { addressView?: AddressView };
}

/**
 * AccountSection component renders an account header with its assets list
 */
export const AccountSection = ({ account }: AccountSectionProps) => {
  return (
    <div className='mb-4 flex flex-col overflow-hidden'>
      <div className='p-3'>
        <AddressViewComponent addressView={account.addressView} />
      </div>
      <div className='flex flex-col gap-1'>
        {account.assets.map(asset => (
          <AssetListItem key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};
