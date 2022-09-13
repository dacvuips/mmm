import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { Context } from "../../../context";

export enum MomoWalletStatus {
  none = "none", // Chưa có ví
  processing = "processing", // Đang xử lý
  invalid = "invalid", // Dữ liệu không hợp lệ
  wallet_invalid = "wallet_invalid", // Ví không hợp lệ
  walled_not_found = "walled_not_found", // Không tìm thấy ví
  valid = "valid", // Ví hợp lệs
}
export type CustomerMomoWallet = {
  status?: MomoWalletStatus; // Trạng thái
  statusMsg?: string; // Thông báo trạng thái
  phone?: string; // Số điện thoại
  idCard?: string; // Số CMND
  name?: string; // Tên
  submitAt?: Date; // Ngày tạo
  updateAt?: Date; // Ngày cập nhật
};

export const CustomerMomoWalletSchema = new Schema({
  status: { type: String, enum: Object.values(MomoWalletStatus), default: MomoWalletStatus.none },
  statusMsg: { type: String, default: "" },
  phone: { type: String },
  idCard: { type: String },
  name: { type: String },
  submitAt: { type: Date },
  updateAt: { type: Date },
});

export default {
  schema: gql`
    type CustomerMomoWallet {
      "Trạng thái ${Object.values(MomoWalletStatus)}"
      status: String
      "Thông báo trạng thái"
      statusMsg: String
      "Số điện thoại"
      phone: String
      "Số CMND"
      idCard: String
      "Tên"
      name: String
      "Ngày tạo"
      submitAt: DateTime
      "Ngày cập nhật"
      updateAt: DateTime
    }

    extend type Customer {
      "Ví Momo"
      momoWallet: CustomerMomoWallet
    }
  `,
  resolver: {},
};
