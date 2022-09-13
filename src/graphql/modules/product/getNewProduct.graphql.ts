import { gql } from "apollo-server-express";
import { Context } from "../../context";
import { ProductCommon } from "./common";
import crypto from "crypto";
import cache from "../../../helpers/cache";
import _ from "lodash";
import moment from "moment-timezone";
import { ProductModel } from "./product.model";

export default {
  schema: gql`
    extend type Query {
      getNewProduct(limit: Int, categoryId: ID): [Product]
    }
  `,
  resolver: {
    Query: {
      getNewProduct: async (root: any, args: any, context: Context) => {
        const { limit = 10, categoryId } = args;

        const memberIds = await ProductCommon.getValidShopIds(categoryId);

        return await getNewProducts(memberIds, limit);
      },
    },
  },
};
async function getNewProducts(memberIds: any, limit: any) {
  const hash = crypto
    .createHmac("sha256", "0")
    .update(JSON.stringify({ memberIds, limit }))
    .digest("hex");
  const key = `new-product-ids:${hash}`;
  let result = JSON.parse(await cache.get(key));
  if (_.isEmpty(result) == false)
    return result.map((r: any) => {
      r.id = r._id;
      return r;
    });
  result = await ProductModel.find({ allowSale: true, memberId: { $in: memberIds } })
    .sort({ _id: -1 })
    .limit(limit);
  await cache.set(key, JSON.stringify(result), 60); // cache trong 1 phút
  return result;
}
