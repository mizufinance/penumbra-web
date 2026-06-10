import { describe, expect, it } from 'vitest';
import { filterMetadataOrBalancesResponseByText } from './filterMetadataOrBalancesResponseByText.ts';
import { SHIELDD_BALANCE, SHIELDD_METADATA } from '../../utils/bufs';

describe('filterMetadataOrBalancesResponseByText()', () => {
  describe('when the search text is empty', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText('')(SHIELDD_METADATA)).toBe(true);
    });
  });

  describe('when the search text is just whitespace', () => {
    it('returns `true`', () => {
      expect(filterMetadataOrBalancesResponseByText(' ')(SHIELDD_METADATA)).toBe(true);
    });
  });

  describe('when the value is a `Metadata`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(SHIELDD_METADATA)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UM')(SHIELDD_METADATA)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('penum')(SHIELDD_METADATA)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('ushieldd')(SHIELDD_METADATA)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(SHIELDD_METADATA)).toBe(true);
    });
  });

  describe('when the value is a `BalancesResponse`', () => {
    it('returns `true` when the metadata name contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('Pen')(SHIELDD_BALANCE)).toBe(true);
    });

    it('returns `true` when the metadata symbol contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('UM')(SHIELDD_BALANCE)).toBe(true);
    });

    it('returns `true` when the display contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('shieldd')(SHIELDD_BALANCE)).toBe(true);
    });

    it('returns `true` when the base contains the search text', () => {
      expect(filterMetadataOrBalancesResponseByText('ushieldd')(SHIELDD_BALANCE)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(filterMetadataOrBalancesResponseByText('pen')(SHIELDD_BALANCE)).toBe(true);
    });
  });
});
