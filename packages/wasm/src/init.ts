import initWasm from '../wasm/index.js';

let initPromise: Promise<unknown> | undefined;

export const ensureWasmInitialized = async (): Promise<void> => {
  initPromise ??= initWasm();
  await initPromise;
};
