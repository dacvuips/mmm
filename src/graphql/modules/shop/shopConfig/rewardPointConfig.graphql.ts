import { gql } from "apollo-server-express";
import { Schema } from "mongoose";

import { ROLES } from "../../../../constants/role.const";
import { GraphQLHelper } from "../../../../helpers/graphql.helper";
import { IShopConfig } from "./shopConfig.model";

export enum RewardBy {
  order = "order",
  product = "product",
}

export enum RewardUnit {
  point = "point", // Điểm trực tiếp
  cast = "cast", // Theo giá trị đơn hàng
}

export type RewardPointConfig = {
  active?: boolean; // Kích hoạt tính năng điểm thưởng
  rewardBy?: RewardBy; // Tính điểm thưởng theo đơn hay sản phẩm
  rewardUnit?: RewardUnit; // Đơn vj tính trên đơn hàng
  value?: number; // Giá trị điểm quy đổi trên 1000
};

export const RewardPointConfigSchema = new Schema({
  active: { type: Boolean, default: false },
  rewardBy: { type: String, enum: Object.values(RewardBy), default: RewardBy.order },
  rewardUnit: { type: String, enum: Object.values(RewardUnit), default: RewardUnit.cast },
  value: { type: Number, default: 1, min: 0 },
});

export default {
  schema: gql`
    type RewardPointConfig {
      "Kích hoạt tính năng điểm thưởng"
      active: Boolean
      "Tính điểm thưởng theo đơn hay sản phẩm ${Object.values(RewardBy)}"
      rewardBy: String
      "Đơn vj tính trên đơn hàng ${Object.values(RewardUnit)}"
      rewardUnit: String
      "Giá trị điểm quy đổi trên 1000"
      value: Int
    }
    input RewardPointConfigInput {
      "Kích hoạt tính năng điểm thưởng"
      active: Boolean
      "Tính điểm thưởng theo đơn hay sản phẩm ${Object.values(RewardBy)}"
      rewardBy: String
      "Đơn vj tính trên đơn hàng ${Object.values(RewardUnit)}"
      rewardUnit: String
      "Giá trị điểm quy đổi trên 1000"
      value: Int
    }
    extend type ShopConfig {
      rewardPointConfig: RewardPointConfig
    }
    extend input UpdateShopConfigInput {
      rewardPointConfig: RewardPointConfigInput
    }
  `,
  resolver: {
    ShopConfig: {
      rewardPointConfig: GraphQLHelper.requireRoles([ROLES.MEMBER, ROLES.STAFF], (root: IShopConfig) => ({
        active: root.rewardPointConfig?.active || false,
      })),
    },
  },
};
