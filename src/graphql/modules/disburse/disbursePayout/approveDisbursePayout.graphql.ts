import { gql } from "apollo-server-express";
import { DeliveryStatus } from "momo-salary";
import { ROLES } from "../../../../constants/role.const";
import { sleep } from "../../../../helpers/functions/sleep";
import { momoSalary2 } from "../../../../helpers/momo/momoSalary";
import { Context } from "../../../context";
import { DisburseItemModel, DisburseItemStatus } from "../disburseItem/disburseItem.model";
import { DisbursePayoutModel, DisbursePayoutStatus } from "./disbursePayout.model";
import { disbursePayoutService } from "./disbursePayout.service";

export default {
  schema: gql`
    extend type Mutation {
      approveDisbursePayout(payoutId: ID!): DisbursePayout
    }
  `,
  resolver: {
    Mutation: {
      approveDisbursePayout: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR);

        const { payoutId } = args;
        let payout = await DisbursePayoutModel.findById(payoutId);
        payout = await disbursePayoutService.updatePayoutDetail(payout);

        if (payout.status != DisbursePayoutStatus.pending) {
          throw new Error(`Không thể duyệt đợt chi này.`);
        }

        const payoutFileId = payout.meta.payoutFileId;
        await momoSalary2.approvePayoutList(payoutFileId);

        payout.approverId = context.id;
        payout.approveAt = new Date();
        await payout.save();

        await sleep(5000);

        payout = await disbursePayoutService.updatePayoutDetail(payout);

        if (payout.status == DisbursePayoutStatus.approved) {
          await DisburseItemModel.updateMany(
            { payoutId: payout._id, "meta.deliveryStatus": DeliveryStatus.valid },
            { $set: { status: DisburseItemStatus.completed } }
          );
        }

        return payout;
      },
    },
  },
};
