import { PositionWithdraw } from '@mizufinance/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { shorten } from '@mizufinance/types/string';
import { bech32mPositionId } from '@mizufinance/bech32m/plpid';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';

export interface PositionWithdrawActionProps {
  value: PositionWithdraw;
}

export const PositionWithdrawAction = ({ value }: PositionWithdrawActionProps) => {
  return (
    <ActionWrapper
      title='Position Withdraw'
      infoRows={
        <>
          {value.positionId && (
            <ActionRow
              key='position-id'
              label='Position ID'
              info={shorten(bech32mPositionId(value.positionId), 8)}
              copyText={bech32mPositionId(value.positionId)}
            />
          )}
        </>
      }
    />
  );
};
