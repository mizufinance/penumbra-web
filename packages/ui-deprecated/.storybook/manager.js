import { addons } from '@storybook/manager-api';
import shielddTheme from './shielddTheme';

addons.setConfig({
  showToolbar: true,
  theme: shielddTheme,
  sidebar: {
    collapsedRoots: ['Deprecated'],
  },
});
