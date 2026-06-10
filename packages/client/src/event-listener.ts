import { ShielddEventTypeName, ShielddEvent } from './event.js';

// like EventListener, but restricts possible event types
interface SpecificEventListener<T extends Event> extends EventListener {
  (evt: T): void;
}
// like EventTarget, but restricts possible event types
interface SpecificEventTarget<SpecificTypeName extends string, SpecificEvent extends Event = Event>
  extends EventTarget {
  addEventListener: (
    type: SpecificTypeName,
    listener: SpecificEventListener<SpecificEvent> | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) => void;
  removeEventListener: (
    type: SpecificTypeName,
    listener: SpecificEventListener<SpecificEvent> | EventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) => void;
  dispatchEvent: (event: SpecificEvent) => boolean;
}

// custom event listener
export type ShielddEventListener<T extends ShielddEventTypeName = ShielddEventTypeName> =
  SpecificEventListener<ShielddEvent<T>>;

// event target with private dispatch
export type ShielddEventTarget<T extends ShielddEventTypeName = ShielddEventTypeName> = Omit<
  SpecificEventTarget<T, ShielddEvent<T>>,
  'dispatchEvent'
>;
