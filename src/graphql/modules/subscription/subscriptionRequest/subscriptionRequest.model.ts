import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
import { Plan } from "../subscription.model";
import { Payment, PaymentSchema } from "../../mixin/payment.graphql";
const Schema = mongoose.Schema;

export type ISubscriptionRequest = BaseDocument & {
  /** Mã chủ shop */
  memberId?: string;
  /** Tên yêu cầu */
  name?: string;
  /** Số tháng đăng ký */
  months?: number;
  /** Số ngày đăng ký */
  days?: number;
  /** Gói yêu cầu */
  plan?: Plan;
  /** Số tiền thanh toán */
  amount?: number;
  /** Thời gian hết hạn */
  expiredAt?: Date;
  /** Thanh toán */
  payment?: Payment;
};

const subscriptionRequestSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    months: { type: Number, required: true },
    days: { type: Number, default: 0 },
    plan: { type: String, required: true },
    amount: { type: Number, default: 0 },
    expiredAt: { type: Date, required: true },
    payment: { type: PaymentSchema, required: true },
  },
  { timestamps: true }
);

subscriptionRequestSchema.index({ name: "text" }, { weights: { name: 2 } });

export const SubscriptionRequestHook = new ModelHook<ISubscriptionRequest>(
  subscriptionRequestSchema
);
export const SubscriptionRequestModel: mongoose.Model<ISubscriptionRequest> = MainConnection.model(
  "SubscriptionRequest",
  subscriptionRequestSchema
);

export const SubscriptionRequestLoader = ModelLoader<ISubscriptionRequest>(
  SubscriptionRequestModel,
  SubscriptionRequestHook
);
