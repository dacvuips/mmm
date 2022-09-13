import { Types } from "mongoose";
import { ErrorHelper } from "./../../../base/error";
import { CustomerModel } from "./../customer/customer.model";
import { get, keyBy, set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { MemberLoader } from "../member/member.model";
import { OrderLoader } from "../order/order.model";
import { RegisServiceLoader } from "../regisService/regisService.model";
import { RegisSMSLoader } from "../regisSMS/regisSMS.model";
import { CommissionLogModel, CommissionLogType, ICommissionLog } from "./commissionLog.model";
import { commissionLogService } from "./commissionLog.service";

const Query = {
  getAllCommissionLog: async (root: any, args: any, context: Context) => {
    context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF_CUSTOMER);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    if (context.isCustomer()) {
      set(args, "q.filter.customerId", context.id);
    }
    return commissionLogService.fetch(args.q);
  },
};

const Mutation = {
  disburseCommission: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.MEMBER_STAFF);
    let data: ICommissionLog = args.data;
    data.memberId = context.sellerId;
    data.value = Math.abs(data.value);
    // check customerId
    const customer = await CustomerModel.findById(data.customerId, { _id: 1 });
    if (!customer?._id) throw ErrorHelper.error("CustomerId Không tồn tại");
    const commissionStat: {
      commission: Number;
      totalCommission: Number;
      totalDisburse: Number;
    } = await getCommissionStat(data.memberId, data.customerId);
    if (data.value > commissionStat.commission)
      throw ErrorHelper.error("Giá trị chi không được lớn hơn giá trị hoa hồng còn lại");
    data.value = -data.value;
    return await CommissionLogModel.create(data);
  },
};

const CommissionLog = {
  order: GraphQLHelper.loadById(OrderLoader, "orderId"),
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  regisSMS: GraphQLHelper.loadById(RegisSMSLoader, "regisSMSId"),
  regisService: GraphQLHelper.loadById(RegisServiceLoader, "regisServiceId"),
  note: async (root: ICommissionLog, args: any, context: Context) => {
    const member = await MemberLoader.load(root.memberId);
    const order = root.orderId ? await OrderLoader.load(root.orderId) : null;
    switch (root.type) {
      case CommissionLogType.RECEIVE_COMMISSION_1_FROM_ORDER:
        return `Cửa hàng ${member.shopName} nhận hoa hồng điểm bán từ đơn hàng ${order?.code} - khách hàng: ${order?.buyerName}`;
      // case CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER_FOR_PRESENTER:
      //   return `Hoa hồng giới thiệu cho chủ shop giới thiệu từ đơn hàng ${order.code} - khách hàng: ${order.buyerName}`;
      case CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER_FOR_COLLABORATOR:
        return `Cửa hàng ${member.shopName} nhận hoa hồng cộng tác viên từ đơn hàng ${order?.code} - khách hàng: ${order?.buyerName}`;
      case CommissionLogType.RECEIVE_COMMISSION_3_FROM_ORDER:
        return `Cửa hàng ${member.shopName} nhận hoa hồng kho từ đơn hàng ${order?.code} - khách hàng: ${order?.buyerName}`;
      case CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER:
        return `Nhận hoa hồng giới thiệu từ ĐH[${order?.code}] - KH[${order?.buyerName}]`;
      case CommissionLogType.DISBURSE_COMMISSION_MANUAL:
      case CommissionLogType.DISBURSE_COMMISSION_MOMO:
        return `Chi tiền hoa hồng`;
      default:
        return "";
    }
  },
};

export default {
  Query,
  Mutation,
  CommissionLog,
};

async function getCommissionStat(memberId: string, customerId: string) {
  let query = [
    {
      $match: {
        memberId: Types.ObjectId(memberId),
        customerId: Types.ObjectId(customerId),
      },
    },
    {
      $project: {
        _id: 1,
        memberId: 1,
        customerId: 1,
        value: 1,
        commission: { $cond: [{ $gt: ["$value", 0] }, "$value", 0] },
        disburse: { $abs: { $cond: [{ $lt: ["$value", 0] }, "$value", 0] } },
      },
    },
    {
      $group: {
        _id: "$customerId",
        commission: { $sum: "$value" },
        totalCommission: { $sum: "$commission" },
        totalDisburse: { $sum: "$disburse" },
      },
    },
  ];
  return await CommissionLogModel.aggregate(query).then((commissionStat) => {
    const listKeyBy = keyBy(commissionStat, "_id");
    return get(listKeyBy, customerId, {
      commission: 0,
      totalCommission: 0,
      totalDisburse: 0,
    });
  });
}
