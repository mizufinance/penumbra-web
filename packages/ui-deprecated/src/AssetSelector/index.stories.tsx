import type { Meta, StoryObj } from '@storybook/react';

import { AssetSelector, AssetSelectorValue } from '.';
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

const balanceOptions: BalancesResponse[] = [SHIELDD_BALANCE, SHIELDD2_BALANCE, OSMO_BALANCE];
const assetOptions: Metadata[] = [PIZZA_METADATA, SHIELDD_METADATA, OSMO_METADATA];

const meta: Meta<typeof AssetSelector> = {
  component: AssetSelector,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    value: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof AssetSelector>;

export const MixedBalancesResponsesAndMetadata: Story = {
  args: {
    dialogTitle: 'Transfer Assets',
    assets: assetOptions,
    balances: balanceOptions,
  },

  render: function Render(props) {
    const [value, setValue] = useState<AssetSelectorValue>();

    return <AssetSelector {...props} value={value} onChange={setValue} />;
  },
};
