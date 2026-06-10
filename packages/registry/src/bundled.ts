import { Registry } from './registry';
import { allJsonRegistries } from './json';
import * as GlobalsJson from './data/globals.json';
import { RegistryGlobals } from './globals';

export class BundledClient {
  get(chainId: string): Registry {
    const jsonRegistry = allJsonRegistries[chainId];
    if (!jsonRegistry) {
      throw new Error(`Registry not found for ${chainId}`);
    }
    return new Registry(jsonRegistry);
  }

  globals(): RegistryGlobals {
    return new RegistryGlobals(GlobalsJson);
  }
}
