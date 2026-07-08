import { isAddress } from '@mizufinance/bech32m/shieldd';
import { Validation } from '../shared/validation-result';

export const shielddAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isAddress(addr),
  };
};
