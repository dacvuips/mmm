import { gql } from "apollo-server-express";
import _ from "lodash";

import { ROLES } from "../../../constants/role.const";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { RewardPointLogModel } from "../customer/rewardPointLog/rewardPointLog.model";
import { ReportAdmin } from "./common";

export default {
  schema: gql`
    extend type Query {
      reportRewardPoint(fromDate: String!, toDate: String!, memberId: ID): RewardPointReport
    }
    type RewardPointReport {
      summary: Mixed
      topCustomer: Mixed
    }
  `,
  resolver: {
    Query: {
      reportRewardPoint: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        if (context.isMember()) {
          _.set(args, "memberId", context.sellerId);
        }
        const data: any = {
          filter: args,
        };
        ReportAdmin.parseMatch(data);
        await Promise.all([calculateSummary(data), calculateTopCustomer(data)]);
        return data;
      },
    },
  },
};

async function calculateTopCustomer(data: any) {
  const {
    memberMatch,
    filterKey,
    match: { loggedAt: createdAt },
  } = data;
  const key = `report-reward-point-top-customer:${filterKey}`;
  data.topCustomer = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.topCustomer)) return;
  data.topCustomer = await RewardPointLogModel.aggregate([
    { $match: { ...memberMatch, createdAt } },
    {
      $group: {
        _id: "$customerId",
        issued: { $sum: { $cond: [{ $gt: ["$value", 0] }, "$value", 0] } },
        used: { $sum: { $cond: [{ $lt: ["$value", 0] }, "$value", 0] } },
        remaining: { $sum: "$value" },
      },
    },
    { $sort: { issued: -1 } },
    { $limit: 10 },
    { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "c" } },
    { $unwind: "$c" },
    { $lookup: { from: "members", localField: "c.memberId", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    {
      $project: {
        _id: 1,
        shopName: "$m.shopName",
        customerName: "$c.name",
        customerPhone: "$c.phone",
        issued: 1,
        used: 1,
        remaining: 1,
      },
    },
  ]);
  await cache.set(key, JSON.stringify(data.topCustomer), 60 * 5);
}

async function calculateSummary(data: any) {
  const {
    filterKey,
    match: { loggedAt: createdAt },
    memberMatch,
  } = data;
  const key = `report-reward-point-summary:${filterKey}`;
  data.summary = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.summary)) return;
  await RewardPointLogModel.aggregate([
    { $match: { ...memberMatch, createdAt } },
    {
      $group: {
        _id: null,
        issued: { $sum: { $cond: [{ $gt: ["$value", 0] }, "$value", 0] } },
        used: { $sum: { $cond: [{ $lt: ["$value", 0] }, "$value", 0] } },
      },
    },
  ]).then((res) => {
    data.summary = _.get(res, "0", { issued: 0, used: 0 });
  });
  await cache.set(key, JSON.stringify(data.summary), 60 * 5);
}
