import { ValidatorInfo } from '@mizufinance/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { TableCell, TableRow } from '@mizufinance/ui-deprecated/components/ui/table';
import { ReactNode } from 'react';
import { Oval } from 'react-loader-spinner';
import { getValidator } from '@mizufinance/getters/validator-info';
import { calculateCommissionAsPercentage } from '@mizufinance/types/staking';

export const ValidatorInfoRow = ({
  loading,
  validatorInfo,
  votingPowerByValidatorInfo,
  staking,
}: {
  loading: boolean;
  validatorInfo: ValidatorInfo;
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;
  staking: ReactNode;
}) => (
  <TableRow>
    <TableCell>{getValidator(validatorInfo).name}</TableCell>
    <TableCell>
      {loading ? (
        <Oval width={16} height={16} color='white' secondaryColor='white' />
      ) : (
        `${votingPowerByValidatorInfo.get(validatorInfo)}%`
      )}
    </TableCell>

    <TableCell>{calculateCommissionAsPercentage(validatorInfo)}%</TableCell>

    <TableCell>{staking}</TableCell>
  </TableRow>
);
