import { describe, expect, it, vi } from 'vitest';
import { ButtonGroup, ButtonGroupProps } from '.';
import { fireEvent, render } from '@testing-library/react';
import { Ban, HandCoins, Send } from 'lucide-react';
import { ShielddUIProvider } from '../ShielddUIProvider';

const onClickDelegate = vi.fn();
const onClickUndelegate = vi.fn();
const onClickCancel = vi.fn();

const BUTTONS: ButtonGroupProps<true>['buttons'] = [
  {
    label: 'Delegate',
    icon: Send,
    onClick: onClickDelegate,
  },
  {
    label: 'Undelegate',
    icon: HandCoins,
    onClick: onClickUndelegate,
  },
  {
    label: 'Cancel',
    icon: Ban,
    onClick: onClickCancel,
  },
];

describe('<ButtonGroup />', () => {
  it('renders a button for each item in the `buttons` prop', () => {
    const { queryByText } = render(<ButtonGroup buttons={BUTTONS} />, {
      wrapper: ShielddUIProvider,
    });

    expect(queryByText('Delegate')).toBeTruthy();
    expect(queryByText('Undelegate')).toBeTruthy();
    expect(queryByText('Cancel')).toBeTruthy();
  });

  it("calls the given button's click handler when clicked", () => {
    const { getByText } = render(<ButtonGroup buttons={BUTTONS} />, {
      wrapper: ShielddUIProvider,
    });

    fireEvent.click(getByText('Delegate'));
    expect(onClickDelegate).toHaveBeenCalled();

    fireEvent.click(getByText('Undelegate'));
    expect(onClickUndelegate).toHaveBeenCalled();

    fireEvent.click(getByText('Cancel'));
    expect(onClickCancel).toHaveBeenCalled();
  });

  describe('when `iconOnly` is `true`', () => {
    it('renders an icon button for each item in the `buttons` prop', () => {
      const { queryByText, queryByLabelText } = render(<ButtonGroup buttons={BUTTONS} iconOnly />, {
        wrapper: ShielddUIProvider,
      });

      expect(queryByText('Delegate')).toBeNull();
      expect(queryByText('Undelegate')).toBeNull();
      expect(queryByText('Cancel')).toBeNull();

      expect(queryByLabelText('Delegate')).toBeTruthy();
      expect(queryByLabelText('Undelegate')).toBeTruthy();
      expect(queryByLabelText('Cancel')).toBeTruthy();
    });
  });
});
