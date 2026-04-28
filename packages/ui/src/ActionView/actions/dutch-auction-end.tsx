import { UnknownAction } from './unknown';
import { ActionDutchAuctionEnd } from '@mizufinance/protobuf/penumbra/core/component/auction/v1/auction_pb';

export interface DutchAuctionEndActionProps {
  value: ActionDutchAuctionEnd;
}

export const DutchAuctionEndAction = (_: DutchAuctionEndActionProps) => {
  return <UnknownAction label='Dutch Auction End' opaque={false} />;
};
