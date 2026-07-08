import { Address } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { ViewService } from '@mizufinance/protobuf';
import { bech32mAddress } from '@mizufinance/bech32m/shieldd';
import { shieldd } from '../shieldd';

type Index = number;
type Bech32Address = string;

export type IndexAddrRecord = Record<Index, Bech32Address>;

export const getAddresses = async (accounts: (number | undefined)[]): Promise<IndexAddrRecord> => {
  const allReqs = accounts.map(getAddressByIndex);

  const responses = await Promise.all(allReqs);
  return responses
    .map((address, i) => {
      return {
        index: accounts[i] ?? 0,
        address: bech32mAddress(address),
      };
    })
    .reduce<IndexAddrRecord>((acc, curr) => {
      acc[curr.index] = curr.address;
      return acc;
    }, {});
};

export const getAddressByIndex = async (account = 0): Promise<Address> => {
  const { address } = await shieldd
    .service(ViewService)
    .addressByIndex({ addressIndex: { account } });
  if (!address) {
    throw new Error('Address not in getAddressByIndex response');
  }
  return address;
};

export const getEphemeralAddress = async (account = 0): Promise<Address> => {
  const { address } = await shieldd
    .service(ViewService)
    .ephemeralAddress({ addressIndex: { account } });
  if (!address) {
    throw new Error('Address not in getEphemeralAddress response');
  }
  return address;
};

export const getAddrByIndex = async (index: number, ephemeral: boolean) => {
  return ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);
};
