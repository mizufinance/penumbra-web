import { createShielddClient, ShielddClient } from '@mizufinance/client';

export const shieldd = createShielddClient();

const reconnect = async () => {
  const providers = ShielddClient.getProviders();
  const connected = Object.keys(providers).find(origin =>
    ShielddClient.isProviderConnected(origin),
  );
  if (!connected) {
    return;
  }
  try {
    await shieldd.connect(connected);
  } catch (error) {
    /* no-op */
  }
};
void reconnect();
