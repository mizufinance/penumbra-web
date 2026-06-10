export enum ShielddRequestFailure {
  Denied = 'Denied',
  NeedsLogin = 'NeedsLogin',
  BadResponse = 'BadResponse',
  NotHandled = 'NotHandled',
}

export class ShielddProviderNotAvailableError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions) {
    super(`Shieldd provider ${providerOrigin} is not available`, opts);
    this.name = 'ShielddProviderNotAvailableError';
  }
}

export class ShielddProviderNotConnectedError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions) {
    super(`Shieldd provider ${providerOrigin} is not connected`, opts);
    this.name = 'ShielddProviderNotConnectedError';
  }
}

export class ShielddProviderRequestError extends Error {
  constructor(providerOrigin?: string, opts?: ErrorOptions & { cause: ShielddRequestFailure }) {
    super(`Shieldd provider ${providerOrigin} did not approve request`, opts);
    this.name = 'ShielddProviderRequestError';
  }
}
export class ShielddNotInstalledError extends Error {
  constructor(
    message = "Shieldd global `window[Symbol.for('shieldd')]` is not present.",
    opts?: ErrorOptions,
  ) {
    super(message, opts);
    this.name = 'ShielddNotInstalledError';
  }
}
