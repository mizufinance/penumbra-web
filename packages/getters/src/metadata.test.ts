import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { describe, expect, it } from 'vitest';
import { getDisplayDenomExponent } from './metadata.js';

describe('getDisplayDenomExponent()', () => {
  it("gets the exponent from the denom unit whose `denom` is equal to the metadata's `display` property", () => {
    const shielddMetadata = new Metadata({
      display: 'shieldd',
      denomUnits: [
        {
          denom: 'shieldd',
          exponent: 6,
        },
        {
          denom: 'mshieldd',
          exponent: 3,
        },
        {
          denom: 'ushieldd',
          exponent: 0,
        },
      ],
    });

    expect(getDisplayDenomExponent(shielddMetadata)).toBe(6);
  });
});
