import { ViewService } from '@mizufinance/protobuf';
import { penumbra } from '../penumbra';

export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await penumbra.service(ViewService).appParameters({});
  return parameters?.chainId;
};
