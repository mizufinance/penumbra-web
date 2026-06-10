import { describe, expect, test } from 'vitest';
import { ValueViewComponent } from '.';
import { render } from '@testing-library/react';
import { Metadata, ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@mizufinance/types/base64';

describe('<ValueViewComponent />', () => {
  const shielddMetadata = new Metadata({
    base: 'ushieldd',
    display: 'shieldd',
    symbol: 'UM',
    shielddAssetId: {
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    },
    images: [
      {
        png: 'https://raw.githubusercontent.com/mizufinance/shieldd/main/apps/minifront/public/favicon.png',
      },
    ],
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

  describe('when rendering a known denomination', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: {
            hi: 0n,
            lo: 123_456_789n,
          },
          metadata: shielddMetadata,
        },
      },
    });

    test('renders the amount in the display denom unit', () => {
      const { container } = render(<ValueViewComponent view={valueView} />);

      expect(container).toHaveTextContent('123.456789UM');
    });
  });

  describe('when rendering an unknown denomination', () => {
    const valueView = new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: {
            hi: 0n,
            lo: 123_456_789n,
          },
          assetId: {
            inner: shielddMetadata.shielddAssetId!.inner,
          },
        },
      },
    });

    test('renders the amount in the base unit, along with an asset ID', () => {
      const { container } = render(<ValueViewComponent view={valueView} />);
      expect(container).toHaveTextContent(`123,456,789Unknown asset`);
    });
  });
});
