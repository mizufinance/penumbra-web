import { createGetter } from './utils/create-getter.js';
import { AssetsResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';

export const getDenomMetadata = createGetter(
  (assetsResponse?: AssetsResponse) => assetsResponse?.denomMetadata,
);
