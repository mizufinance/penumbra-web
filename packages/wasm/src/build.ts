import {
  Action,
  AuthorizationData,
  Transaction,
  TransactionPlan,
  WitnessData,
} from '@mizufinance/protobuf/shieldd/core/transaction/v1/transaction_pb';
import type { StateCommitmentTree } from '@mizufinance/types/state-commitment-tree';
import {
  authorize,
  build_action_proof_request,
  build_action_with_proof_result,
  build_parallel,
  witness,
} from '../wasm/index.js';
import { FullViewingKey, SpendKey } from '@mizufinance/protobuf/shieldd/core/keys/v1/keys_pb';
import { ensureWasmInitialized } from './init.js';

interface ProofRequest {
  family: string;
  witness: number[] | Uint8Array;
}

interface ProverResponse {
  proof?: string;
  result?: string;
  error?: string;
}

export interface BuildActionOptions {
  proverUrl: string;
}

export const authorizePlan = async (
  spendKey: SpendKey,
  txPlan: TransactionPlan,
): Promise<AuthorizationData> => {
  await ensureWasmInitialized();
  const result = authorize(spendKey.toBinary(), txPlan.toBinary());
  return AuthorizationData.fromBinary(result);
};

export const getWitness = async (
  txPlan: TransactionPlan,
  sct: StateCommitmentTree,
): Promise<WitnessData> => {
  await ensureWasmInitialized();
  const result = witness(txPlan.toBinary(), sct);
  return WitnessData.fromBinary(result);
};

export const buildParallel = async (
  batchActions: Action[],
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  authData: AuthorizationData,
): Promise<Transaction> => {
  await ensureWasmInitialized();
  const result = build_parallel(
    batchActions.map(action => Array.from(action.toBinary())),
    txPlan.toBinary(),
    witnessData.toBinary(),
    authData.toBinary(),
  );
  return Transaction.fromBinary(result);
};

export const buildActionParallel = async (
  txPlan: TransactionPlan,
  witnessData: WitnessData,
  fullViewingKey: FullViewingKey,
  actionId: number,
  options: BuildActionOptions,
): Promise<Action> => {
  await ensureWasmInitialized();
  if (!options.proverUrl) {
    throw new Error('Shieldd prover URL is required for browser transaction building');
  }

  const actionPlan = txPlan.actions[actionId];
  if (!actionPlan?.action.case) {
    throw new Error('No action key provided');
  }

  const proofRequest = build_action_proof_request(
    txPlan.toBinary(),
    actionPlan.toBinary(),
    fullViewingKey.toBinary(),
    witnessData.toBinary(),
  ) as ProofRequest;
  const response = await fetch(proverEndpoint(options.proverUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      family: proofRequest.family,
      witness: bytesToBase64(toUint8Array(proofRequest.witness)),
    }),
  });
  const body = (await response.json().catch(() => ({}))) as ProverResponse;
  if (!response.ok || body.error) {
    throw new Error(body.error ?? `Shieldd prover failed with HTTP ${response.status}`);
  }
  const proofResult = body.result ?? body.proof;
  if (!proofResult) {
    throw new Error('Shieldd prover response did not include a proof result');
  }

  const result = build_action_with_proof_result(
    txPlan.toBinary(),
    actionPlan.toBinary(),
    fullViewingKey.toBinary(),
    witnessData.toBinary(),
    base64ToBytes(proofResult),
  );

  return Action.fromBinary(result);
};

const proverEndpoint = (proverUrl: string): string => {
  const normalized = proverUrl.replace(/\/+$/, '');
  return normalized.endsWith('/prove') ? normalized : `${normalized}/prove`;
};

const toUint8Array = (bytes: number[] | Uint8Array): Uint8Array => {
  return bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
