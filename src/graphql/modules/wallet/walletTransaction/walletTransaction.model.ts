import mongoose from "mongoose";
import { MainConnection } from "../../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../../base/baseModel";
const Schema = mongoose.Schema;

export enum WalletTransactionType {
  DEPOSIT = "DEPOSIT", // Nạp tiền
  WITHDRAW = "WITHDRAW", // Rút tiền
  ADJUST = "ADJUST", // Điều chỉnh
  TRANSFER = "TRANSFER", // Chuyển Khoản
  RECEIVE = "RECEIVE", // Nhận tiền
}

export type IWalletTransaction = BaseDocument & {
  code?: string; // Mã giao dịch
  walletId: string; // Mã ví
  type: WalletTransactionType; // Loại giao dịch
  amount: number; // Số tiền
  note?: string; // Ghi chú
  tag?: string; //  Tag giao dịch
  extra?: any; // Thông tin bổ sung
  fromWalletId?: string; // Mã ví nguồn
  toWalletId?: string; // Mã ví đích
  labels?: string[]; // Nhãn
};

const walletTransactionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    walletId: { type: Schema.Types.ObjectId, required: true, ref: "Wallet" },
    type: { type: String, enum: Object.values(WalletTransactionType), required: true },
    amount: { type: Number, required: true },
    note: { type: String },
    tag: { type: String },
    extra: { type: Schema.Types.Mixed },
    fromWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    toWalletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    labels: { type: [String], default: [] },
  },
  { timestamps: true }
);

// walletTransactionSchema.index({ name: "text" }, { weights: { name: 2 } });
walletTransactionSchema.index({ walletId: 1 });
walletTransactionSchema.index({ walletId: 1, labels: 1 });

export const WalletTransactionHook = new ModelHook<IWalletTransaction>(walletTransactionSchema);
export const WalletTransactionModel: mongoose.Model<IWalletTransaction> = MainConnection.model(
  "WalletTransaction",
  walletTransactionSchema
);

export const WalletTransactionLoader = ModelLoader<IWalletTransaction>(
  WalletTransactionModel,
  WalletTransactionHook
);
