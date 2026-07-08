import { ViewService } from '@mizufinance/protobuf';
import { shieldd } from '../shieldd';
import { CallOptions } from '@connectrpc/connect';
import { PlainMessage, toPlainMessage } from '@bufbuild/protobuf';
import {
  StatusResponse,
  StatusStreamResponse,
} from '@mizufinance/protobuf/shieldd/view/v1/view_pb';

export const getInitialStatus = async (opt?: CallOptions): Promise<PlainMessage<StatusResponse>> =>
  toPlainMessage(await shieldd.service(ViewService).status({}, opt));

/**
 * Stream status updates. Default timeout of 15 seconds unless specified.
 *
 * @param opt connectrpc call options
 */
export async function* getStatusStream(
  opt?: CallOptions,
): AsyncGenerator<PlainMessage<StatusStreamResponse>> {
  for await (const item of shieldd
    .service(ViewService)
    .statusStream({}, { timeoutMs: 60_000, ...opt })) {
    yield toPlainMessage(item);
  }
}
