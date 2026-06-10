import { FallbackPage } from './fallback-page';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const ExtensionNotInstalled = () => {
  const openInstallPage = () => {
    window.open(
      `https://chrome.google.com/webstore/detail/shieldd-wallet/${CHROME_EXTENSION_ID}`,
      '_blank',
      'noreferrer',
    );
  };

  return (
    <FallbackPage
      title='Welcome to Shieldd'
      description='To get started, install Prax, the default Shieldd wallet in your browser.'
      buttonText='Install Prax'
      onButtonClick={openInstallPage}
    />
  );
};
