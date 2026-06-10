import {
  ActionPlan,
  ActionView,
} from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import { AssetId, Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { FullViewingKey } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';

/**
 * Convert an ActionPlan to an ActionView for display.
 * Most action plans pass through unchanged — the shieldd action surface keeps
 * planning and view representations close.
 */
export const viewActionPlan =
  (_denomMetadataByAssetId: (id: AssetId) => Promise<Metadata>, _fvk: FullViewingKey) =>
  async (_actionPlan: ActionPlan): Promise<ActionView> => {
    return new ActionView({
      actionView: {
        case: undefined,
      },
    });
  };
