import { describe } from 'vitest';
import { generateTests } from './util/generate-tests.js';
import { bech32mWalletId, walletIdFromBech32m } from '../shielddwalletid.js';
import { Prefixes } from '../format/prefix.js';
import { Inner } from '../format/inner.js';

describe('asset id conversion', () => {
  const okBech32 = 'shielddwalletid15r7q7qsf3hhsgj0g530n7ng9acdacmmx9ajknjz38dyt90u9gcgsq7mezk';
  const okInner = new Uint8Array([
    160, 252, 15, 2, 9, 141, 239, 4, 73, 232, 164, 95, 63, 77, 5, 238, 27, 220, 111, 102, 47, 101,
    105, 200, 81, 59, 72, 178, 191, 133, 70, 17,
  ]);

  generateTests(
    Prefixes.shielddwalletid,
    Inner.shielddwalletid,
    okInner,
    okBech32,
    bech32mWalletId,
    walletIdFromBech32m,
  );
});
