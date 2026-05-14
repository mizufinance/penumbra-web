import { Address } from '@mizufinance/protobuf/penumbra/core/keys/v1/keys_pb'

import {
  decodeOrbisUploadBundle as decodeBundleWasm,
  deriveComplianceScalarForAddress,
} from '../wasm/index.js'
import { ensureWasmInitialized } from './init.js'

export interface OrbisUploadPackage {
  ring_id: string
  policy_id: string
  resource: string
  permission: string
  tier_label: string
  timestamp: number
  salt: string
  encrypted_document: number[] | Uint8Array
  enc_cmt: number[] | Uint8Array
  shared_point: number[] | Uint8Array
  challenge: number[] | Uint8Array
  response: number[] | Uint8Array
  orbis_challenge: number[] | Uint8Array
  orbis_response: number[] | Uint8Array
  derived_pk: number[] | Uint8Array
  metadata_hash: number[] | Uint8Array
}

export interface OrbisUploadBundle {
  sender_core: OrbisUploadPackage
  sender_ext: OrbisUploadPackage
  output_core: OrbisUploadPackage
  output_ext: OrbisUploadPackage
}

export const deriveComplianceScalar = async (
  address: Address
): Promise<Uint8Array> => {
  await ensureWasmInitialized()
  return deriveComplianceScalarForAddress(address.toBinary())
}

export const decodeOrbisUploadBundle = async (
  bundle: Uint8Array
): Promise<OrbisUploadBundle> => {
  await ensureWasmInitialized()
  return decodeBundleWasm(bundle) as OrbisUploadBundle
}
