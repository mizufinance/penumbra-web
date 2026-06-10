import { SctService } from '@mizufinance/protobuf';
import { shieldd } from '../shieldd';

export const getBlockDate = async (
  height: bigint,
  signal?: AbortSignal,
): Promise<Date | undefined> => {
  const { timestamp } = await shieldd
    .service(SctService)
    .timestampByHeight({ height }, { signal });
  return timestamp?.toDate();
};
