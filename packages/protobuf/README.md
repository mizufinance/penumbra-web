# `@mizufinance/protobuf`

This package exports protobuf message types generated with `@bufbuild` intended
for use with other `@mizufinance` packages.

## If you are looking for a Shieldd client

You should install `@mizufinance/client`.

### Other Exports

This package exports a `typeRegistry` (and `jsonOptions` including said
registry) for use with `createChannelTransport` of
`@mizufinance/transport-dom` or any `@connectrpc` transport.

All types necessary for a to serialize/deserialize communication with Prax or
any other Shieldd provider are included.

Service definitions for all relevant Shieldd services, and some related Cosmos
definitions are exported.

### A Simple example

```js
import { jsonOptions } from '@mizufinance/protobuf';
import { createChannelTransport } from '@mizufinance/transport-dom';

// naively get first available provider
const provider = Object.values(window[Symbol.for('shieldd')])[0];

// establish a transport
const transport = createChannelTransport({ jsonOptions, getPort: provider.connect });

// export function to create client
export const createShielddClient = serviceType => createPromiseClient(serviceType, transport);
```
