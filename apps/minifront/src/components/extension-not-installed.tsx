import { Button } from '@mizufinance/ui-deprecated/components/ui/button';
import { SplashPage } from '@mizufinance/ui-deprecated/components/ui/splash-page';
import { HeadTag } from './metadata/head-tag';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const ExtensionNotInstalled = () => {
  return (
    <>
      <HeadTag />
      <SplashPage title='Welcome to Shieldd'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          To get started, install a Shieldd extension.
          <Button asChild variant='gradient'>
            <a
              href={`https://chrome.google.com/webstore/detail/shieldd-wallet/${CHROME_EXTENSION_ID}`}
              target='_blank'
              rel='noreferrer'
            >
              Install Prax
            </a>
          </Button>
        </div>
      </SplashPage>
    </>
  );
};
