# ADR 006: Client package API

Shieldd's web repository is growing fast. As more applications use its packages, introducing new changes will become increasingly difficult. This document aims to define what and how the packages should export and set the path for growth. However, the implementation of the APIs is not within the scope of this document.

Benefits for the ecosystem: A decreased entry level in Shieldd development leads to more created applications and faster mass adoption.

Benefits for Shieldd developers: API specifications aim to align the vision for package development and simplify the decision-making process when creating new features for external use.

## Design for dApp makers

**dApp makers** are developers of applications that connect to Shieldd account: transaction explorers, DEXes, payment systems, etc. They are interested in rapid development based on existing solutions and are often new not only to Shieldd but to blockchain as a whole. These developers need client-side libraries for wallet connection, data requests and data rendering.

When developing a web application for communicating with the Shieldd blockchain, dApp makers might need the following features:

- Identify available Shieldd connections
- Connect to Shieldd
- Disconnect from Shieldd
- Monitor the connection
- Fetch private information about the user
- Fetch public information about the chain
- Get real-time updates about the account and new blocks
- Create, authorize, and publish Shieldd transactions
- Create, authorize, and publish IBC transactions
- Verify transaction appearance on the chain
- Estimate transaction costs
- Trade and swap assets, provide liquidity
- Stake assets with validators
- Participate in governance

These features are available through API described and presented here.

## Client concepts

In public-state blockchains, web toolkits usually split the interface into at least two parts:

1. the wallet, keys, metadata (small, local, private)
2. the chain, viewing transactions (large, remote, public)

