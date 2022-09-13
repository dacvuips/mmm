import { set } from "lodash";
import { ErrorHelper } from "../../../../../base/error";
import { approvalStatus } from "../../../../../constants/approveStatus";
import { ROLES } from "../../../../../constants/role.const";
import { GraphQLHelper } from "../../../../../helpers/graphql.helper";
import { logger } from "../../../../../loaders/logger";
import { Context } from "../../../../context";
import { MemberLoader, MemberModel } from "../../../member/member.model";
import {
  InsertNotification,
  NotificationModel,
  NotificationTarget,
  NotificationType,
} from "../../../notification/notification.model";
import { UserLoader } from "../../../user/user.model";
import { WalletTransactionType } from "../walletTransaction.model";
import { walletTransactionService } from "../walletTransaction.service";
import { WithdrawRequestModel } from "./withdrawRequest.model";
import { withdrawRequestService } from "./withdrawRequest.service";

const Query = {
  getAllWithdrawRequest: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return withdrawRequestService.fetch(args.q);
  },
  getOneWithdrawRequest: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id } = args;
    return await withdrawRequestService.findOne({ _id: id });
  },
};

const Mutation = {
  createWithdrawRequest: async (root: any, args: any, context: Context) => {
    context.auth([ROLES.MEMBER, ROLES.STAFF]);
    const { data } = args;
    data.memberId = context.sellerId;
    data.value = Math.abs(data.value);
    data.status = approvalStatus.PENDING;
    let withdrawRequest = await withdrawRequestService.create(data);

    let member = await MemberModel.findOne({ _id: data.memberId });
    if (!member) {
      throw ErrorHelper.requestDataInvalid("memberId không hợp lệ");
    }
    // thong bao admin
    const notify = new NotificationModel({
      target: NotificationTarget.USER,
      type: NotificationType.MESSAGE,
      title: `Yêu cầu rút tiền từ chủ shop #${member.code}`,
      body: `Yêu cầu rút tiền vừa được tạo`,
    });
    InsertNotification([notify]);
    return withdrawRequest;
  },
  updateWithdrawRequest: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR);
    const { id, data } = args;

    let withdrawRequest = await WithdrawRequestModel.findOne({ _id: id });
    if (!withdrawRequest) throw ErrorHelper.requestDataInvalid("withdrawRequest không tồn tại");
    if (withdrawRequest.status !== approvalStatus.PENDING)
      throw ErrorHelper.requestDataInvalid("Trạng thái yêu cầu khác Chờ xử lý");
    // update yeu cau
    switch (data.status) {
      case approvalStatus.APPROVED:
        const member = await MemberModel.findById(withdrawRequest.memberId);
        if (member == null) {
          logger.error(`Không tìm thấy thành viên`);
          return;
        }
        const wallet = await member.getWallet();

        withdrawRequest.approvedAt = new Date();
        if (data.rejectedReason) data.rejectedReason = null;
        withdrawRequest.status = data.status;
        await withdrawRequest.save();

        // thông báo chủ shop
        const notify = new NotificationModel({
          target: NotificationTarget.MEMBER,
          memberId: withdrawRequest.memberId,
          type: NotificationType.MESSAGE,
          title: `Yêu cầu rút tiền của bạn vừa được duyệt`,
          body: `Yêu cầu rút tiền vừa được duyệt`,
        });
        InsertNotification([notify]);

        // update wallet
        const transacData: any = {
          walletId: wallet.id,
          type: WalletTransactionType.WITHDRAW,
          amount: -withdrawRequest.value,
          note: `Yêu cầu rút tiền.`,
          extra: {
            withdrawRequestId: withdrawRequest._id,
            type: "withdrawRequest",
          },
        };
        await walletTransactionService.newTransaction(transacData);
        return withdrawRequest;
      case approvalStatus.REJECTED:
        withdrawRequest.rejectedAt = new Date();
        withdrawRequest.status = data.status;
        withdrawRequest.rejectedReason = data.rejectedReason;
        return await withdrawRequest.save();
      default:
        throw ErrorHelper.requestDataInvalid("status không hợp lệ");
        return;
    }
  },
};

const WithdrawRequest = {
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  user: GraphQLHelper.loadById(UserLoader, "userId"),
};

export default {
  Query,
  Mutation,
  WithdrawRequest,
};
