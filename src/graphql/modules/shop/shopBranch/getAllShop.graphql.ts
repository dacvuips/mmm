import { gql } from "apollo-server-express";
import _ from "lodash";
import { Types } from "mongoose";

import LocalBroker from "../../../../services/broker";
import { Context } from "../../../context";
import { MemberModel } from "../../member/member.model";
import { IShopConfig } from "../shopConfig/shopConfig.model";
import { ShopBranchModel } from "./shopBranch.model";

export default {
  schema: gql`
    extend type Query {
      getAllShop(
        lat: Float!
        lng: Float!
        categoryId: ID
        districtId: String
        search: String
        orderNew: Boolean
        sortByTotalOrder: Boolean
        limit: Int
        page: Int
      ): [PublicShop]
    }
    type PublicShop {
      id: ID
      coverImage: String
      name: String
      fullAddress: String
      distance: Float
      rating: Float
      ratingQty: Float
      shopCode: String
      shopCover: String
      shopLogo: String
      shopName: String
      branchs: [PublicShopBranch]
      "Chủ shop đã kích hoạt"
      activated: Boolean
      "Số đơn hàng bán trong 7 ngày của member"
      totalOrderLast7Days: Float
    }
    type PublicShopBranch {
      id: ID
      name: String
      fullAddress: String
      distance: Float
    }
  `,
  resolver: {
    Query: {
      getAllShop: async (root: any, args: any, context: Context) => {
        const {
          lat,
          lng,
          categoryId,
          districtId,
          search,
          orderNew,
          page = 1,
          limit = 20,
          sortByTotalOrder = false,
        } = args;
        const matchBranch = { isOpen: true };
        const matchShop: any = {
          "member.activated": true,
          "member.locked": false,
        };
        const orderOption: any = {};
        const offset = (page - 1) * limit;

        if (search) {
          const memberIds = await MemberModel.find({ $text: { $search: search } })
            .select({
              _id: 1,
              _score: { $meta: "textScore" },
            })
            .sort({ _score: { $meta: "textScore" } })
            .limit(100)
            .exec()
            .then((res) => res.map((m) => Types.ObjectId(m._id)));

          if (memberIds.length == 0) {
            return [];
          } else {
            matchShop["member._id"] = { $in: memberIds };
          }
        }

        if (sortByTotalOrder) {
          orderOption.totalOrderLast7Days = -1;
        }
        if (orderNew) {
          orderOption.id = -1;
        }
        if (categoryId) matchShop["member.categoryId"] = Types.ObjectId(categoryId);
        if (districtId) _.set(matchBranch, "districtId", districtId);
        const query = [
          {
            $geoNear: {
              near: { type: "Point", coordinates: [lng, lat] },
              spherical: true,
              distanceField: "distance",
            },
          },
          { $match: matchBranch },

          {
            $group: {
              _id: "$memberId",
              id: { $first: "$memberId" },
              coverImage: { $first: "$coverImage" },
              name: { $first: "$name" },
              fullAddress: {
                $first: {
                  $concat: ["$address", ", ", "$ward", ", ", "$district", ", ", "$province"],
                },
              },
              distance: { $first: "$distance" },
              branchs: {
                $push: {
                  id: "$_id",
                  name: "$name",
                  fullAddress: {
                    $concat: ["$address", ", ", "$ward", ", ", "$district", ", ", "$province"],
                  },
                  distance: "$distance",
                },
              },
            },
          },
          { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "member" } },
          { $unwind: "$member" },
          ...(_.isEmpty(matchShop) ? [] : [{ $match: matchShop }]),
          {
            $project: {
              id: 1,
              coverImage: 1,
              name: { $concat: ["$member.shopName"] },
              fullAddress: 1,
              distance: 1,
              shopName: "$member.shopName",
              shopCover: "$member.shopCover",
              shopLogo: "$member.shopLogo",
              shopCode: "$member.code",
              branchs: 1,
              activated: "$member.activated",
              totalOrderLast7Days: {
                $cond: {
                  if: { $gt: ["$member.context.totalOrderLast7Days", null] },
                  then: "$member.context.totalOrderLast7Days",
                  else: 0,
                },
              },
            },
          },
          { $sort: { ...orderOption, distance: 1 } },
          { $skip: offset },
          { $limit: limit },
        ];
        // console.dir(query, { depth: null });
        return ShopBranchModel.aggregate(query);
      },
    },
    PublicShop: {
      distance: async (root: any, args: any, context: Context) => {
        return parseFloat((root.distance / 1000).toFixed(1));
      },
      coverImage: async (root: any, args: any, context: Context) => {
        return root.coverImage || root.shopCover || root.shopLogo;
      },
      rating: async (root: any, args: any, context: Context) => {
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: root.id.toString(),
        });
        return shopConfig.rating;
      },
      ratingQty: async (root: any, args: any, context: Context) => {
        const shopConfig: IShopConfig = await LocalBroker.call("shopConfig.get", {
          id: root.id.toString(),
        });
        return shopConfig.ratingQty;
      },
    },
    PublicShopBranch: {
      distance: async (root: any, args: any, context: Context) => {
        return parseFloat((root.distance / 1000).toFixed(1));
      },
    },
  },
};
