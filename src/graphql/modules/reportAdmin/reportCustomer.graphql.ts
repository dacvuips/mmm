import { gql } from "apollo-server-express";
import _ from "lodash";
import { isEmpty } from "lodash";
import { ROLES } from "../../../constants/role.const";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { CustomerModel } from "../customer/customer.model";
import { OrderModel, OrderStatus } from "../order/order.model";
import { ReportAdmin } from "./common";

export default {
  schema: gql`
    extend type Query {
      reportCustomer(fromDate: String!, toDate: String!, memberId: ID): CustomerReport
    }
    type CustomerReport {
      summary: Mixed
      topOrder: Mixed
      topRevenue: Mixed
    }
  `,
  resolver: {
    Query: {
      reportCustomer: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        if (context.isMember() || context.isStaff()) {
          _.set(args, "memberId", context.sellerId);
        }
        const data: any = {
          filter: args,
          processingCond: { $in: ["$status", ["PENDING", "CONFIRMED", "DELIVERING"]] },
          completedCond: { $in: ["$status", ["COMPLETED"]] },
          canceledCond: { $in: ["$status", ["CANCELED"]] },
        };
        ReportAdmin.parseMatch(data);
        await Promise.all([
          calculateSummary(data),
          calculateTop10OrderCustomer(data),
          calculateTop10RevenueCustomer(data),
        ]);
        return data;
      },
    },
  },
};

async function calculateTop10RevenueCustomer(data: any) {
  const { match } = data;
  const key = `report-customer-top-revenue:${data.filterKey}`;
  data.topRevenue = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topRevenue)) return;
  await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED } },
    { $group: { _id: "$buyerId", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
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
  const key = `report-customer-top-order:${data.filterKey}`;
  data.topOrder = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topOrder)) return;
  await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED } },
    { $group: { _id: "$buyerId", order: { $sum: 1 } } },
    { $sort: { order: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
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

async function calculateSummary(data: any) {
  const {
    match: { loggedAt: createdAt },
    memberMatch,
  } = data;
  const key = `report-customer-summary:${data.filterKey}`;
  data.summary = JSON.parse(await cache.get(key));
  if (!isEmpty(data.summary)) return;
  data.summary = {
    total: await CustomerModel.count({ ...memberMatch }),
    filter: await CustomerModel.count({
      ...memberMatch,
      createdAt: createdAt,
    }),
  };
  await cache.set(key, JSON.stringify(data.summary), 60 * 5);
}
