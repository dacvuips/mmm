import { gql } from "apollo-server-express";
import { Context } from "../../../../../context";
import { ROLES } from "../../../../../../constants/role.const";
import { shopVoucherService } from "../../shopVoucher.service";

export default {
  schema: gql`
    extend type Mutation {
      updateShopVoucherAdmin(id: ID!, data: UpdateShopVoucherAdminInput!): ShopVoucher
    }

    input UpdateShopVoucherAdminInput {
      "Mã nhóm khuyến mãi"
      shopVoucherGroupId: ID!
    }
  `,
  resolver: {
    Mutation: {
      updateShopVoucherAdmin: async (root: any, args: any, context: Context) => {
        context.auth([ROLES.ADMIN]);
        const { id, data } = args;
        return await shopVoucherService.updateOne(id, data);
      },
    },
  },
};
