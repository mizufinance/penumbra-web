import type { Meta, StoryObj } from '@storybook/react';
import { ValueViewComponent } from '.';
import {
  DELEGATION_VALUE_VIEW,
  SHIELDD_VALUE_VIEW,
  UNBONDING_VALUE_VIEW,
  UNKNOWN_ASSET_ID_VALUE_VIEW,
  UNKNOWN_ASSET_VALUE_VIEW,
} from '../utils/bufs';

const meta: Meta<typeof ValueViewComponent> = {
  component: ValueViewComponent,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    valueView: {
      options: [
        'Shieldd',
        'Delegation token',
        'Unbonding token',
        'Unknown asset',
        'Unknown asset ID',
      ],
      mapping: {
        Shieldd: SHIELDD_VALUE_VIEW,
        'Delegation token': DELEGATION_VALUE_VIEW,
        'Unbonding token': UNBONDING_VALUE_VIEW,
        'Unknown asset': UNKNOWN_ASSET_VALUE_VIEW,
        'Unknown asset ID': UNKNOWN_ASSET_ID_VALUE_VIEW,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ValueViewComponent>;

export const Basic: Story = {
  args: {
    valueView: SHIELDD_VALUE_VIEW,
    context: 'default',
    priority: 'primary',
  },
};
