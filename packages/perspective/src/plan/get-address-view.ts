import {
  Address,
  AddressView,
  FullViewingKey,
} from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { getAddressIndexByAddress } from '@mizufinance/wasm/address';

export const getAddressView = (address: Address, fullViewingKey: FullViewingKey): AddressView => {
  const index = getAddressIndexByAddress(fullViewingKey, address);

  if (index) {
    return new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          address,
          index,
        },
      },
    });
  } else {
    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address,
        },
      },
    });
  }
};
