import { gql } from "apollo-server-express";
import _ from "lodash";
import { get, isEmpty, keyBy } from "lodash";
import moment from "moment-timezone";
import { Types } from "mongoose";

import { configs } from "../../../configs";
import { ROLES } from "../../../constants/role.const";
import { UtilsHelper } from "../../../helpers";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { OrderModel, OrderStatus } from "../order/order.model";
import { OrderItemModel } from "../orderItem/orderItem.model";
import { ReportAdmin } from "./common";

export default {
  schema: gql`
    extend type Query {
      reportOrder(
        fromDate: String!
        toDate: String!
        memberId: ID
        "day, week, month"
        timeUnit: String
      ): OrderReport
    }
    type OrderReport {
      summary: Mixed
      topProducts: Mixed
      topShops: Mixed
      topRevenue: Mixed
      chart: Mixed
    }
  `,
  resolver: {
    Query: {
      reportOrder: async (root: any, args: any, context: Context) => {
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
          calculateSummaryOrder(data),
          calculateTop10Product(data),
          calculateTop10OrderShop(data),
          calculateTop10RevenueShop(data),
          calculateOrderChart(data),
        ]);
        return data;
      },
    },
  },
};

async function calculateOrderChart(data: any) {
  const {
    filter: { timeUnit = "day" },
    match: {
      loggedAt: { $gte, $lte },
    },
  } = data;
  const key = `report-order-chart:${data.filterKey}:${timeUnit}`;
  data.chart = JSON.parse(await cache.get(key));
  if (!isEmpty(data.chart)) return;
  switch (timeUnit) {
    case "day":
      data.labelFormat = "%dT%m";
      data.labelFormatMoment = "DDTMM";
      break;
    case "week":
      data.labelFormat = "Tuần %U";
      data.labelFormatMoment = "[Tuần] ww";
      break;
    case "month":
      data.labelFormat = "Th %m";
      data.labelFormatMoment = "[Th] MM";
      break;
    default:
      throw new Error("Đơn vị thời gian không đúng");
  }
  const dataset = await OrderModel.aggregate([
    { $match: { ...data.match, status: OrderStatus.COMPLETED } },
    {
      $addFields: {
        label: {
          $dateToString: {
            date: "$loggedAt",
            timezone: configs.timezone,
            format: data.labelFormat,
          },
        },
      },
    },
    { $group: { _id: "$label", order: { $sum: 1 }, revenue: { $sum: "$amount" } } },
  ]).then((res) => keyBy(res, "_id"));
  data.chart = {
    labels: [],
    datasets: [
      { label: "Đơn hàng", data: [] },
      { label: "Doanh thu", data: [] },
    ],
  };
  const cursorDate = moment($gte);
  while (cursorDate.isBefore($lte)) {
    const label = cursorDate.format(data.labelFormatMoment);
    data.chart.labels.push(label);
    const record = dataset[label];
    data.chart.datasets[0].data.push(record ? record.order : 0);
    data.chart.datasets[1].data.push(record ? record.revenue : 0);
    cursorDate.add(1, timeUnit);
  }
  await cache.set(key, JSON.stringify(data.chart), 60 * 5);
}

async function calculateTop10RevenueShop(data: any) {
  const key = `report-order-top-revenue:${data.filterKey}`;
  data.topRevenue = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topRevenue)) return;
  await OrderModel.aggregate([
    { $match: { ...data.match, status: OrderStatus.COMPLETED } },
    { $group: { _id: "$fromMemberId", revenue: { $sum: "$amount" } } },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    {
      $project: {
        id: "$_id",
        shopName: "$m.shopName",
        shopLogo: "$m.shopLogo",
        revenue: "$revenue",
      },
    },
  ]).then((res) => {
    data.topRevenue = res;
  });
  await cache.set(key, JSON.stringify(data.topRevenue), 60 * 5);
}

async function calculateTop10OrderShop(data: any) {
  const key = `report-order-top-shop:${data.filterKey}`;
  data.topShops = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topShops)) return;
  await OrderModel.aggregate([
    { $match: { ...data.match, status: OrderStatus.COMPLETED } },
    { $group: { _id: "$fromMemberId", order: { $sum: 1 } } },
    { $sort: { order: -1 } },
    { $limit: 10 },
    { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "m" } },
    { $unwind: "$m" },
    { $project: { id: "$_id", shopName: "$m.shopName", shopLogo: "$m.shopLogo", order: "$order" } },
  ]).then((res) => {
    data.topShops = res;
  });
  await cache.set(key, JSON.stringify(data.topShops), 60 * 5);
}

async function getCompleteOrderIds(data: any) {
  const key = `report-order-completed-order-ids:${data.filterKey}`;
  data.completedIds = JSON.parse(await cache.get(key));
  if (!isEmpty(data.completedIds)) {
    data.completedIds = data.completedIds.map(Types.ObjectId);
    return;
  }
  await OrderModel.find({ ...data.match, status: OrderStatus.COMPLETED })
    .select("_id")
    .then((res) => {
      data.completedIds = res.map((r) => r._id);
    });
  await cache.set(key, JSON.stringify(data.completedIds), 60 * 5);
}

async function calculateTop10Product(data: any) {
  const key = `report-order-top-product:${data.filterKey}`;
  data.topProducts = JSON.parse(await cache.get(key));
  if (!isEmpty(data.topProducts)) return;
  if (!data.completedIds) await getCompleteOrderIds(data);
  await OrderItemModel.aggregate([
    { $match: { orderId: { $in: data.completedIds } } },
    {
      $group: {
        _id: "$productId",
        id: { $first: "$productId" },
        name: { $first: "$productName" },
        price: { $first: "$basePrice" },
        qty: { $sum: "$qty" },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: 10 },
  ]).then((res) => {
    data.topProducts = res;
  });
  await cache.set(key, JSON.stringify(data.topProducts), 60 * 5);
}

async function calculateSummaryOrder(data: any) {
  const key = `report-order-summary:${data.filterKey}`;
  data.summary = JSON.parse(await cache.get(key));
  if (!isEmpty(data.summary)) return;
  await OrderModel.aggregate([
    { $match: data.match },
    {
      $group: {
        _id: null,
        processing: { $sum: { $cond: [data.processingCond, 1, 0] } },
        completed: { $sum: { $cond: [data.completedCond, 1, 0] } },
        canceled: { $sum: { $cond: [data.canceledCond, 1, 0] } },
      },
    },
  ]).then((res) => {
    data.summary = get(res, "0", { processing: 0, completed: 0, canceled: 0 });
  });
  await cache.set(key, JSON.stringify(data.summary), 60 * 5);
}
