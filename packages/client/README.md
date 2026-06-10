# `@mizufinance/client`

This package allows developers to create dApps that connect to Shieldd providers and query the Shieldd blockchain.

You can check this package in action in the [NextJS example repo](https://github.com/mizufinance/nextjs-shieldd-client-example) or read the [Architecture Decision Record (ADR-006)](https://github.com/mizufinance/shieldd/blob/main/docs/adrs/006-web-apis.md) describing the idea behind this package.

## A simple example

```ts
import { ShielddClient } from '@mizufinance/client';
import { ViewService } from '@mizufinance/protobuf';

const shieldd = createShielddClient();

// Get the `Record<string, ShielddProvider>` – an object with keys as
// provider origin URIs and values as ShielddProvider instances.
const providers = ShielddClient.getProviders();

// Choose a provider to connect to
const someProviderOrigin: keyof providers = Object.keys(providers)[0];

// Get the provider's manifest – info about this provider with name, description, icons, etc.
const manifest = await shieldd.getProviderManifest(someProviderOrigin);
console.log(manifest.name); // e.g. "Prax wallet"

// Connect to the provider – user must approve the origin
await shieldd.connect(someProviderOrigin);

// Get a view service – a private query service to access the user's data from the provider
const address0 = shieldd.service(ViewService).getAddressByIndex({ account: 0 });
```
