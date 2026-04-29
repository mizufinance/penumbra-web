import { buttonVariants } from '@mizufinance/ui-deprecated/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@mizufinance/ui-deprecated/components/ui/tooltip';
import { cn } from '@mizufinance/ui-deprecated/lib/utils';

export const EstimateButton = ({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          // Style as a button
          className={cn('w-full', buttonVariants({ variant: 'secondary', size: 'sm' }))}
          onClick={e => {
            e.preventDefault();
            onClick();
          }}
          disabled={disabled}
        >
          Estimate
        </TooltipTrigger>
        <TooltipContent side='bottom' className='w-60'>
          <p>
            Privacy note: This makes a request to your config&apos;s gRPC node to simulate a swap of
            these assets. That means you are possibly revealing your intent to this node.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
