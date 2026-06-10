import { useEffect, useMemo, useState } from 'react';

import { Link2Off } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { Popover } from '@mizufinance/ui/Popover';
import { Button } from '@mizufinance/ui/Button';
import { Density } from '@mizufinance/ui/Density';
import { Text } from '@mizufinance/ui/Text';
import { shieldd } from '@/shared/lib/shieldd';
import { ShielddManifest } from '@mizufinance/client';
import { useAppParametersStore } from '@/shared/stores/store-context';
import { useIsConnected } from '@/shared/hooks/use-connection';

const useShielddManifest = (): ShielddManifest | undefined => {
  const [manifest, setManifest] = useState<ShielddManifest>();

  useEffect(() => {
    setManifest(shieldd.manifest);
    const unsubscribe = shieldd.onConnectionStateChange(() => {
      setManifest(shieldd.manifest);
    });
    return unsubscribe;
  }, []);

  return manifest;
};

export const ProviderPopover = observer(() => {
  const manifest = useShielddManifest();
  const isConnected = useIsConnected();
  const appParametersStore = useAppParametersStore();

  const icon = useMemo(() => {
    const icons = manifest?.icons;
    const blob = icons?.['32'] ?? icons?.['128'];
    if (!blob) {
      return null;
    }

    return (
      <img
        src={URL.createObjectURL(blob)}
        alt={`${manifest?.name} Icon`}
        className='size-4 max-w-none grayscale'
      />
    );
  }, [manifest]);

  const disconnect = () => {
    void shieldd.disconnect().then(() => window.location.reload());
  };

  // If connected and have manifest, show the full popover
  if (isConnected && manifest) {
    const chainId = appParametersStore.chainId || 'shieldd-1';

    return (
      <Popover>
        <Popover.Trigger>
          <Button
            actionType='default'
            density='compact'
            iconOnly
            icon={() => icon}
            aria-label={`${manifest.name} - ${chainId}`}
          >
            {manifest.name}
          </Button>
        </Popover.Trigger>
        <Popover.Content align='end' side='bottom'>
          <Density compact>
            <div className='flex w-full min-w-[220px] flex-col gap-3'>
              <div className='flex flex-col gap-2'>
                <Text h4 color='text.primary'>
                  {manifest.name}
                </Text>
                <Text detail color='text.secondary'>
                  Chain: {chainId}
                </Text>
                <Text detail color='text.secondary'>
                  {manifest.description}
                </Text>
              </div>

              <Button onClick={disconnect} actionType='accent' icon={Link2Off}>
                Disconnect
              </Button>
            </div>
          </Density>
        </Popover.Content>
      </Popover>
    );
  }

  // If not connected, the router will handle showing the connection screen
  // This component should not render in that case
  return null;
});
