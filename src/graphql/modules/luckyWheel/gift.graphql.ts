import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { ROLES } from "../../../constants/role.const";
import { GraphQLHelper } from "../../../helpers/graphql.helper";
import { Context } from "../../context";

export enum GiftType { // Loại quà
  COMMISSION = "COMMISSION", // Hoa hồng
  VOUCHER = "VOUCHER", // Quà tặng
}

export type Gift = {
  _id?: string;
  code?: string; // mã quà
  name?: string; // tên quà
  desc?: string; // diển giải
  image?: string; // hình ảnh quà
  payPresent?: string; // phần thưởng
  qty?: number; // số lượng
  usedQty?: number; // đã sử dụng
  voucherId?: string; // mã eVoucher
  voucherQty?: number; // Số lượng voucher tặng
  voucherExpiredDay?: number; // Số ngày sử dụng
  type?: GiftType; // loại quà
  isLose?: boolean; // Loại thua
  commission?: number; // Hoa hồng
};

export const GiftSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String },
  image: { type: String },
  payPresent: { type: String },
  qty: { type: Number, default: 0 },
  usedQty: { type: Number, default: 0 },
  voucherId: { type: Schema.Types.ObjectId, ref: "ShopVoucher" },
  voucherQty: { type: Number, default: 0, min: 0 },
  voucherExpiredDay: { type: Number, default: 0, min: 0 },
  type: { type: String },
  isLose: { type: Boolean, default: true },
  commission: { type: Number, default: 0 },
});

export default {
  schema: gql`
    type Gift {
      id: ID
      "mã quà"
      code: String
      "tên quà"
      name: String
      "diển giải"
      desc: String
      "hình ảnh quà"
      image: String
      "phần thưởng"
      payPresent: String
      "số lượng"
      qty: Int
      "đã sử dụng"
      usedQty: Int
      "mã eVoucher"
      voucherId: ID
      "Số lượng voucher tặng"
      voucherQty: Int
      "Số ngày sử dụng"
      voucherExpiredDay: Int
      "loại quà ${Object.values(GiftType)}"
      type: String
      "Loại thua"
      isLose: Boolean
      "Hoa hồng"
      commission: Float
    }
    input GiftInput {
      "mã quà"
      code: String
      "tên quà"
      name: String
      "diển giải"
      desc: String
      "hình ảnh quà"
      image: String
      "phần thưởng"
      payPresent: String
      "số lượng"
      qty: Int
      "đã sử dụng"
      usedQty: Int
      "mã eVoucher"
      voucherId: ID
      "Số lượng voucher tặng"
      voucherQty: Int
      "Số ngày sử dụng"
      voucherExpiredDay: Int
      "loại quà ${Object.values(GiftType)}"
      type: String
      "Loại thua"
      isLose: Boolean
      "Hoa hồng"
      commission: Float
    }
  `,
  resolver: {
    Gift: {
      qty: GraphQLHelper.requireRoles(ROLES.MEMBER_STAFF, null),
      usedQty: GraphQLHelper.requireRoles(ROLES.MEMBER_STAFF, null),
    },
  },
};
