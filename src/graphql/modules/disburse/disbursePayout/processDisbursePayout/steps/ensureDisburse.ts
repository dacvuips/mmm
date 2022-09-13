import { DisburseModel } from "../../../disburse.model";
import { ProcessDisbursePayoutContext } from "../common";

export default async function execute(ctx: ProcessDisbursePayoutContext) {
  const {
    input: { payout },
  } = ctx;
  const disburse = await DisburseModel.findById(payout.disburseId);

  ctx.meta.disburse = disburse;
}
