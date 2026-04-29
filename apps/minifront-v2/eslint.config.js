import createConfig from '@mizufinance/configs/tailwind-eslint';
import { createRequire } from 'node:module';

const config = createConfig(createRequire(import.meta.url).resolve('@mizufinance/ui/theme.css'));

export default config;
