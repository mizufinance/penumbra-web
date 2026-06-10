import { Value } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter.js';

export const getAssetIdFromValue = createGetter((value?: Value) => value?.assetId);

export const getAmountFromValue = createGetter((value?: Value) => value?.amount);
