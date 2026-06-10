import * as ShielddLocalDevnet from './data/chains/shieldd-local-devnet.json';
import { Base64AssetId, Chain, EntityMetadata } from './registry';

export interface JsonRegistry {
  chainId: string;
  ibcConnections: Chain[];
  assetById: Record<Base64AssetId, JsonMetadata>;
  numeraires: Base64AssetId[];
}

export interface JsonGlobals {
  rpcs: EntityMetadata[];
  frontendsV2: EntityMetadata[];
  stakingAssetId: { inner: string };
}

export interface JsonMetadata {
  description?: string;
  denomUnits: DenomUnit[];
  base: string;
  display: string;
  name?: string;
  symbol: string;
  shielddAssetId: { inner: string };
  images?: Image[];
  badges?: Image[];
}

interface DenomUnit {
  denom: string;
  exponent?: number;
}

interface Image {
  png?: string;
  svg?: string;
  theme?: {
    primaryColorHex?: string;
    circle?: boolean;
    darkMode?: boolean;
  };
}

export const allJsonRegistries: Record<string, JsonRegistry> = {
  'shieldd-local-devnet': ShielddLocalDevnet,
};
