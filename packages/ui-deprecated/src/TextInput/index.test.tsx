import { describe, expect, it } from 'vitest';
import { TextInput } from '.';
import { render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';

describe('<TextInput />', () => {
  it('renders the passed-in `startAdornment`', () => {
    const { container } = render(
      <TextInput value='' onChange={() => {}} startAdornment='Start adornment' />,
      { wrapper: ShielddUIProvider },
    );

    expect(container).toHaveTextContent('Start adornment');
  });

  it('renders the passed-in `endAdornment`', () => {
    const { container } = render(
      <TextInput value='' onChange={() => {}} endAdornment='End adornment' />,
      { wrapper: ShielddUIProvider },
    );

    expect(container).toHaveTextContent('End adornment');
  });
});
