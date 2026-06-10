import { BundledClient } from './bundled';

export class ChainRegistryClient {
  public readonly bundled: BundledClient;

  constructor() {
    this.bundled = new BundledClient();
  }
}
