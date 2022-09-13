import { gql } from "apollo-server-express";
import _ from "lodash";
import { Types } from "mongoose";
import cache from "../../../helpers/cache";
import { Context } from "../../context";
import { MemberModel } from "../member/member.model";
import { ProductCommon } from "./common";
import { ProductModel } from "./product.model";

export default {
  schema: gql`
    extend type Query {
      getRandomProduct(limit: Int, categoryId: String): [Product]
    }
  `,
  resolver: {
    Query: {
      getRandomProduct: async (root: any, args: any, context: Context) => {
        const { limit = 10, categoryId } = args;
        const memberIds = await ProductCommon.getValidShopIds(categoryId);
        return await ProductModel.aggregate([
          { $match: { allowSale: true, memberId: { $in: memberIds.map(Types.ObjectId) } } },
          { $sample: { size: limit } }, // Láy ngẫu nhiên n sản phẩm
        ]).then((res) =>
          res.map((r) => {
            r.id = r._id;
            return r;
          })
        );
      },
    },
  },
};
