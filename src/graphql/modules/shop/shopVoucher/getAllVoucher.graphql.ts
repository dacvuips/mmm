import { gql } from "apollo-server-express";
import _, { set } from "lodash";
import { Types } from "mongoose";
import cache from "../../../../helpers/cache";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { Context } from "../../../context";
import { MemberLoader, MemberModel } from "../../member/member.model";
import { ShopVoucherModel, ShopVoucherType } from "./shopVoucher.model";

export default {
  schema: gql`
    extend type Query {
      getAllVoucher(categoryId: ID): [PublicVoucher]
    }
    type PublicVoucher {
      id: ID
      "Mã khuyến mãi"
      code: String
      "Mô tả"
      description: String
      "Loại giảm giá ${Object.values(ShopVoucherType)}"
      type: String
      "Ngày bắt đầu"
      startDate: DateTime
      "Ngày kết thúc"
      endDate: DateTime
      "Hình ảnh"
      image: String

      shop: Shop
    }
  `,
  resolver: {
    Query: {
      getAllVoucher: async (root: any, args: any, context: Context) => {
        const { categoryId } = args;
        const match: any = {
          isActive: true,
          isPrivate: false,
          isPersonal: false,
          $and: [
            { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: new Date() } }] },
            { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }] },
          ],
        };
        if (_.isEmpty(categoryId) == false) {
          // Nếu Lọc theo nhóm cửa hàng, thì láy danh sách cửa hàng theo nhóm
          let memberIds = await JSON.parse(await cache.get(`category-shop-ids:${categoryId}`));
          if (_.isEmpty(memberIds) == true) {
            // Chưa có trong cache, láy từ database
            memberIds = await MemberModel.find({ categoryId })
              .select("_id")
              .exec()
              .then((res) => res.map((m) => m._id));
            // Save to cache in 5 miniute
            await cache.set(`category-shop-ids:${categoryId}`, JSON.stringify(memberIds), 60 * 5);
          } else {
            // Parse to ObjectIds array
            memberIds = memberIds.map(Types.ObjectId);
          }
          // Thêm vào match
          match.memberId = { $in: memberIds };
        }
        const query = [{ $match: match }, { $sample: { size: 10 } }];
        return await ShopVoucherModel.aggregate(query);
      },
    },
    PublicVoucher: {
      id: (root: any) => root._id.toString(),
      shop: GraphQLHelper.loadById(MemberLoader, "memberId"),
    },
  },
};
