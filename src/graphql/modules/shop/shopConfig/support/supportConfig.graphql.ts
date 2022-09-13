import { gql } from "apollo-server-express";
import _ from "lodash";
import { Schema } from "mongoose";

export type SupportConfig = {
  menu: any[]; // Thanh điều hướng
  hotline: string; // Điện thoại hỗ trợ
  email: string; // Email hỗ trợ
};

export const SupportConfigSchema = new Schema({
  menu: { type: [Schema.Types.Mixed], default: [] },
  hotline: { type: String },
  email: { type: String },
});

export default {
  schema: gql`
    type SupportConfig {
      "Thanh điều hướng"
      menu: [Mixed]
      "Điện thoại hỗ trợ"
      hotline: String
      "Email hỗ trợ"
      email: String
    }
    input SupportConfigInput {
      "Thanh điều hướng"
      menu: [Mixed]
      "Điện thoại hỗ trợ"
      hotline: String
      "Email hỗ trợ"
      email: String
    }
    extend type ShopConfig {
      supportConfig: SupportConfig
    }
    extend input UpdateShopConfigInput {
      supportConfig: SupportConfigInput
    }
  `,
  resolver: {
    SupportConfig: {
      menu: async (root: SupportConfig, args: any) => {
        if (_.isEmpty(root?.menu) == true) {
          return [
            { label: "Giới thiệu về tôi/nhà hàng", url: "" },
            { label: "Báo cáo sự cố đơn hàng", url: "" },
            { label: "Hướng dẫn sử dụng", url: "" },
            { label: "Chính sách và quy trình", url: "" },
          ];
        }
        return root.menu;
      },
    },
  },
};
