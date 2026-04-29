import { isAddress } from '@mizufinance/bech32m/penumbra';
import { Validation } from '../shared/validation-result';

export const penumbraAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isAddress(addr),
  };
};
