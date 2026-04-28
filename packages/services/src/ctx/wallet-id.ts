import { ConnectError, createContextKey } from '@connectrpc/connect';
import { WalletId } from '@mizufinance/protobuf/penumbra/core/keys/v1/keys_pb';

export const walletIdCtx = createContextKey<() => Promise<WalletId>>(() =>
  Promise.reject(new ConnectError('No wallet id available')),
);
