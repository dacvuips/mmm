import _ from "lodash";
import { ROLES } from "../../../../constants/role.const";
import { AuthHelper, ErrorHelper } from "../../../../helpers";
import { sleep } from "../../../../helpers/functions/sleep";
import { momoSalary1, momoSalary2 } from "../../../../helpers/momo/momoSalary";
import { MainConnection } from "../../../../loaders/database";
import { Context } from "../../../context";
import { DisburseModel, DisburseStatus } from "../disburse.model";
import { DisburseItemModel, DisburseItemStatus } from "../disburseItem/disburseItem.model";
import { DisbursePayoutModel, DisbursePayoutStatus } from "./disbursePayout.model";
import { disbursePayoutService } from "./disbursePayout.service";
import processDisbursePayoutQueue from "./processDisbursePayout/processDisbursePayout.queue";

const Query = {
  getAllDisbursePayout: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    return disbursePayoutService.fetch(args.q);
  },
  getOneDisbursePayout: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await disbursePayoutService.findOne({ _id: id });
  },
};

const Mutation = {
  createDisbursePayout: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { data } = args;
    const { disburseId, name } = data;
    const disburse = await DisburseModel.findById(disburseId);
    if (!disburse) throw Error("Không có đợt giải ngân");
    if (disburse.status == DisburseStatus.closed) throw Error("Đợt giải ngân đã kết thúc");
    if (context.isMember() || context.isStaff()) {
      if (disburse.memberId.toString() != context.sellerId) throw ErrorHelper.permissionDeny();
    }

    const pendingDisburseItems = await DisburseItemModel.find({
      disburseId: disburse._id,
      status: { $ne: DisburseItemStatus.completed },
      payoutId: { $exists: false },
    });

    if (pendingDisburseItems.length == 0) {
      throw Error("Không có danh sách người nhận cần chi");
    }

    const payout = new DisbursePayoutModel({
      memberId: disburse.memberId,
      disburseId: disburse._id,
      ownerId: context.sellerId,
      name: name,
      status: DisbursePayoutStatus.processing,
      processingMsg: "Đang khởi tạo danh sách chi",
    });

    const session = await MainConnection.startSession();
    try {
      await session.withTransaction(async (session) => {
        await payout.save({ session });
        await DisburseItemModel.updateMany(
          { _id: { $in: pendingDisburseItems.map((i) => i._id) } },
          { $set: { payoutId: payout._id, status: DisburseItemStatus.pending } }
        );
      });
      await processDisbursePayoutQueue
        .queue()
        .createJob(payout)
        .setId(payout._id.toString())
        .save();
      return payout;
    } finally {
      session.endSession();
    }
  },
  deleteOneDisbursePayout: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    let payout = await DisbursePayoutModel.findById(id);
    if (!payout) throw Error("Không tìm thấy đợt chi");
    payout = await disbursePayoutService.updatePayoutDetail(payout);
    if (context.isMember()) {
      const disburse = await DisburseModel.findById(payout.disburseId);
      if (disburse.memberId.toString() != context.sellerId) {
        throw ErrorHelper.permissionDeny();
      }
    }
    const payoutFileId = _.get(payout, "meta.payoutFileId");
    switch (payout.status) {
      case DisbursePayoutStatus.error:
        await DisburseItemModel.updateMany({ payoutId: payout._id }, { $unset: { payoutId: 1 } });
        await disbursePayoutService.deleteOne(id);
        break;
      case DisbursePayoutStatus.processing:
      case DisbursePayoutStatus.pending:
        if (payoutFileId) {
          await momoSalary1.cancelPayoutList(payoutFileId).catch((err) => {});
          await momoSalary2.cancelPayoutList(payoutFileId).catch((err) => {});
        }
        await DisburseItemModel.updateMany({ payoutId: payout._id }, { $unset: { payoutId: 1 } });
        break;
      default:
        throw Error("Không thể xoá đợt chi đã qua xử lý");
    }

    await sleep(5000);
    return await disbursePayoutService.updatePayoutDetail(payout);
  },
};

const DisbursePayout = {};

export default {
  Query,
  Mutation,
  DisbursePayout,
};
