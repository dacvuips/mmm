import mongoose from "mongoose";
import { MainConnection } from "../../../loaders/database";
import { BaseDocument, ModelLoader, ModelHook } from "../../../base/baseModel";
import { Owner, OwnerSchema } from "../mixin/owner.graphql";
const Schema = mongoose.Schema;

export enum WalletType {
  POINT = "POINT", // Ví điểm
  CASH = "CASH", // Ví tiền mặt
}

export type IWallet = BaseDocument & {
  type?: string; // Loại ví
  balance?: number; // số dư
  owner?: Owner; // Người sở hữu
};

const walletSchema = new Schema(
  {
    type: { type: String, enum: Object.values(WalletType), required: true },
    balance: { type: Number, default: 0 },
    owner: { type: OwnerSchema, required: true },
  },
  { timestamps: true }
);

// walletSchema.index({ name: "text" }, { weights: { name: 2 } });

export const WalletHook = new ModelHook<IWallet>(walletSchema);
export const WalletModel: mongoose.Model<IWallet> = MainConnection.model("Wallet", walletSchema);

export const WalletLoader = ModelLoader<IWallet>(WalletModel, WalletHook);
