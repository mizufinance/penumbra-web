import { ShielddState } from './state.js';

// custom event utility types
export type ShielddEventTypeName = 'shielddstate'; // may eventually contain more members
export type ShielddEventDetail<T extends ShielddEventTypeName> = {
  shielddstate: {
    origin: string;
    state: ShielddState;
  };
}[T];

// custom event type
export type ShielddEvent<T extends ShielddEventTypeName> = CustomEvent<ShielddEventDetail<T>>;

// custom event tools
export const createShielddStateEvent = (shielddOrigin: string, shielddState: ShielddState) =>
  new CustomEvent('shielddstate', {
    detail: {
      origin: shielddOrigin,
      state: shielddState,
    },
  }) satisfies ShielddEvent<'shielddstate'>;

// custom event type guards
/** Type guard for `ShielddStateEvent`. The `restrictOrigin` parameter is purely
 * informational - anyone may create an event with any origin label. */
export const isShielddStateEvent = (
  evt: unknown,
  restrictOrigin?: string,
): evt is ShielddEvent<'shielddstate'> =>
  evt instanceof CustomEvent && isShielddStateEventDetail(evt.detail, restrictOrigin);

export const isShielddStateEventDetail = (
  detail: unknown,
  restrictOrigin?: string,
): detail is ShielddEventDetail<'shielddstate'> =>
  typeof detail === 'object' &&
  detail !== null &&
  'origin' in detail &&
  typeof detail.origin === 'string' &&
  (!restrictOrigin || detail.origin === restrictOrigin) &&
  'state' in detail &&
  typeof detail.state === 'string' &&
  Object.keys(ShielddState).includes(detail.state);
