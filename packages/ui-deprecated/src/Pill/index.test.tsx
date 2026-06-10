import { describe, expect, it } from 'vitest';
import { Pill } from '.';
import { render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';

describe('<Pill />', () => {
  it('renders its `children`', () => {
    const { queryByText } = render(<Pill>Contents</Pill>, { wrapper: ShielddUIProvider });

    expect(queryByText('Contents')).toBeTruthy();
  });
});
