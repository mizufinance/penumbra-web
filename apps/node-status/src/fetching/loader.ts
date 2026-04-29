import { LoaderFunction } from 'react-router-dom';
import { GetStatusResponse } from '@mizufinance/protobuf/penumbra/util/tendermint_proxy/v1/tendermint_proxy_pb';
import { sha256HashStr } from '@mizufinance/crypto-web/sha256';
import { tendermintClient } from '../clients/grpc';

export interface IndexLoaderResponse {
  status: GetStatusResponse;
  latestBlockHash: string | undefined;
  latestAppHash: string | undefined;
}

export const IndexLoader: LoaderFunction = async (): Promise<IndexLoaderResponse> => {
  const status = await tendermintClient.getStatus({});
  const latestBlockHash = await getHash(status.syncInfo?.latestBlockHash);
  const latestAppHash = await getHash(status.syncInfo?.latestAppHash);

  return {
    status,
    latestBlockHash,
    latestAppHash,
  };
};

const getHash = async (uintArr?: Uint8Array): Promise<string | undefined> =>
  uintArr ? sha256HashStr(uintArr) : undefined;
