import { beforeAll, describe, expect, it } from 'vitest';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from './keys.js';
import { getAddressIndexByAddress, isControlledAddress } from './address.js';
import { addressFromBech32m } from '@mizufinance/bech32m/penumbra';
import { Address } from '@mizufinance/protobuf/penumbra/core/keys/v1/keys_pb';

describe('address', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';
  let fullViewingKey: Awaited<ReturnType<typeof getFullViewingKey>>;

  beforeAll(async () => {
    const spendKey = await generateSpendKey(seedPhrase);
    fullViewingKey = await getFullViewingKey(spendKey);
  });

  describe('getAddressIndexByAddress()', () => {
    it('works with controlled addr', async () => {
      const address = await getAddressByIndex(fullViewingKey, 1);

      expect(getAddressIndexByAddress(fullViewingKey, address)!.account).toBe(1);
    });

    it('returns undefined with uncontrolled addr', async () => {
      const address = new Address(
        addressFromBech32m(
          'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v',
        ),
      );

      expect(getAddressIndexByAddress(fullViewingKey, address)).toBeUndefined();
    });
  });

  describe('isControlledAddress()', () => {
    it('returns true if the address is controlled', async () => {
      const address = await getAddressByIndex(fullViewingKey, 1);

      expect(isControlledAddress(fullViewingKey, address)).toBe(true);
    });

    it('returns false if the address is not controlled', async () => {
      const spendKey = await generateSpendKey(seedPhrase);
      const fullViewingKey = await getFullViewingKey(spendKey);
      const address = new Address(
        addressFromBech32m(
          'penumbra1ftmn2a3hf8pxe0e48es8u9rqhny4xggq9wn2caxcjnfwfhwr5s0t3y6nzs9gx3ty5czd0sd9ssfgjt2pcxrq93yvgk2gu3ynmayuwgddkxthce8l445v8x6v07y2sjd8djcr6v',
        ),
      );

      expect(isControlledAddress(fullViewingKey, address)).toBe(false);
    });

    it('returns false if the address is undefined', async () => {
      expect(isControlledAddress(fullViewingKey, undefined)).toBe(false);
    });
  });
});
