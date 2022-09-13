import { gql } from "apollo-server-express";
import _ from "lodash";
import { ROLES } from "../../../constants/role.const";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { OrderModel, OrderStatus } from "../order/order.model";
import { ShopVoucherModel, ShopVoucherType } from "../shop/shopVoucher/shopVoucher.model";
import { ReportAdmin } from "./common";

export default {
  schema: gql`
    extend type Query {
      reportPromotion(fromDate: String!, toDate: String!, memberId: ID): PromotionReport
    }
    type PromotionReport {
      summary: Mixed
      order: Mixed
      topIssue: Mixed
      category: Mixed
    }
  `,
  resolver: {
    Query: {
      reportPromotion: async (root: any, args: any, context: Context) => {
        context.auth(ROLES.ADMIN_EDITOR_MEMBER_STAFF);
        if (context.isMember() || context.isStaff()) {
          _.set(args, "memberId", context.sellerId);
        }
        const data: any = {
          filter: args,
        };
        ReportAdmin.parseMatch(data);
        await Promise.all([
          calculateSummary(data),
          calculateOrder(data),
          calculateTopIssue(data),
          calculatePromotionCateogry(data),
        ]);
        return data;
      },
    },
  },
};

async function calculatePromotionCateogry(data: any) {
  const { match, filterKey } = data;
  const key = `report-promotion-category:${filterKey}`;
  data.category = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.category)) return;
  data.category = await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, voucherId: { $exists: true } } },
    { $group: { _id: "$voucherId", total: { $sum: 1 } } },
    { $lookup: { from: "shopvouchers", localField: "_id", foreignField: "_id", as: "v" } },
    { $unwind: "$v" },
    { $group: { _id: "$v.type", count: { $sum: "$total" } } },
  ])
    .then((res) => _.keyBy(res, "_id"))
    .then((res) => {
      return [
        { name: "Giảm giá đơn", value: _.get(res, "DISCOUNT_BILL.count", 0) },
        { name: "Giảm giá sản phẩm", value: _.get(res, "DISCOUNT_ITEM.count", 0) },
        { name: "Tặng sản phẩm", value: _.get(res, "OFFER_ITEM.count", 0) },
        { name: "Tặng sản phẩm 2", value: _.get(res, "OFFER_ITEM_2.count", 0) },
        { name: "Giảm phí ship", value: _.get(res, "SHIP_FEE.count", 0) },
        { name: "Đồng giá", value: _.get(res, "SAME_PRICE.count", 0) },
      ];
    });
  await cache.set(key, JSON.stringify(data.category), 60 * 5);
}

async function calculateTopIssue(data: any) {
  const { match, filterKey } = data;
  const key = `report-promotion-top-issue:${filterKey}`;
  data.topIssue = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.topIssue)) return;
  data.topIssue = await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, voucherId: { $exists: true } } },
    { $group: { _id: "$voucherId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 },
    { $lookup: { from: "shopvouchers", localField: "_id", foreignField: "_id", as: "v" } },
    { $unwind: "$v" },
    { $lookup: { from: "members", localField: "v.memberId", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    {
      $project: {
        _id: 1,
        shopName: "$m.shopName",
        name: "$v.code",
        description: "$v.description",
        total: 1,
      },
    },
  ]);
  await cache.set(key, JSON.stringify(data.topIssue), 60 * 5);
}

async function calculateOrder(data: any) {
  const { match, filterKey } = data;
  const key = `report-promotion-order:${filterKey}`;
  data.order = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.order)) return;
  data.order = await OrderModel.aggregate([
    { $match: { ...match, status: OrderStatus.COMPLETED, voucherId: { $exists: true } } },
    { $group: { _id: null, total: { $sum: 1 } } },
  ]).then((res) => _.get(res, "0", { total: 0 }));
  await cache.set(key, JSON.stringify(data.order), 60 * 5);
}

async function calculateSummary(data: any) {
  const {
    filterKey,
    match: { loggedAt: createdAt },
    memberMatch,
  } = data;
  const key = `report-promotion-summary:${filterKey}`;
  data.summary = JSON.parse(await cache.get(key));
  if (!_.isEmpty(data.summary)) return;
  data.summary = {
    total: await ShopVoucherModel.count({ ...memberMatch }),
    filter: await ShopVoucherModel.count({ createdAt: createdAt, ...memberMatch }),
  };
  await cache.set(key, JSON.stringify(data.summary), 60 * 5);
}
