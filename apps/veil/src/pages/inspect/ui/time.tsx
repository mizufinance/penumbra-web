import { Text } from '@mizufinance/ui/Text';
import { Tooltip } from '@mizufinance/ui/Tooltip';

export const TimeDisplay = ({ dateStr, height }: { dateStr: string; height: number }) => {
  const localDate = new Date(dateStr);
  const utcDate = localDate.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  });

  return (
    <div className='flex flex-col items-center justify-center'>
      <Text small color='text.secondary'>
        Block #{height}
      </Text>
      <Tooltip message={utcDate}>
        <Text small color='text.secondary'>
          {localDate.toLocaleString()}
        </Text>
      </Tooltip>
    </div>
  );
};
