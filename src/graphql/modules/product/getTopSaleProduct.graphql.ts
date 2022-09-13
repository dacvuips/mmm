import { gql } from "apollo-server-express";
import moment from "moment-timezone";
import { Types } from "mongoose";
import { Context } from "../../context";
import { OrderStatus } from "../order/order.model";
import { OrderItemModel } from "../orderItem/orderItem.model";
import { ProductCommon } from "./common";
import { ProductModel } from "./product.model";
import crypto from "crypto";
import cache from "../../../helpers/cache";
import _ from "lodash";
import { logger } from "../../../loaders/logger";

export default {
  schema: gql`
    extend type Query {
      getTopSaleProduct(limit: Int, categoryId: ID): [Product]
    }
  `,
  resolver: {
    Query: {
      getTopSaleProduct: async (root: any, args: any, context: Context) => {
        const { limit = 10, categoryId } = args;

        const memberIds = await ProductCommon.getValidShopIds(categoryId);

        // Tìm kiếm trong vòng 2 tháng gần nhất

        return await getTopProducts(memberIds, limit);
      },
    },
  },
};
async function getTopProducts(memberIds: any, limit: any) {
  const hash = crypto
    .createHmac("sha256", "0")
    .update(JSON.stringify({ memberIds, limit }))
    .digest("hex");
  const key = `top-product-ids:${hash}`;
  let result = JSON.parse(await cache.get(key));
  if (_.isEmpty(result) == false)
    return result.map((r: any) => {
      r.id = r._id;
      return r;
    });
  const startDate = moment().subtract(1, "month").startOf("month").toDate();
  const topProductIds = await OrderItemModel.aggregate([
    {
      $match: {
        createdAt: { $lte: startDate },
        status: OrderStatus.COMPLETED,
        sellerId: { $in: memberIds.map(Types.ObjectId) },
      },
    },
    // Nhóm theo mã sản phẩm
    { $group: { _id: "$productId", qty: { $sum: "$qty" } } },
    // Sắp xếp theo số lượng mua nhiêu nhất
    { $sort: { qty: -1 } },
    { $limit: limit },
  ]).then((res) => res.map((r) => r._id));
  result = await ProductModel.find({ _id: { $in: topProductIds } });
  await cache.set(key, JSON.stringify(result), 60); // cache trong 1 phút
  return result;
}
