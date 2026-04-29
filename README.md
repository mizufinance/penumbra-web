# Penumbra Web

The Mizufinance Penumbra monorepo for all things web.

![ci status](https://github.com/mizufinance/penumbra-web/actions/workflows/turbo-ci.yml/badge.svg?branch=main)

This is a monolithic repository of Penumbra web code, a monorepo. Multiple apps,
internal packages, and published packages are developed in this repository, to
simplify work and make broad cross-package changes more feasible.

To participate in the test network, use a browser extension like
[Prax](https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe)
from the Chrome Web Store.

You can talk to us on [Discord](https://discord.gg/hKvkrqa3zC).

## You might be looking for examples

### [`@mizufinance/client` nextjs example](https://github.com/mizufinance/nextjs-penumbra-client-example)

### [`@mizufinance/wasm` nextjs example](https://github.com/mizufinance/nextjs-penumbra-wasm-example)

## What's in here

### [Minifront](./apps/minifront): Dapp to swap, stake, and send on the Penumbra testnet.

### [Status](./apps/node-status): Public info dashboard for Penumbra nodes.

### Published Packages

All have a `@mizufinance/` namespace prefix on npm.

**🌘
[bech32m](https://www.npmjs.com/package/@mizufinance/bech32m) 🌑
[client](https://www.npmjs.com/package/@mizufinance/client) 🌑
[constants](https://www.npmjs.com/package/@mizufinance/constants) 🌑
[crypto](https://www.npmjs.com/package/@mizufinance/crypto) 🌑
[getters](https://www.npmjs.com/package/@mizufinance/getters) 🌑
[keys](https://www.npmjs.com/package/@mizufinance/keys) 🌑
[perspective](https://www.npmjs.com/package/@mizufinance/perspective) 🌑
[protobuf](https://www.npmjs.com/package/@mizufinance/protobuf) 🌑
[services](https://www.npmjs.com/package/@mizufinance/services) 🌑
[services-context](https://www.npmjs.com/package/@mizufinance/services-context) 🌑
[storage](https://www.npmjs.com/package/@mizufinance/storage) 🌑
[transport-chrome](https://www.npmjs.com/package/@mizufinance/transport-chrome) 🌑
[transport-dom](https://www.npmjs.com/package/@mizufinance/transport-dom) 🌑
[types](https://www.npmjs.com/package/@mizufinance/types) 🌑
[wasm](https://www.npmjs.com/package/@mizufinance/wasm)
🌒**

## Documentation

General documentation is available in [docs/README.md](docs/README.md). Package-specific documentation is available in each respective package.

## Getting Started

### Prerequisites

Make sure you have the following tools installed:

- [Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) – Recommended via [rustup](https://rustup.rs/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) – For building WebAssembly components
- [cargo-watch](https://crates.io/crates/cargo-watch) – Utility that automatically rebuilds and restarts your project.
- [Node.js](https://nodejs.org/en/download/package-manager) – Recommended via [nvm](https://github.com/nvm-sh/nvm)
- [pnpm](https://pnpm.io/installation) – Package manager, recommended via [corepack](https://pnpm.io/installation#using-corepack)
- Google Chrome installation

### Building

#### Install all workspace dependencies:

```sh
git clone https://github.com/mizufinance/penumbra-web
cd penumbra-web
pnpm install
```

#### Build shared packages and watch for changes:

```sh
pnpm build && pnpm dev:pack
```

#### In a new terminal, run the minifront app:

```sh
cd apps/minifront
pnpm dev:build && pnpm dev:app
```

#### Alternatively, in a new terminal, run the veil app:

```sh
cd apps/veil
pnpm install && pnpm dev
```

You now have a local copy of Minifront available at
[`https://localhost:5173`](https://localhost:5173) or Veil available at [`https://localhost:3000`](https://localhost:3000).

Minifront and Veil will hot-reload.

## Security

If you believe you've found a security-related issue with Penumbra,
please disclose responsibly through Mizufinance's normal security channel.
