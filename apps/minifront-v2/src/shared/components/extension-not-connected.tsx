import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShielddClient,
  ShielddNotInstalledError,
  ShielddRequestFailure,
} from '@mizufinance/client';
import { shieldd } from '../lib/shieldd';
import { FallbackPage } from './fallback-page';

const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case ShielddRequestFailure.Denied:
        alert('Connection denied. You may need to un-ignore this site in your extension settings.');
        break;
      case ShielddRequestFailure.NeedsLogin:
        alert('Not logged in. Please login into the extension and reload the page.');
        break;
      default:
        alert(`Connection error: ${e.message}`);
    }
  } else {
    console.warn('Unknown connection failure', e);
    alert(`Unknown connection failure: ${String(e)}`);
  }
};

export const ExtensionNotConnected = () => {
  const [result, setResult] = useState<boolean>();
  const navigate = useNavigate();

  const connect = async (provider: string) => {
    try {
      await shieldd.connect(provider);
      navigate(0);
    } catch (e) {
      handleErr(e);
    } finally {
      setResult(true);
    }
  };

  const checkProviders = () => {
    const providers = ShielddClient.getProviders();
    const length = Object.keys(providers).length;
    const first = Object.keys(providers)[0];

    if (length === 1 && first) {
      void connect(first);
    } else if (length > 1) {
      // For simplicity, connect to first provider
      // TODO: Add provider selection dialog
      void connect(first!);
    } else {
      throw new ShielddNotInstalledError();
    }
  };

  const handleButtonClick = () => {
    if (!result) {
      checkProviders();
    } else {
      location.reload();
    }
  };

  return (
    <FallbackPage
      title='Welcome to Shieldd'
      description='Connect to Minifront to view your balances, transfer funds, stake UM, and more.'
      buttonText={!result ? 'Connect Wallet' : 'Reload'}
      onButtonClick={handleButtonClick}
    />
  );
};
