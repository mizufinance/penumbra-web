import { Metadata } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { createGetter } from './utils/create-getter.js';

export const getAssetId = createGetter((metadata?: Metadata) => metadata?.shielddAssetId);

/**
 * Returns the exponent for a given asset type's display denom unit, given that
 * denom's metadata.
 *
 * `Metadata`s have an array of `DenomUnit`s, describing the exponent of
 * each denomination in relation to the base unit. For example, ushieldd is
 * shieldd's base unit -- the unit which can not be further divided into
 * decimals. 1 shieldd is equal to 1,000,000 (AKA, 10 to the 6th) ushieldd, so
 * shieldd's display exponent -- the exponent used to multiply the base unit
 * when displaying a shieldd value to a user -- is 6. (For a non-crypto
 * example, think of US dollars. The dollar is the display unit; the cent is the
 * base unit; the display exponent is 2 (10 to the 2nd).)
 */
export const getDisplayDenomExponent = createGetter(
  (metadata?: Metadata) =>
    metadata?.denomUnits.find(denomUnit => denomUnit.denom === metadata.display)?.exponent,
);

export const getDisplay = createGetter((metadata?: Metadata) => metadata?.display);

export const getSymbol = createGetter((metadata?: Metadata) => metadata?.symbol);
