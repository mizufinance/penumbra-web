import { beforeAll, describe, expect, it } from 'vitest';
import { generateSpendKey, getAddressByIndex, getFullViewingKey } from './keys.js';
import { getAddressIndexByAddress, isControlledAddress } from './address.js';

describe('address', () => {
  const seedPhrase =
    'benefit cherry cannon tooth exhibit law avocado spare tooth that amount pumpkin scene foil tape mobile shine apology add crouch situate sun business explain';
  let fullViewingKey: Awaited<ReturnType<typeof getFullViewingKey>>;
  let uncontrolledAddress: Awaited<ReturnType<typeof getAddressByIndex>>;

  beforeAll(async () => {
    const spendKey = await generateSpendKey(seedPhrase);
    fullViewingKey = await getFullViewingKey(spendKey);

    const otherSpendKey = await generateSpendKey(
      'flag public tonight parrot gospel treat tiny section useless smoke swim armor',
    );
    const otherFullViewingKey = await getFullViewingKey(otherSpendKey);
    uncontrolledAddress = await getAddressByIndex(otherFullViewingKey, 1);
  });

  describe('getAddressIndexByAddress()', () => {
    it('works with controlled addr', async () => {
      const address = await getAddressByIndex(fullViewingKey, 1);

      expect(getAddressIndexByAddress(fullViewingKey, address)!.account).toBe(1);
    });

    it('returns undefined with uncontrolled addr', async () => {
      expect(getAddressIndexByAddress(fullViewingKey, uncontrolledAddress)).toBeUndefined();
    });
  });

  describe('isControlledAddress()', () => {
    it('returns true if the address is controlled', async () => {
      const address = await getAddressByIndex(fullViewingKey, 1);

      expect(isControlledAddress(fullViewingKey, address)).toBe(true);
    });

    it('returns false if the address is not controlled', async () => {
      expect(isControlledAddress(fullViewingKey, uncontrolledAddress)).toBe(false);
    });

    it('returns false if the address is undefined', async () => {
      expect(isControlledAddress(fullViewingKey, undefined)).toBe(false);
    });
  });
});
