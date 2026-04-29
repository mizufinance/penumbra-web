import { createGetter } from './utils/create-getter.js';
import { AssetsResponse } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';

export const getDenomMetadata = createGetter(
  (assetsResponse?: AssetsResponse) => assetsResponse?.denomMetadata,
);
