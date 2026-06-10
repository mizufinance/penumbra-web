import { Address } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { bech32mAddress } from '@mizufinance/bech32m/shieldd';

export interface AddressComponentProps {
  address: Address;
  ephemeral?: boolean;
}

/**
 * Displays an address. The address is truncated to the prefix plus 24
 * characters, and rendered in color when it is ephemeral.
 */
export const AddressComponent = ({ address, ephemeral }: AddressComponentProps) => {
  const bech32Addr = bech32mAddress(address);

  return (
    <span className={'font-mono' + (ephemeral ? ' text-rust' : ' text-muted-foreground truncate')}>
      {bech32Addr}
    </span>
  );
};
