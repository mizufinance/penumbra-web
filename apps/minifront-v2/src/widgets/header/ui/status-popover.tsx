import { useMemo } from 'react';
import { Blocks } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Popover } from '@mizufinance/ui/Popover';
import { Button } from '@mizufinance/ui/Button';
import { Density } from '@mizufinance/ui/Density';
import { Pill } from '@mizufinance/ui/Pill';
import { Text } from '@mizufinance/ui/Text';
import { useStatusStore } from '@/shared/stores/store-context';

export const StatusPopover = observer(() => {
  const statusStore = useStatusStore();

  const pill = useMemo(() => {
    // Show error state if there's an error
    if (statusStore.hasConnectionError) {
      return <Pill context='technical-destructive'>Block Sync Error</Pill>;
    }

    // Show loading state if still loading and no sync status
    if (statusStore.loading && !statusStore.syncStatus) {
      return <Pill context='technical-caution'>Loading...</Pill>;
    }

    // Show synced state if fully synced
    if (statusStore.isSynced) {
      return <Pill context='technical-success'>Blocks Synced</Pill>;
    }

    // Show syncing state
    return <Pill context='technical-caution'>Block Syncing</Pill>;
  }, [
    statusStore.hasConnectionError,
    statusStore.loading,
    statusStore.syncStatus,
    statusStore.isSynced,
  ]);

  return (
    <Popover>
      <Popover.Trigger>
        <Button icon={Blocks} iconOnly>
          Status
        </Button>
      </Popover.Trigger>
      <Popover.Content align='end' side='bottom'>
        <Density compact>
          <div className='flex flex-col gap-4 text-text-primary'>
            <div className='flex flex-col gap-2'>
              <Text technical>Status</Text>
              {pill}
            </div>
            {statusStore.syncStatus && (
              <div className='flex flex-col gap-2'>
                <Text technical>Block Height</Text>
                <Pill context='technical-default'>
                  {statusStore.syncStatus.latestKnownBlockHeight !==
                  statusStore.syncStatus.syncHeight
                    ? `${statusStore.syncStatus.syncHeight.toLocaleString()}${statusStore.syncStatus.latestKnownBlockHeight ? ` of ${statusStore.syncStatus.latestKnownBlockHeight.toLocaleString()}` : ''}`
                    : `${statusStore.syncStatus.latestKnownBlockHeight.toLocaleString()}`}
                </Pill>
              </div>
            )}
            {statusStore.hasConnectionError && statusStore.currentError && (
              <div className='flex flex-col gap-2'>
                <Text technical>Error</Text>
                <Pill context='technical-destructive'>{statusStore.currentError.message}</Pill>
              </div>
            )}
          </div>
        </Density>
      </Popover.Content>
    </Popover>
  );
});
