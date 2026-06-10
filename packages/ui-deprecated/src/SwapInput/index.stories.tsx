import type { Meta, StoryObj } from '@storybook/react';

import { SwapInput } from '.';
import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { useState } from 'react';
import {
  OSMO_BALANCE,
  OSMO_METADATA,
  SHIELDD2_BALANCE,
  SHIELDD_BALANCE,
  SHIELDD_METADATA,
  PIZZA_METADATA,
} from '../utils/bufs';
import { AssetSelectorValue } from '../AssetSelector';

const balanceOptions: BalancesResponse[] = [SHIELDD_BALANCE, SHIELDD2_BALANCE, OSMO_BALANCE];
const assetOptions: Metadata[] = [PIZZA_METADATA, SHIELDD_METADATA, OSMO_METADATA];

const meta: Meta<typeof SwapInput> = {
  component: SwapInput,
  tags: ['autodocs', '!dev'],
  argTypes: {
    value: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SwapInput>;

export const SwapInputBasic: Story = {
  args: {
    label: 'Swap Input',
    dialogTitle: 'Transfer Assets',
    assets: assetOptions,
    balances: balanceOptions,
    placeholder: 'Input value...',
  },

  render: function Render(props) {
    const [value, setValue] = useState<string>('');
    const [from, setFrom] = useState<AssetSelectorValue>();
    const [to, setTo] = useState<AssetSelectorValue>();

    return (
      <SwapInput
        {...props}
        value={value}
        onValueChange={setValue}
        from={from}
        onFromChange={setFrom}
        to={to}
        onToChange={setTo}
      />
    );
  },
};
