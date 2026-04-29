import { AssetId } from '@mizufinance/protobuf/penumbra/core/asset/v1/asset_pb';

export interface BlockProcessorInterface {
  sync(): Promise<void>;
  stop(r?: string): void;
  setNumeraires(numeraires: AssetId[]): void;
}
