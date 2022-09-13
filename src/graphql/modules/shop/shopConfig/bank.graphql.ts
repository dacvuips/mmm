import { gql } from "apollo-server-express";
import _ from "lodash";
import { Schema } from "mongoose";
import { logger } from "../../../../loaders/logger";
import { Context } from "../../../context";
import { IShopConfig } from "./shopConfig.model";

export type Bank = {
  bankName?: string; // Tên ngân hàng
  ownerName?: string; // Tên chủ tk
  bankNumber?: string; // Số tài khoản ngân hàng
  branch?: string; // Chi nhánh
  note?: string; // Ghi chú cho KH
  active?: boolean; // Kích hoạt
};

export const BankSchema = new Schema({
  bankName: { type: String, required: true },
  ownerName: { type: String, required: true },
  bankNumber: { type: String, required: true },
  branch: { type: String },
  note: { type: String },
  active: { type: Boolean, default: false },
});

export default {
  schema: gql`
    type Bank {
      "Tên ngân hàng"
      bankName: String
      "Tên chủ tk"
      ownerName: String
      "Số tài khoản ngân hàng"
      bankNumber: String
      "Chi nhánh"
      branch: String
      "Ghi chú cho KH"
      note: String
      "Kích hoạt"
      active: Boolean
    }

    input BankInput {
      "Tên ngân hàng"
      bankName: String
      "Tên chủ tk"
      ownerName: String
      "Số tài khoản ngân hàng"
      bankNumber: String
      "Chi nhánh"
      branch: String
      "Ghi chú cho KH"
      note: String
      "Kích hoạt"
      active: Boolean
    }
  `,
  resolver: {
    ShopConfig: {
      banks: async (root: IShopConfig, args: any, context: Context) => {
        if (_.isEmpty(context.sellerId) == true) {
          return root.banks.filter((b) => b.active);
        }
        return root.banks;
      },
    },
  },
};
