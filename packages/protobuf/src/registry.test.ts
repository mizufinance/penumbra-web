import { describe, expect, it } from 'vitest';
import { MsgRecvPacket } from '../gen/ibc/core/channel/v1/tx_pb.js';
import { MsgUpdateClient } from '../gen/ibc/core/client/v1/tx_pb.js';
import { ClientState, Header } from '../gen/ibc/lightclients/tendermint/v1/tendermint_pb.js';
import { Transfer } from '../gen/penumbra/core/component/shielded_pool/v1/shielded_pool_pb.js';
import { BalancesResponse } from '../gen/penumbra/view/v1/view_pb.js';
import { typeRegistry } from './registry.js';

describe('registry contents that are part of services', () => {
  it('includes BalancesResponse', () => {
    expect(typeRegistry.findMessage(BalancesResponse.typeName)).toBeTruthy();
  });

  it('includes MsgUpdateClient', () => {
    expect(typeRegistry.findMessage(MsgUpdateClient.typeName)).toBeTruthy();
  });
});

describe('registry contents that are not part of services', () => {
  it('includes ClientState', () => {
    expect(typeRegistry.findMessage(ClientState.typeName)).toBeTruthy();
  });

  it('includes Header', () => {
    expect(typeRegistry.findMessage(Header.typeName)).toBeTruthy();
  });

  it('includes MsgRecvPacket', () => {
    expect(typeRegistry.findMessage(MsgRecvPacket.typeName)).toBeTruthy();
  });

  it('includes Transfer', () => {
    expect(typeRegistry.findMessage(Transfer.typeName)).toBeTruthy();
  });
});
