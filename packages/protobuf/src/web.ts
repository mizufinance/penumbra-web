import {
  IbcChannelMsgService,
  IbcChannelService,
  IbcClientMsgService,
  IbcClientService,
  IbcConnectionMsgService,
  IbcConnectionService,
} from './services/cosmos-ibc-core.js';
import type { CustodyService } from './services/penumbra-custody.js';
import type { ViewService } from './services/penumbra-view.js';
import type {
  AppService,
  CompactBlockService,
  FeeService,
  GovernanceService,
  SctService,
  ShieldedPoolService,
} from './services/penumbra-core.js';
import type { TendermintProxyService } from './services/penumbra-util.js';

export type PenumbraService =
  | typeof AppService
  | typeof CompactBlockService
  | typeof CustodyService
  | typeof FeeService
  | typeof GovernanceService
  | typeof IbcChannelService
  | typeof IbcChannelMsgService
  | typeof IbcClientService
  | typeof IbcClientMsgService
  | typeof IbcConnectionService
  | typeof IbcConnectionMsgService
  | typeof SctService
  | typeof ShieldedPoolService
  | typeof TendermintProxyService
  | typeof ViewService;
