import { ContextKey, createContextKey, Client } from '@connectrpc/connect';
import type { StakeService } from '@mizufinance/protobuf';

export const stakeClientCtx: ContextKey<Client<typeof StakeService> | undefined> =
  createContextKey(undefined);
