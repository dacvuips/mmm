import { gql } from "apollo-server-express";
import { Schema } from "mongoose";
import { Context } from "../../context";

export enum PaymentStatus {
  pending = "pending", // Đang chờ thanh toán
  partially_filled = "partially_filled", // Thanh toán một phần
  filled = "filled", // Thanh toán hết
  rejected = "rejected", // Từ chối thanh toán
}

export type PaymentLog = {
  message: string;
  createdAt: Date;
  meta: any;
};

export type Payment = {
  status?: PaymentStatus; // Trạng thái thanh toán
  method?: string; // Phương thức thanh toán
  filledAmount?: number; // Đã thanh toán
  meta?: any; // Dữ liệu kèm theo
  logs?: any[]; // Lịch sử thanh toán
};

export const PaymentSchema = new Schema({
  status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.pending },
  method: { type: String, required: true },
  filledAmount: { type: Number, default: 0 },
  meta: { type: Schema.Types.Mixed, default: {} },
  logs: { type: [Schema.Types.Mixed], default: [] },
});

export default {
  schema: gql`
    type Payment {
      "Trạng thái thanh toán"
      status: String
      "Phương thức thanh toán"
      method: String
      "Đã thanh toán"
      filledAmount: Float
      "Dữ liệu kèm theo"
      meta: Mixed
      "Lịch sử thanh toán"
      logs: [Mixed]
    }
  `,
  resolver: {},
};
