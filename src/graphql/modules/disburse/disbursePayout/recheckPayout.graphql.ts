import { gql } from "apollo-server-express";

import { ROLES } from "../../../../constants/role.const";
import { ErrorHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { DisbursePayoutModel, DisbursePayoutStatus } from "./disbursePayout.model";
import { disbursePayoutService } from "./disbursePayout.service";
import processDisbursePayoutQueue from "./processDisbursePayout/processDisbursePayout.queue";

export default {
  schema: gql`
    extend type Mutation {
      recheckPayout(payoutId: ID!): DisbursePayout
    }
  `,
  resolver: {
    Mutation: {
      recheckPayout: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        const { payoutId } = args;
        const payout = await DisbursePayoutModel.findById(payoutId);

        if (context.isMember() || context.isStaff()) {
          if (payout.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
        }

        if (
          payout.status != DisbursePayoutStatus.error &&
          payout.status != DisbursePayoutStatus.processing
        ) {
          return await disbursePayoutService.updatePayoutDetail(payout);
        }

        const job = await processDisbursePayoutQueue
          .queue()
          .createJob(payout)
          .setId(payout._id.toString())
          .save();

        return payout;
      },
    },
  },
};
