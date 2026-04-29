import initWasm from '../wasm/index.js';

let initPromise: Promise<unknown> | undefined;

export const ensureWasmInitialized = async (): Promise<void> => {
  initPromise ??= initWasm({ module_or_path: new URL('../wasm/index_bg.wasm', import.meta.url) });
  await initPromise;
};
