import { SplashPage } from '@mizufinance/ui-deprecated/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';
import { Button } from '@mizufinance/ui-deprecated/components/ui/button';

export const ExtensionTransportDisconnected = () => {
  return (
    <>
      <HeadTag />
      <SplashPage title='Shieldd disconnected'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>
            Communication with your Shieldd extension has been interrupted. Reloading the page may
            re-establish the conneciton.
          </div>
          <Button variant='gradient' onClick={() => location.reload()}>
            Reload
          </Button>
        </div>
      </SplashPage>
    </>
  );
};
