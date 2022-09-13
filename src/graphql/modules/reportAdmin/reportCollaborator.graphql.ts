import { gql } from "apollo-server-express";
import _ from "lodash";
import { get, isEmpty } from "lodash";
import { ROLES } from "../../../constants/role.const";
import cache from "../../../helpers/cache";
import { logger } from "../../../loaders/logger";
import { Context } from "../../context";
import { CollaboratorModel } from "../collaborator/collaborator.model";
import { CommissionLogModel, CommissionLogType } from "../commissionLog/commissionLog.model";
import { CustomerModel } from "../customer/customer.model";
import { OrderModel, OrderStatus } from "../order/order.model";
import { ReportAdmin } from "./common";

export default {
  schema: gql`
    extend type Query {
      reportCollaborator(fromDate: String!, toDate: String!, memberId: ID): CollaboratorReport
    }
    type CollaboratorReport {
      summary: Mixed
      invite: Mixed
      order: Mixed
      commission: Mixed
      topInvite: Mixed
      topOrder: Mixed
      topRevenue: Mixed
      topCommission: Mixed
      topEngagement: Mixed
    }
  `,
  resolver: {
    Query: {
      reportCollaborator: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        if (context.isMember() || context.isStaff()) {
          _.set(args, "memberId", context.sellerId);
        }
        const data: any = { filter: args };
        ReportAdmin.parseMatch(data);
        await Promise.all([
          calculateCollaboratorSummary(data),
          calculateInviteSummary(data),
          calculateCollaboratorOrder(data),
          calculateCollaboratorCommission(data),
          calculateTop10InviteCustomer(data),
          calculateTop10OrderCustomer(data),
          calculateTop10RevenueCustomer(data),
          calculateTop10ComissionCustomer(data),
          calculateTopEngagementCustomer(data),
        ]);
        return data;
      },
    },
  },
};

async function calculateTopEngagementCustomer(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-top-engagement:${filterKey}`;
  data.topEngagement = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topEngagement)) return;

  const query = [
    { $match: { ...memberMatch, createdAt: createdAt } },
    { $sort: { engagementCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    {
      $project: {
        id: "$_id",
        customerName: "$c.name",
        customerPhone: "$c.phone",
        engagementCount: 1,
      },
    },
  ];
  data.topEngagement = await CollaboratorModel.aggregate(query);

  await cache.set(key, JSON.stringify(data.topEngagement), 60 * 5);
}

async function calculateTop10ComissionCustomer(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-top-commission:${filterKey}`;
  data.topCommission = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topCommission)) return;

  await CommissionLogModel.aggregate([
    {
      $match: {
        createdAt,
        type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER,
        ...memberMatch,
      },
    },
    { $group: { _id: "$customerId", commission: { $sum: "$value" } } },
    { $sort: { commission: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    { $project: { id: "$_id", customerName: "$c.name", customerPhone: "$c.phone", commission: 1 } },
  ]).then((res) => {
    data.topCommission = res;
  });
  await cache.set(key, JSON.stringify(data.topCommission), 60 * 5);
}

async function calculateTop10RevenueCustomer(data: any) {
  const { match } = data;
  const key = `report-collaborator-top-revenue:${data.filterKey}`;
  data.topRevenue = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topRevenue)) return;
  await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, collaboratorId: { $exists: true } } },
    { $group: { _id: "$collaboratorId", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "collaborators", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    {
      $project: {
        id: "$_id",
        customerName: "$c.name",
        customerPhone: "$c.phone",
        revenue: 1,
      },
    },
  ]).then((res) => {
    data.topRevenue = res;
  });
  await cache.set(key, JSON.stringify(data.topRevenue), 60 * 5);
}

async function calculateTop10OrderCustomer(data: any) {
  const { match } = data;
  const key = `report-collaborator-top-order:${data.filterKey}`;
  data.topOrder = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topOrder)) return;
  await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, collaboratorId: { $exists: true } } },
    { $group: { _id: "$collaboratorId", order: { $sum: 1 } } },
    { $sort: { order: -1 } },
    { $limit: 10 },
    { $lookup: { from: "collaborators", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    {
      $project: {
        id: "$_id",
        customerName: "$c.name",
        customerPhone: "$c.phone",
        order: 1,
      },
    },
  ]).then((res) => {
    data.topOrder = res;
  });
  await cache.set(key, JSON.stringify(data.topOrder), 60 * 5);
}

async function calculateTop10InviteCustomer(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-top-invite:${filterKey}`;
  data.topInvite = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topInvite)) return;
  await CustomerModel.aggregate([
    { $match: { createdAt, presenterId: { $exists: true }, ...memberMatch } },
    { $group: { _id: "$presenterId", invite: { $sum: 1 } } },
    { $sort: { invite: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    {
      $project: {
        id: "$_id",
        customerName: "$c.name",
        customerPhone: "$c.phone",
        invite: 1,
      },
    },
  ]).then((res) => {
    data.topInvite = res;
  });
  await cache.set(key, JSON.stringify(data.topInvite), 60 * 5);
}

async function calculateCollaboratorCommission(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-commission-summary:${filterKey}`;
  data.commission = JSON.parse(await cache.get(key));
  if (!isEmpty(data.commission)) return;

  await CommissionLogModel.aggregate([
    {
      $match: {
        createdAt,
        type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER,
        ...memberMatch,
      },
    },
    { $group: { _id: null, commission: { $sum: "$value" } } },
  ]).then((res) => {
    data.commission = get(res, "0", { commission: 0 });
  });
  await cache.set(key, JSON.stringify(data.commission), 60 * 5);
}

async function calculateCollaboratorOrder(data: any) {
  const { match, filterKey } = data;
  const key = `report-collaborator-order-summary:${filterKey}`;
  data.order = JSON.parse(await cache.get(key));
  if (!isEmpty(data.order)) return;

  await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, collaboratorId: { $exists: true } } },
    { $group: { _id: null, order: { $sum: 1 }, revenue: { $sum: "$amount" } } },
  ]).then((res) => {
    data.order = get(res, "0", { order: 0, revenue: 0 });
  });
  await cache.set(key, JSON.stringify(data.order), 60 * 5);
}

async function calculateInviteSummary(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-invite-summary:${filterKey}`;
  data.invite = JSON.parse(await cache.get(key));
  if (!isEmpty(data.invite)) return;
  data.invite = {
    total: await CustomerModel.count({ presenterId: { $exists: true }, ...memberMatch }),
    filter: await CustomerModel.count({
      presenterId: { $exists: true },
      createdAt,
      ...memberMatch,
    }),
  };
  await cache.set(key, JSON.stringify(data.invite), 60 * 5);
}

async function calculateCollaboratorSummary(data: any) {
  const {
    memberMatch,
    match: { loggedAt: createdAt },
    filterKey,
  } = data;
  const key = `report-collaborator-summary:${filterKey}`;
  data.summary = JSON.parse(await cache.get(key));
  if (!isEmpty(data.summary)) return;
  data.summary = {
    total: await CollaboratorModel.count({ ...memberMatch }).exec(),
    filter: await CollaboratorModel.count({ createdAt, ...memberMatch }),
  };
  await cache.set(key, JSON.stringify(data.summary), 60 * 5);
}
