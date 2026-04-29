import { PartialMessage } from '@bufbuild/protobuf';
import { TransactionPlannerRequest } from '@mizufinance/protobuf/penumbra/view/v1/view_pb';
import { TransactionPlan } from '@mizufinance/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ViewService } from '@mizufinance/protobuf';
import { penumbra } from '@/shared/const/penumbra';

export const planTransaction = async (
  req: PartialMessage<TransactionPlannerRequest>,
): Promise<TransactionPlan> => {
  const { plan } = await penumbra.service(ViewService).transactionPlanner(req);
  if (!plan) {
    throw new Error('No plan in planner response');
  }
  return plan;
};
