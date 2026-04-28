import createConfig from '@mizufinance/configs/tailwind-eslint';
import { resolve } from 'node:path';

export default createConfig(resolve('./src/theme/theme.css'));
