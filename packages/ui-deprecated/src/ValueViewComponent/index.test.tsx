import { describe, expect, it } from 'vitest';
import { ValueViewComponent } from '.';
import { render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';
import {
  SHIELDD_VALUE_VIEW,
  UNKNOWN_ASSET_ID_VALUE_VIEW,
  UNKNOWN_ASSET_VALUE_VIEW,
} from '../utils/bufs';

describe('<ValueViewComponent />', () => {
  it('renders the formatted amount and symbol', () => {
    const { container } = render(<ValueViewComponent valueView={SHIELDD_VALUE_VIEW} />, {
      wrapper: ShielddUIProvider,
    });

    expect(container).toHaveTextContent('123,456.789 UM');
  });

  it("renders 'Unknown' for metadata without a symbol", () => {
    const { container } = render(<ValueViewComponent valueView={UNKNOWN_ASSET_VALUE_VIEW} />, {
      wrapper: ShielddUIProvider,
    });

    expect(container).toHaveTextContent('123,000,000 Unknown');
  });

  it("renders 'Unknown' for a value view with a `case` of `unknownAssetId`", () => {
    const { container } = render(<ValueViewComponent valueView={UNKNOWN_ASSET_ID_VALUE_VIEW} />, {
      wrapper: ShielddUIProvider,
    });

    expect(container).toHaveTextContent('123,000,000 Unknown');
  });
});
