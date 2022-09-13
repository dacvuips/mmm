import { gql } from "apollo-server-express";
import DataLoader from "dataloader";
import _ from "lodash";
import { Types } from "mongoose";
import { ttlCache } from "../../../../helpers/ttlCache";
import { Context } from "../../../context";
import { MemberModel } from "../../member/member.model";
import { IShopCategory } from "./shopCategory.model";

export default {
  schema: gql`
    extend type ShopCategory {
      shopCount: Int
    }
  `,
  resolver: {
    ShopCategory: {
      shopCount: async (root: IShopCategory, args: any, context: Context) => {
        return shopCountLoader.load(root._id.toString());
      },
    },
  },
};

const shopCountLoader = new DataLoader<string, number>(
  (ids: string[]) => {
    const objectIds = ids.map(Types.ObjectId);
    return MemberModel.aggregate([
      { $match: { categoryId: { $in: objectIds } } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]).then((res) => {
      const keyById = _.keyBy(res, "_id");
      return ids.map((id) => _.get(keyById, id + ".count", 0));
    });
  },
  { cache: true, cacheMap: ttlCache({ ttl: 60000 * 5, maxSize: 100 }) }
);