Examples include [Viem](https://viem.sh/docs/clients/intro) and [Thirdweb](https://portal.thirdweb.com/typescript/v5/client) on Ethereum.

This distinction works well when there is a clear separation between the client and the server.

But in Shieldd, the user is running a local node with a local copy of the chain. Instead of speaking to a remote server, a server is running directly in the user's web browser. This local 'light node' on the webpage is queryable with the same API as a remote 'full node', except the protocol is not `https`.

An additional pair of services (the `ViewService` and the `CustodyService`) are available on the local node, and represent the API to the private chain state.

## Client brief

It is reasonable to construct the notion of a **client** – the interface that manages connections and provides methods for interacting with the blockchain.

Creating the `ShielddClient` should be the starting point for any application working with Shieldd. A simple example:

```ts
import { ShielddClient } from '@mizufinance/client';
import { ViewService } from '@mizufinance/protobuf';

const providers: Record<string, ShielddProvider> = ShielddClient.getProviders();
const someProviderOrigin: keyof providers = /* choose a provider */

const shieldd = createShielddClient(someProviderOrigin);
await shieldd.connect(); // the user must approve a connection

const address0 = shieldd.service(ViewService).getAddressByIndex({ account: 0 })
```

The flow of work with the `ShielddClient` would be as follows:

- Developer uses static methods of `ShielddClient` to identify and choose a provider.
- Developer creates an instance of `ShielddClient` to encapsulate configuration and connection state.
- The `ShielddClient` instance establishes and manages the connection.

At this point, the developer may begin interacting with the public chain or the user's private state.

- The developer creates service-specific clients with the `service` method
- The service clients may query the service API endpoints to fetch information

These steps are evident above.

## `ShielddProvider` interface

Any user may have one or multiple tools present that independently offer some kind of Shieldd service. These independent software are called "providers". For example, Prax browser extension is a provider.

You can interact with providers directly, but it is recommended to use `ShielddClient`.

Providers should identify themselves by origin URI, typically a chrome extension URI, and expose a simple `ShielddProvider` API to initiate connection.

Available providers may be discovered by a record on the document at `window[Symbol.for('shieldd')]`, of the type `Record<string, ShielddProvider>` where the key is a URI origin at which the provider's manifest is hosted.

```ts
export interface ShielddProvider {
  /** Should contain a URI at the provider's origin, serving a manifest
   * describing this provider. */
  readonly manifest: string;

  /** Call to acquire a `MessagePort` to this provider, subject to approval. */
  readonly connect: () => Promise<MessagePort>;

  /** Call to indicate the provider should discard approval of this dapp. */
  readonly disconnect: () => Promise<void>;

  /** `true` indicates active connection, `false` indicates inactive connection. */
  readonly isConnected: () => boolean;

  /** Synchronously return present state. */
  readonly state: () => ShielddState;

  /**
   * Like a standard `EventTarget.addEventListener`, but providers should only
   * emit `ShielddEvent`s (currently only `ShielddStateEvent` with typename
   * `'shielddstate'`.)  Event types and type guards are available from
   * `@mizufinance/client/event` or the root export.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  readonly addEventListener: ShielddEventTarget['addEventListener'];
  readonly removeEventListener: ShielddEventTarget['addEventListener'];
}
```

## `ShielddClient` interface

`ShielddClient` is intended to be the 'entry' to the collection of service APIs for dapp developers inspecting or interacting with a user's Shieldd chain state.

ShielddClient static methods will allow you to

- inspect available providers
- verify the provider is present
- choose a provider to connect

If you're developing a dapp using shieldd, you should likely:

- display a button to initiate connection, if no providers are connected
- display a modal choice, if multiple providers are present
- gate shieldd features, if no providers are installed

When you've selected a provider, you can provide its origin URI to `createShielddClient`, or `new ShielddClient`. This will create a client attached to that provider, and you can then:

- request permission to connect and create an active connection with `connect`
- access the provider's services with `service` and a `ServiceType` parameter
- release your permissions with `disconnect`

As an alternative, you can create an unconfigured client with empty state by calling `createShielddClient` with no arguments and then provide the origin URI to the `connect` method.

### Static features

Methods for inspecting providers without interaction are provided as static class members. None of these static methods will modify any provider state.

```ts
export declare class ShielddClient {
  /** Return the record of all present providers available in the page. */
  static getProviders(): Record<string, ShielddProvider>;

  /** Return a record of all present providers, and fetch their manifests. */
  static getAllProviderManifests(): Record<string, Promise<ShielddManifest>>;

  /** Fetch manifest of a specific provider, or return `undefined` if the
   * provider is not present. */
  static getProviderManifest(providerOrigin: string): Promise<ShielddManifest> | undefined;

  /** Return boolean connection state of a specific provider, or `undefined` if
   * the provider is not present. */
  static isProviderConnected(providerOrigin: string): boolean | undefined;

  /** Return connection state enum of a specific provider, or `undefined` if the
   * provider is not present. */
  static getProviderState(providerOrigin: string): ShielddState | undefined;
}
```

### Instance features

After selecting a provider, you can use `createShielddClient` or the constructor to create an instance of `ShielddClient` attached to your selected provider. The instance allows you to engage in more detail and begin state manipulation.

```ts
export declare class ShielddClient {
  /** Construct a client instance but take no specific action. Will immediately
   * attach to a specified provider, or remain unconfigured. */
  constructor(providerOrigin?: string | undefined, options?: ShielddClientOptions);

  /** Attempt to connect to the attached provider. If this client is unattached,
   * a provider may be specified at this moment.
   *
   * May reject with an enumerated `ShielddRequestFailure`.
   *
   * The public `connected` field will report the provider's connected state, or
   * `undefined` if this client is not attached to a provider. The public
   * `transport` field can confirm the client possesses an active connection.
   *
   * If called again while already connected, `connect` is a no-op.
   */
  connect(providerOrigin?: string): Promise<void>;

  /** Call `disconnect` on the associated provider to release connection
   * approval, and destroy any present connection. */
  disconnect(): Promise<void>;

  /** Return a `PromiseClient<T>` for some `T extends ServiceType`, using this
   * client's internal `Transport`.
   *
   * If you call this method while this client is not `Connected`, this method
   * will throw.
   */
  service<T extends ServiceType>(service: T): PromiseClient<T>;

  /** Simplified callback interface to the `EventTarget` interface of the
   * associated provider. */
  onConnectionStateChange(
    listener: (detail: ShielddEventDetail<'shielddstate'>) => void,
    removeListener?: AbortSignal,
  ): void;

  /**
   * It is recommended to construct clients with a specific provider origin. If
   * you didn't do that, and you're working with an unconfigured client, you can
   * configure it with `attach`.
   *
   * A client may only be attached once. A client must be attached to connect.
   *
   * Presence of the public `origin` field can confirm a client instance is
   * attached to a provider, and presence of the public `manifest` field can
   * confirm the attached provider served an appropriate manifest. You may await
   * manifest confirmation by awaiting the return of `attach`.
   *
   * If called again with a matching provider, `attach` is a no-op. If called
   * again with a different provider, `attach` will throw.
   */
  attach(providerOrigin: string): Promise<ShielddManifest>;

  /** The parsed `ShielddManifest` associated with this provider, fetched at
   * time of provider attach. This will be `undefined` if this client is not
   * attached to a provider, or if the manifest fetch has not yet resolved.
   *
   * If you have awaited the return of `attach` or `connect`, this should be
   * present.
   */
  get manifest(): ShielddManifest | undefined;

  /** The provider origin URI, or `undefined` if this client is not attached. */
  get origin(): string | undefined;
  /** The attached provider, or `undefined` if this client is not attached. */
  get provider(): ShielddProvider | undefined;
  /** The boolean provider connection status, or `undefined` if this client is
   * not attached to a provider. */
  get connected(): boolean | undefined;
  /** The `ShielddState` enumerated provider connection state, or `undefined` if
   * this client is not attached to a provider. */
  get state(): ShielddState | undefined;
}
```

### Service client features

The service-specific clients returned by the `service` method are generated from Protobuf specifications which are compiled into `ServiceType` definitions that may be imported from `@mizufinance/protobuf`. Your IDE should provide type introspection on the `ServiceType`, and on the returned `PromiseClient`.

It's recommended to read [ConnectRPC Web](https://connectrpc.com/docs/web/) documentation for general details of client use.

Shieldd's proto specs are published to the Buf Schema Registry at [buf.build/mizufinance/shieldd](https://buf.build/mizufinance/shieldd). You are likely interested in the [View service](https://buf.build/mizufinance/shieldd/docs/main:shieldd.view.v1) and the [Custody service](https://buf.build/mizufinance/shieldd/docs/main:shieldd.custody.v1) API docs.

Web developers will be interested in the documentation of `@mizufinance/client` (discussed in this ADR) and `@mizufinance/react`.

The `@mizufinance/protobuf` package exports several services, but technically, the `ShielddClient` interface is flexible enough that a provider could implement and provide any service they wish. Documentation on any uniquely available services should be sought from the developers of the provider.

