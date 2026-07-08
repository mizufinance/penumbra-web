import { assetPatterns } from '@mizufinance/types/assets';
import { getDisplay } from '@mizufinance/getters/metadata';
import { BalancesResponse } from '@mizufinance/protobuf/shieldd/view/v1/view_pb';
import { getMetadata } from '@mizufinance/getters/value-view';
import { isKnown } from '../../state/helpers';

// We don't have to disclose auctionNft to the user since it is a kind of utility asset needed only
// for the implementation of the Dutch auction
const hiddenAssetPatterns = [assetPatterns.auctionNft, assetPatterns.lpNft];

export const shouldDisplay = (balance: BalancesResponse) =>
  isKnown(balance) &&
  hiddenAssetPatterns.every(
    pattern => !pattern.matches(getDisplay(getMetadata(balance.balanceView))),
  );
