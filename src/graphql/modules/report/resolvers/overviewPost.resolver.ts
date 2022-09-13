import { ROLES } from "../../../../constants/role.const";
import { AuthHelper, UtilsHelper } from "../../../../helpers";
import { Context } from "../../../context";
import { MemberStatistics } from "./../loaders/memberStatistics.loader";
import { memberService } from "../../member/member.service";
import { isEmpty, isNull, set } from "lodash";
import { OrderLogModel } from "../../orderLog/orderLog.model";
import moment from "moment-timezone";
import { CollaboratorStats } from "../loaders/collaboratorStats.loader";
import { CustomerModel } from "../../customer/customer.model";
import { IMember, MemberModel } from "../../member/member.model";
import { ObjectId } from "mongodb";
import { CollaboratorModel } from "../../collaborator/collaborator.model";
import { OrderStatus } from "../../order/order.model";

const getPostReportsOverview = async (root: any, args: any, context: Context) => {
  AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER_STAFF);
  let { fromDate, toDate, memberId } = args;

  const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);

  const $match = { orderStatus: OrderStatus.COMPLETED },
    $collaboratorMatch = {},
    $memberMatch = { activated: true };

  if ($gte) {
    set($match, "createdAt.$gte", $gte);
    set($collaboratorMatch, "createdAt.$gte", $gte);
  }

  if ($lte) {
    set($match, "createdAt.$lte", $lte);
    set($collaboratorMatch, "createdAt.$lte", $lte);
  }

  if (!isEmpty(memberId)) {
    set($match, "memberId", new ObjectId(memberId));
    set($collaboratorMatch, "memberId", new ObjectId(memberId));
    set($memberMatch, "_id", new ObjectId(memberId));
  }

  if (context.isMember() || context.isStaff()) {
    set($match, "memberId", new ObjectId(context.sellerId));
    set($collaboratorMatch, "memberId", new ObjectId(context.sellerId));
    set($memberMatch, "_id", new ObjectId(context.sellerId));
  }

  // console.log('$match',$match)
  // console.log('$collaboratorMatch',$collaboratorMatch)
  // console.log('$memberMatch',$memberMatch)

  const totalMembersCount = await MemberModel.count({
    ...$memberMatch,
  });

  const totalCollaboratorsCount = await CollaboratorModel.count($collaboratorMatch);

  const collaboratorsAsCustomerCount = await CollaboratorModel.count({
    ...$collaboratorMatch,
    customerId: { $exists: true },
  });

  // console.log('$match', $match);

  const [orderStats] = await OrderLogModel.aggregate([
    {
      $match,
    },
    {
      $group: {
        _id: "$orderId",
        log: { $last: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: "$order" },
    {
      $lookup: {
        from: "commissionlogs",
        localField: "_id",
        foreignField: "orderId",
        as: "commissionlogs",
      },
    },
    {
      $group: {
        _id: null,
        completeCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, 1, 0] } },
        completeAmount: {
          $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, "$order.amount", 0] },
        },
        commissionAmount: { $sum: { $sum: "$commissionlogs.value" } },
      },
    },
  ]);

  return {
    totalCollaboratorsCount,
    collaboratorsAsCustomerCount,
    totalMembersCount,
    totalOrdersCount: orderStats ? orderStats.completeCount : 0,
    totalRealCommission: orderStats ? orderStats.commissionAmount : 0,
    totalIncome: orderStats ? orderStats.completeAmount : 0,
  };
};

const getPostReports = async (root: any, args: any, context: Context) => {
  // console.time("getPostReports");
  AuthHelper.acceptRoles(context, ROLES.ADMIN_EDITOR_MEMBER);
  if (context.isMember() || context.isStaff()) {
    args.q.filter._id = context.sellerId;
  }

  args.q.filter.activated = true;

  return await memberService
    .fetch(args.q, "-addressStorehouseIds -addressDeliveryIds")
    .then((res) => {
      // console.timeEnd("getPostReports");
      // console.log('res',res);
      return res;
    });
};

const OverviewPost = {
  memberStatistics: async (root: IMember, args: any, context: Context) => {
    return MemberStatistics.getLoader(args).load(root.id);
  },
  collaboratorStats: async (root: IMember, args: any, context: Context) => {
    return CollaboratorStats.getLoader(args).load(root.id);
  },
  customerStats: async (root: IMember, args: any, context: Context) => {
    let {
      fromDate = moment().startOf("month").format("YYYY-MM-DD"),
      toDate = moment().endOf("month").format("YYYY-MM-DD"),
    } = args;

    const { $gte, $lte } = UtilsHelper.getDatesWithComparing(fromDate, toDate);

    const customersCount = await CustomerModel.count({
      createdAt: {
        $lte,
      },
      pageAccounts: {
        $elemMatch: {
          memberId: root.id,
        },
      },
    });
    return {
      customersCount,
    };
  },
};

const Query = {
  getPostReportsOverview,
  getPostReports,
};

export default {
  Query,
  OverviewPost,
};
// {
//   $group: {
//     _id: null,
//     completeCount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, 1, 0] } },
//     completeAmount: { $sum: { $cond: [{ $eq: ["$log.orderStatus", "COMPLETED"] }, "$order.amount", 0] } },
//   }
// }
