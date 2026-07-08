import { AssetId } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import {
  Address,
  FullViewingKey,
  GovernanceKey,
  IdentityKey,
  SpendKey,
  WalletId,
} from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { describe, expect, test } from 'vitest';
import { Inner } from './inner.js';

describe('The expected inner field exists on the actual types', () => {
  test('passet inner', () => {
    const passet = new AssetId();
    expect(passet[Inner.passet]).toBeDefined();
  });

  test('address inner', () => {
    const address = new Address();
    expect(address[Inner.shieldd]).toBeDefined();
  });

  test('full viewing key inner', () => {
    const fullViewingKey = new FullViewingKey();
    expect(fullViewingKey[Inner.shielddfullviewingkey]).toBeDefined();
  });

  test('spend key inner', () => {
    const spendKey = new SpendKey();
    expect(spendKey[Inner.shielddspendkey]).toBeDefined();
  });

  test('governance key gk', () => {
    const governanceKey = new GovernanceKey();
    expect(governanceKey[Inner.shielddgovern]).toBeDefined();
  });

  test('validatorid key ik', () => {
    const validatorId = new IdentityKey();
    expect(validatorId[Inner.shielddvalid]).toBeDefined();
  });

  test('wallet id inner', () => {
    const walletId = new WalletId();
    expect(walletId[Inner.shielddwalletid]).toBeDefined();
  });
});
