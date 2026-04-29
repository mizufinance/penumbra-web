import { readFile } from 'node:fs/promises';

const originalFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = async (input, init) => {
  const url =
    input instanceof URL
      ? input
      : typeof input === 'string'
        ? new URL(input, import.meta.url)
        : undefined;

  if (url?.protocol === 'file:') {
    const bytes = await readFile(url);
    return new Response(bytes, {
      headers: {
        'content-type': 'application/wasm',
      },
    });
  }

  return originalFetch(input, init);
};
