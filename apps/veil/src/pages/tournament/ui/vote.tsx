import { Metadata } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';
import { AssetIcon } from '@mizufinance/ui/AssetIcon';
import { Text } from '@mizufinance/ui/Text';
import { round } from '@mizufinance/types/round';

export interface VoteProps {
  asset: Metadata;
  percent: number;
  hideFor?: boolean;
}

export const Vote = ({ asset, percent, hideFor }: VoteProps) => {
  return (
    <div className='flex items-center gap-1'>
      <AssetIcon metadata={asset} />
      <Text smallTechnical color='text.primary'>
        {round({ value: percent * 100, decimals: 3 })}% {hideFor ? '' : 'for'}
      </Text>
      <Text smallTechnical color='text.secondary'>
        {asset.symbol}
      </Text>
    </div>
  );
};
