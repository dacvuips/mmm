import { get, set } from "lodash";

import { ROLES } from "../../../constants/role.const";
import { AuthHelper } from "../../../helpers";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";
import { CustomerLoader } from "../customer/customer.model";
import { MemberLoader } from "../member/member.model";
import { OrderLoader, OrderStatus } from "../order/order.model";
import { IOrderLog, OrderLogType } from "./orderLog.model";
import { orderLogService } from "./orderLog.service";

const Query = {
  getAllOrderLog: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.memberId", context.sellerId);
    }
    return orderLogService.fetch(args.q);
  },
  getAllToMemberOrderLog: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    if (context.isMember() || context.isStaff()) {
      set(args, "q.filter.toMemberId", context.sellerId);
    }
    return orderLogService.fetch(args.q);
  },
  getOneOrderLog: async (root: any, args: any, context: Context) => {
    AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
    const { id } = args;
    return await orderLogService.findOne({ _id: id });
  },
};

// orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
// type: { type: String, enum: Object.values(OrderLogType), required: true },
// memberId: {type: Schema.Types.ObjectId, ref:"Member", required: true},
// toMemberId: {type: Schema.Types.ObjectId, ref:"Member"},
// customerId: { type: Schema.Types.ObjectId, ref: "Customer" },

const OrderLog = {
  order: GraphQLHelper.loadById(OrderLoader, "orderId"),
  member: GraphQLHelper.loadById(MemberLoader, "memberId"),
  toMember: GraphQLHelper.loadById(MemberLoader, "toMemberId"),
  customer: GraphQLHelper.loadById(CustomerLoader, "customerId"),

  note: async (root: IOrderLog, args: any, context: Context) => {
    const [order, customer, member, toMember] = await Promise.all([
      OrderLoader.load(root.orderId),
      CustomerLoader.load(root.customerId),
      MemberLoader.load(root.memberId),
      root.toMemberId ? MemberLoader.load(root.toMemberId) : null,
    ]);
    const customerName = customer && customer.name ? customer.name : "V??ng lai";
    const shopName = get(member, "shopName");
    const toShopName = get(toMember, "shopName");
    switch (root.type) {
      case OrderLogType.CREATED:
        return `????n h??ng ${order.code} ??ang ch??? x??c nh???n - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName}`;

      case OrderLogType.CONFIRMED:
        return `????n h??ng ${order.code} ???? ???????c x??c nh???n nh???n ????n - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName}`;

      case OrderLogType.TRANSFERED:
        return `????n h??ng ${order.code} ???? ???????c chuy???n kho - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName} - c???a h??ng giao: ${toShopName}`;

      case OrderLogType.MEMBER_CANCELED:
        return `????n h??ng ${order.code} ???? b??? hu??? - kh??ch h??ng: ${customerName} - c???a h??ng b??n hu??? ????n: ${shopName}`;

      case OrderLogType.CUSTOMER_CANCELED:
        return `????n h??ng ${order.code} ???? b??? hu??? - kh??ch h??ng hu??? ????n: ${customerName} - c???a h??ng b??n: ${shopName}`;

      case OrderLogType.MEMBER_DELIVERING:
        return `????n h??ng ${order.code} ??ang giao - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName} - c???a h??ng giao: ${shopName}`;

      case OrderLogType.TO_MEMBER_DELIVERING:
        return `????n h??ng ${order.code} ??ang giao - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName} - c???a h??ng giao: ${toShopName}`;

      case OrderLogType.MEMBER_COMPLETED:
        return `????n h??ng ${order.code} th??nh c??ng - kh??ch h??ng: ${customerName} - c???a h??ng b??n x??c nh???n: ${shopName}`;

      case OrderLogType.TO_MEMBER_COMPLETED:
        return `????n h??ng ${order.code} th??nh c??ng - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName} - c???a h??ng giao x??c nh???n: ${toShopName}`;

      case OrderLogType.MEMBER_FAILURE:
        return `????n h??ng ${order.code} kh??ng th??nh c??ng - kh??ch h??ng: ${customerName} - c???a h??ng b??n x??c nh???n: ${shopName}`;

      case OrderLogType.TO_MEMBER_FAILURE:
        return `????n h??ng ${order.code} kh??ng th??nh c??ng - kh??ch h??ng: ${customerName} - c???a h??ng b??n: ${shopName} - c???a h??ng giao x??c nh???n: ${toShopName}`;

      case OrderLogType.TO_MEMBER_FAILURE:
        return `????n h??ng ${order.code} kh??ng th??nh c??ng - kh??ch h??ng: ${customer.name} - c???a h??ng b??n: ${shopName} - c???a h??ng giao x??c nh???n: ${toShopName}`;
      default:
        return "";
    }
  },

  statusText: async (root: IOrderLog, args: any, context: Context) => {
    switch (root.orderStatus) {
      case OrderStatus.PENDING:
        return `Ch??? duy???t`;
      case OrderStatus.CONFIRMED:
        return `X??c nh???n`;
      case OrderStatus.DELIVERING:
        return `??ang giao`;
      case OrderStatus.COMPLETED:
        return `Ho??n th??nh`;
      case OrderStatus.FAILURE:
        return `Th???t b???i`;
      case OrderStatus.CANCELED:
        return `???? hu???`;
      case OrderStatus.RETURNED:
        return `???? ho??n h??ng`;
      default:
        return root.orderStatus;
    }
  },
};

export default {
  Query,
  OrderLog,
};
