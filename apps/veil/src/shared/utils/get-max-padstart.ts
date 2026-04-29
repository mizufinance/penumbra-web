import { ValueView } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@mizufinance/types/pnum';

export const getValueViewLength = (valueView: ValueView): number => {
  return pnum(valueView).toFormattedString({ trailingZeros: true }).length;
};

/**
 * Calculate the maximum length of the formatted numbers in the array of ValueView objects.
 */
export const getMaxPadstart = (arr: ValueView[]): number => {
  return Math.max(
    ...arr.map(v => {
      return getValueViewLength(v);
    }),
  );
};
