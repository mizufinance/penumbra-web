import { useMemo } from 'react';
import { Blocks } from 'lucide-react';
import { Popover } from '@mizufinance/ui/Popover';
import { Button } from '@mizufinance/ui/Button';
import { Density } from '@mizufinance/ui/Density';
import { Pill } from '@mizufinance/ui/Pill';
import { Text } from '@mizufinance/ui/Text';
import { statusStore } from '@/shared/model/status';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';

export const StatusPopover = observer(() => {
  const { loading, error, syncing, fullSyncHeight, latestKnownBlockHeight } = statusStore;

  // a ReactNode displaying the sync status in form of a pill
  const pill = useMemo(() => {
    if (error) {
      return <Pill context='technical-destructive'>Block Sync Error</Pill>;
    }

    if (loading) {
      return <Pill context='technical-caution'>Loading...</Pill>;
    }

    if (!syncing) {
      return <Pill context='technical-success'>Blocks Synced</Pill>;
    }

    return <Pill context='technical-caution'>Block Syncing</Pill>;
  }, [error, loading, syncing]);

  if (!connectionStore.connected) {
    return null;
  }

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
              {error}
            </div>
            {!loading && (
              <div className='flex flex-col gap-2'>
                <Text technical>Block Height</Text>
                <Pill context='technical-default'>
                  {latestKnownBlockHeight !== fullSyncHeight
                    ? `${fullSyncHeight}${latestKnownBlockHeight ? ` of ${latestKnownBlockHeight}` : ''}`
                    : `${latestKnownBlockHeight}`}
                </Pill>
              </div>
            )}
          </div>
        </Density>
      </Popover.Content>
    </Popover>
  );
});
