import { ViewService } from '@mizufinance/protobuf';
import { shieldd } from '../shieldd';

export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await shieldd.service(ViewService).appParameters({});
  return parameters?.chainId;
};
