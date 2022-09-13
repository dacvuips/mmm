import { gql } from "apollo-server-express";
import { GraphQLHelper } from "../../../../../../helpers/graphql.helper";
import { ShopVoucherGroupLoader } from "../shopVoucherGroup.model";

export default {
  schema: gql`
    extend type ShopVoucher {
      "Mã nhóm khuyến mãi"
      shopVoucherGroupId: String
      "Nhóm khuyến mãi"
      shopVoucherGroup: ShopVoucherGroup
    }
  `,
  resolver: {
    ShopVoucher: {
      shopVoucherGroup: GraphQLHelper.loadById(ShopVoucherGroupLoader, "shopVoucherGroupId"),
    },
  },
};
