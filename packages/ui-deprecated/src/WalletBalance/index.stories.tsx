import type { Meta, StoryObj } from '@storybook/react';
import { WalletBalance } from '.';
import { OSMO_BALANCE, SHIELDD2_BALANCE, SHIELDD_BALANCE } from '../utils/bufs';

const meta: Meta<typeof WalletBalance> = {
  component: WalletBalance,
  tags: ['autodocs', '!dev'],
  argTypes: {
    balance: {
      options: ['Shieldd balance', 'Account 2', 'Osmo balance'],
      mapping: {
        'Shieldd balance': SHIELDD_BALANCE,
        'Account 2': SHIELDD2_BALANCE,
        'Osmo balance': OSMO_BALANCE,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof WalletBalance>;

export const Basic: Story = {
  args: {
    balance: SHIELDD_BALANCE,
  },
};
