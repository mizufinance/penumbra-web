import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '.';
import { fireEvent, render } from '@testing-library/react';
import { ShielddUIProvider } from '../ShielddUIProvider';

describe('<Toggle />', () => {
  it('toggles from false to true', () => {
    const onChange = vi.fn();

    const { getByLabelText } = render(<Toggle label='Toggle' value={false} onChange={onChange} />, {
      wrapper: ShielddUIProvider,
    });

    fireEvent.click(getByLabelText('Toggle'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false', () => {
    const onChange = vi.fn();

    const { getByLabelText } = render(<Toggle label='Toggle' value={true} onChange={onChange} />, {
      wrapper: ShielddUIProvider,
    });

    fireEvent.click(getByLabelText('Toggle'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
