import { gql } from "apollo-server-express";
import { get, isEmpty, keyBy, sortBy } from "lodash";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { CollaboratorModel } from "../collaborator/collaborator.model";
import { CommissionLogModel, CommissionLogType } from "../commissionLog/commissionLog.model";
import { MemberModel } from "../member/member.model";
import { OrderModel, OrderStatus } from "../order/order.model";
import { ShopCategoryModel } from "../shop/shopCategory/shopCategory.model";
import {
  Plan,
  SubscriptionModel,
  SubscriptionPaymentStatus,
} from "../subscription/subscription.model";

export default {
  schema: gql`
    extend type Query {
      reportShop: ShopReport
    }
    type ShopReport {
      summary: Mixed
      categories: Mixed
      topRevenue: Mixed
      topOrder: Mixed
      topDiscount: Mixed
      topCollaborator: Mixed
      topCommission: Mixed
      topSubscriptionFee: Mixed
    }
  `,
  resolver: {
    Query: {
      reportShop: async (root: any, args: any, context: Context) => {
        const data = {};
        await Promise.all([
          calculateShop(data),
          calculateShopByCategory(data),
          calculateTop10RevenueShop(data),
          calculateTop10OrderShop(data),
          calculateTop10DiscountShop(data),
          calculateTop10CollaboratorShop(data),
          calculateTop10CommissionShop(data),
          calculateTop10SubscriptionFeeShop(data),
        ]);
        return data;
      },
    },
  },
};

async function calculateTop10SubscriptionFeeShop(data: any) {
  data.topSubscriptionFee = JSON.parse(await cache.get("report-shop-top-subscription-fee"));
  if (!isEmpty(data.topSubscriptionFee)) return;
  data.topSubscriptionFee = await SubscriptionModel.aggregate([
    { $group: { _id: "$memberId", fee: { $sum: "$fee" } } },
    { $sort: { fee: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", fee: 1 } },
  ]);
  await cache.set(
    "report-shop-top-subscription-fee",
    JSON.stringify(data.topSubscriptionFee),
    60 * 60
  );
}

async function calculateTop10CommissionShop(data: any) {
  data.topCommission = JSON.parse(await cache.get("report-shop-top-commission"));
  if (!isEmpty(data.topCommission)) return;
  data.topCommission = await CommissionLogModel.aggregate([
    { $match: { type: CommissionLogType.RECEIVE_COMMISSION_2_FROM_ORDER } },
    { $group: { _id: "$memberId", commission: { $sum: "$value" } } },
    { $sort: { commission: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", commission: 1 } },
  ]);
  await cache.set("report-shop-top-commission", JSON.stringify(data.topCommission), 60 * 60);
}

async function calculateTop10DiscountShop(data: any) {
  data.topDiscount = JSON.parse(await cache.get("report-shop-top-discount"));
  if (!isEmpty(data.topDiscount)) return;
  data.topDiscount = await OrderModel.aggregate([
    { $match: { status: OrderStatus.COMPLETED } },
    { $group: { _id: "$fromMemberId", order: { $sum: 1 }, discount: { $sum: "$discount" } } },
    { $sort: { discount: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    {
      $project: {
        id: "$_id",
        shopName: "$m.shopName",
        shopLogo: "$m.shopLogo",
        order: 1,
        discount: 1,
      },
    },
  ]);
  await cache.set("report-shop-top-discount", JSON.stringify(data.topDiscount), 60 * 60);
}

async function calculateTop10CollaboratorShop(data: any) {
  data.topCollaborator = JSON.parse(await cache.get("report-shop-top-collaborator"));
  if (!isEmpty(data.topCollaborator)) return;
  data.topCollaborator = await CollaboratorModel.aggregate([
    { $group: { _id: "$memberId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", total: 1 } },
  ]);
  await cache.set("report-shop-top-collaborator", JSON.stringify(data.topCollaborator), 60 * 60);
}

async function calculateTop10OrderShop(data: any) {
  data.topOrder = JSON.parse(await cache.get("report-shop-top-order"));
  if (!isEmpty(data.topOrder)) return;
  data.topOrder = await OrderModel.aggregate([
    { $match: { status: OrderStatus.COMPLETED } },
    { $group: { _id: "$fromMemberId", order: { $sum: 1 } } },
    { $sort: { order: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", order: 1 } },
  ]);
  await cache.set("report-shop-top-order", JSON.stringify(data.topOrder), 60 * 60);
}

async function calculateTop10RevenueShop(data: any) {
  data.topRevenue = JSON.parse(await cache.get("report-shop-top-revenue"));
  if (!isEmpty(data.topRevenue)) return;
  data.topRevenue = await OrderModel.aggregate([
    { $match: { status: OrderStatus.COMPLETED } },
    { $group: { _id: "$fromMemberId", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", revenue: 1 } },
  ]);
  await cache.set("report-shop-top-revenue", JSON.stringify(data.topRevenue), 60 * 60);
}

async function calculateShopByCategory(data: any) {
  data.categories = JSON.parse(await cache.get("report-shop-categories"));
  if (!isEmpty(data.categories)) return;
  const categories = await ShopCategoryModel.find().select("_id name");
  await MemberModel.aggregate([{ $group: { _id: "$categoryId", totalShop: { $sum: 1 } } }]).then(
    (list) => {
      const keyById = keyBy(list, "_id");
      data.categories = sortBy(
        categories.map((c) => ({
          id: c._id,
          name: c.name,
          totalShop: get(keyById, c._id + ".totalShop", 0),
        })),
        "totalShop"
      );
    }
  );
  await cache.set("report-shop-categories", JSON.stringify(data.categories), 60 * 60);
}

async function calculateShop(data: any) {
  data.summary = JSON.parse(await cache.get("report-shop-summary"));
  if (!isEmpty(data.summary)) return;

  await MemberModel.aggregate([
    {
      $group: {
        _id: null,
        totalShop: { $sum: 1 },
        freePlan: { $sum: { $cond: [{ $eq: ["$subscription.plan", Plan.FREE] }, 1, 0] } },
        payPlan: { $sum: { $cond: [{ $ne: ["$subscription.plan", Plan.FREE] }, 1, 0] } },
      },
    },
  ]).then((res) => {
    data.summary = get(res, "0", {
      totalShop: 0,
      freePlan: 0,
      payPlan: 0,
    });
  });
  await cache.set("report-shop-summary", JSON.stringify(data.summary), 60 * 60);
}
